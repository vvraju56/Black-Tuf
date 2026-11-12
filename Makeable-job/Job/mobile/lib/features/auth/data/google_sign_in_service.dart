import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_sign_in/google_sign_in.dart';

/// Signs the user in with Google via Firebase Auth and returns the Firebase
/// ID token, which the backend verifies with the Firebase Admin SDK at
/// `POST /auth/google`.
class GoogleSignInService {
  GoogleSignInService({FirebaseAuth? auth, GoogleSignIn? googleSignIn})
      : _auth = auth ?? FirebaseAuth.instance,
        _google = googleSignIn ??
            GoogleSignIn(
              scopes: [
                'email',
                'profile',
                'openid',
              ],
            );

  final FirebaseAuth _auth;
  final GoogleSignIn _google;

  /// Returns null if the user cancelled the sign-in dialog.
  Future<String?> getIdToken() async {
    try {
      final account = await _google.signIn();
      if (account == null) return null;

      final auth = await account.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: auth.accessToken,
        idToken: auth.idToken,
      );
      final result = await _auth.signInWithCredential(credential);
      final idToken = await result.user?.getIdToken();
      if (idToken == null) {
        throw Exception('Failed to obtain Firebase ID token');
      }
      return idToken;
    } on FirebaseAuthException catch (e) {
      debugPrint('[GoogleSignIn] auth error: ${e.code} ${e.message}');
      throw Exception(_friendlyAuthError(e));
    } on PlatformException catch (e) {
      debugPrint('[GoogleSignIn] platform error: $e');
      if (e.code == 'sign_in_canceled' ||
          e.code == 'sign_in_cancelled' ||
          e.code == 'canceled') {
        return null;
      }
      throw Exception('Google sign-in failed. Is the SHA-1 registered in Firebase?');
    } catch (e) {
      debugPrint('[GoogleSignIn] unexpected error: $e');
      throw Exception('Google sign-in failed. Please try again.');
    }
  }

  String _friendlyAuthError(FirebaseAuthException e) {
    switch (e.code) {
      case 'invalid-credential':
        return 'Google sign-in failed. Check Firebase SHA-1 configuration.';
      case 'user-cancelled':
        return '';
      default:
        return 'Google sign-in failed. Please try again.';
    }
  }
}