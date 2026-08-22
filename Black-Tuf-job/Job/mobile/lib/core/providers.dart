import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../features/auth/data/google_sign_in_service.dart';
import 'network/api_client.dart';
import 'storage/token_storage.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());

final apiClientProvider = Provider<ApiClient>(
  (ref) => ApiClient(tokenStorage: ref.watch(tokenStorageProvider)),
);

final googleSignInServiceProvider =
    Provider<GoogleSignInService>((ref) => GoogleSignInService());