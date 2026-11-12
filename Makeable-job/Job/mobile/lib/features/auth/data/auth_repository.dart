import '../../../core/network/api_client.dart';
import '../models/user.dart';

/// Tokens returned by login/register/refresh.
class AuthTokens {
  const AuthTokens({required this.accessToken, required this.refreshToken});

  final String accessToken;
  final String refreshToken;

  factory AuthTokens.fromJson(Map<String, dynamic> json) => AuthTokens(
        accessToken: json['access_token'] as String,
        refreshToken: (json['refresh_token'] as String?) ?? '',
      );
}

class AuthRepository {
  AuthRepository(this._api);

  final ApiClient _api;

  Future<AuthTokens> login({
    required String email,
    required String password,
  }) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/auth/login',
      data: {'email': email, 'password': password},
    );
    return AuthTokens.fromJson(response.data!);
  }

  Future<AuthTokens> register({
    required String email,
    required String password,
    String? name,
  }) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/auth/register',
      data: {
        'email': email,
        'password': password,
        if (name != null && name.isNotEmpty) 'name': name,
      },
    );
    return AuthTokens.fromJson(response.data!);
  }

  Future<AuthTokens> googleLogin({required String idToken}) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/auth/google',
      data: {'id_token': idToken},
    );
    return AuthTokens.fromJson(response.data!);
  }

  Future<AuthTokens> refresh(String refreshToken) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/auth/refresh',
      data: {'refresh_token': refreshToken},
    );
    return AuthTokens.fromJson(response.data!);
  }

  Future<User> me() async {
    final response = await _api.get<Map<String, dynamic>>('/auth/me');
    return User.fromJson(response.data!);
  }

  Future<User> updateProfile({
    String? name,
    String? headline,
    String? bio,
    String? location,
    List<String>? skills,
    int? experienceYears,
  }) async {
    final response = await _api.patch<Map<String, dynamic>>(
      '/users/me',
      data: {
        if (name != null) 'name': name,
        if (headline != null) 'headline': headline,
        if (bio != null) 'bio': bio,
        if (location != null) 'location': location,
        if (skills != null) 'skills': skills,
        if (experienceYears != null) 'experience': experienceYears,
      },
    );
    return User.fromJson(response.data!);
  }
}