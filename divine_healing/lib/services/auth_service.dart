import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart' show LaunchMode;

/// Thin wrapper around Supabase Auth.
///
/// Supports Google + Microsoft (Azure) OAuth and email magic-link. Providers
/// beyond email require the corresponding provider to be enabled in the
/// Supabase Dashboard (Authentication > Providers). Errors surface upward so
/// the UI can show a friendly message.
class AuthService {
  AuthService(this._client);

  final SupabaseClient _client;

  /// Current auth user, or null if not signed in.
  User? get currentUser => _client.auth.currentUser;

  /// Broadcasts on sign-in / sign-out / token refresh.
  Stream<AuthState> get onAuthStateChange => _client.auth.onAuthStateChange;

  /// Send a one-time magic link to [email]. User clicks the link in their
  /// inbox and is signed in when they land back in the app.
  ///
  /// Redirect target defaults to the current web origin, which Supabase must
  /// have whitelisted under Authentication > URL Configuration.
  Future<void> sendMagicLink(String email) async {
    await _client.auth.signInWithOtp(
      email: email,
      emailRedirectTo: kIsWeb ? Uri.base.origin : null,
      shouldCreateUser: true,
    );
  }

  /// Kick off Google OAuth flow. On web the auth screen opens in a new tab
  /// so a provider-not-enabled error doesn't replace the main app.
  Future<bool> signInWithGoogle() async {
    return _client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: kIsWeb ? Uri.base.origin : null,
      authScreenLaunchMode:
          kIsWeb ? LaunchMode.externalApplication : LaunchMode.platformDefault,
    );
  }

  /// Kick off Microsoft (Azure AD) OAuth flow.
  Future<bool> signInWithMicrosoft() async {
    return _client.auth.signInWithOAuth(
      OAuthProvider.azure,
      redirectTo: kIsWeb ? Uri.base.origin : null,
      scopes: 'email openid profile',
      authScreenLaunchMode:
          kIsWeb ? LaunchMode.externalApplication : LaunchMode.platformDefault,
    );
  }

  Future<void> signOut() => _client.auth.signOut();
}
