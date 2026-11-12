import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../storage/token_storage.dart';

/// The verified production API. A non-production endpoint must be supplied
/// explicitly at build time, for example:
/// `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000/api/v1`.
const String kProductionApiBaseUrl =
    'https://makeable-jobs-api.onrender.com/api/v1';
const String kApiBaseUrl =
    String.fromEnvironment('API_BASE_URL', defaultValue: kProductionApiBaseUrl);

String apiErrorMessage(Object error, {bool isAuthenticationRequest = false}) {
  if (error is! DioException) {
    return 'Something went wrong. Please try again.';
  }

  switch (error.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
    case DioExceptionType.transformTimeout:
      return 'Server temporarily unavailable. Please try again.';
    case DioExceptionType.connectionError:
      return 'No internet connection. Check Wi-Fi or mobile data and try again.';
    case DioExceptionType.badCertificate:
      return 'Secure connection failed. Check your device date and network.';
    case DioExceptionType.cancel:
      return 'Request cancelled. Please try again.';
    case DioExceptionType.badResponse:
      final status = error.response?.statusCode;
      if (status == 401) {
        return isAuthenticationRequest
            ? 'Invalid email or password.'
            : 'Your login session expired. Please sign in again.';
      }
      if (status == 403) return 'You do not have permission to do that.';
      if (status == 404) {
        return 'Server configuration error. Please update the app.';
      }
      if (status == 422) return 'Please check the information you entered.';
      if (status == 429) return 'Too many requests. Please wait a moment.';
      if (status != null && status >= 500) {
        return 'Server temporarily unavailable. Please try again.';
      }
      return 'The server could not process this request.';
    case DioExceptionType.unknown:
      return 'Network connection failed. Please try again.';
  }
}

/// Dio wrapper that:
///  - attaches the Bearer access token to every request,
///  - transparently refreshes the token once when a request returns 401,
///  - clears the session (via [onLogout]) when refresh fails.
class ApiClient {
  ApiClient({required TokenStorage tokenStorage})
      : _tokenStorage = tokenStorage {
    final uri = Uri.tryParse(kApiBaseUrl);
    if (uri == null || !uri.hasScheme || uri.host.isEmpty) {
      throw StateError('API_BASE_URL must be a complete http(s) URL.');
    }
    if (uri.scheme != 'http' && uri.scheme != 'https') {
      throw StateError('API_BASE_URL must use http or https.');
    }
    if (kReleaseMode && uri.scheme != 'https') {
      throw StateError('Release builds require an HTTPS API_BASE_URL.');
    }

    final baseOptions = BaseOptions(
      baseUrl: kApiBaseUrl,
      connectTimeout: const Duration(seconds: 20),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    );

    dio = Dio(baseOptions);
    _refreshDio = Dio(baseOptions);

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.readAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (kDebugMode) {
            final request = error.requestOptions;
            debugPrint(
              '[MakeableJobs API] ${request.method} ${request.uri.path} '
              'failed type=${error.type} status=${error.response?.statusCode}',
            );
          }
          final status = error.response?.statusCode;
          final retried = error.requestOptions.extra['_retried'] == true;
          final isAuthPath =
              error.requestOptions.path.contains('/auth/login') ||
                  error.requestOptions.path.contains('/auth/register') ||
                  error.requestOptions.path.contains('/auth/refresh');

          if (status == 401 && !retried && !isAuthPath) {
            error.requestOptions.extra['_retried'] = true;
            final refreshed = await _tryRefresh();
            if (refreshed) {
              final token = await _tokenStorage.readAccessToken();
              if (token != null) {
                error.requestOptions.headers['Authorization'] = 'Bearer $token';
              }
              try {
                final response = await _refreshDio.fetch(error.requestOptions);
                handler.resolve(response);
                return;
              } on DioException catch (retryError) {
                handler.next(retryError);
                return;
              }
            }
            onLogout?.call();
          }
          handler.next(error);
        },
      ),
    );
  }

  late final Dio dio;
  late final Dio _refreshDio;
  final TokenStorage _tokenStorage;

  /// Invoked when the session can no longer be refreshed (401 + failed
  /// refresh). Wired to the auth controller so the app logs out.
  void Function()? onLogout;

  Future<bool> _tryRefresh() async {
    final refreshToken = await _tokenStorage.readRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) return false;
    try {
      final response = await _refreshDio.post(
        '/auth/refresh',
        data: {'refresh_token': refreshToken},
      );
      final data = response.data;
      if (data is! Map<String, dynamic>) return false;
      final access = data['access_token'];
      if (access is! String || access.isEmpty) return false;
      final returnedRefresh = data['refresh_token'];
      final refresh = returnedRefresh is String && returnedRefresh.isNotEmpty
          ? returnedRefresh
          : refreshToken;
      await _tokenStorage.saveTokens(access: access, refresh: refresh);
      return true;
    } catch (_) {
      await _tokenStorage.clear();
      return false;
    }
  }

  // Convenience helpers ------------------------------------------------------

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? query}) {
    return dio.get<T>(path, queryParameters: query);
  }

  Future<Response<T>> post<T>(String path, {Object? data}) {
    return dio.post<T>(path, data: data);
  }

  Future<Response<T>> patch<T>(String path, {Object? data}) {
    return dio.patch<T>(path, data: data);
  }

  Future<Response<T>> delete<T>(String path, {Object? data}) {
    return dio.delete<T>(path, data: data);
  }
}
