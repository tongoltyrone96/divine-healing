import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart' show LaunchMode;

/// Thin wrapper around Supabase Auth.
///
/// Supports Google OAuth and email magic-link. Google needs the provider
/// enabled in the Supabase Dashboard (Authentication > Providers). Errors
/// surface upward so the UI can show a friendly message.
///
/// Microsoft was dropped at the client's request. The scope list in
/// CLAUDE.md still names all three; that entry is the stale one.
class AuthService {
  AuthService(this._client);

  final SupabaseClient _client;

  /// Where the provider sends the browser back to.
  ///
  /// On web that is the page the user started from. On a phone it has to be
  /// a scheme the OS can route to this app — passing null, as this did
  /// before, left the browser sitting on Supabase's callback page with no
  /// way back, so signing in appeared to do nothing.
  ///
  /// Registered in ios/Runner/Info.plist (CFBundleURLTypes) and in the
  /// Android manifest, and it must also be on the allow-list under
  /// Authentication > URL Configuration in the Supabase dashboard.
  static const _mobileRedirect = 'com.divinehealing.app://login-callback';

  String? get _redirectTo => kIsWeb ? Uri.base.origin : _mobileRedirect;

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
      emailRedirectTo: _redirectTo,
      shouldCreateUser: true,
    );
  }

  /// Kick off Google OAuth flow. On web the auth screen opens in a new tab
  /// so a provider-not-enabled error doesn't replace the main app.
  Future<bool> signInWithGoogle() async {
    return _client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: _redirectTo,
      authScreenLaunchMode: kIsWeb
          ? LaunchMode.externalApplication
          : LaunchMode.inAppBrowserView,
    );
  }

  Future<void> signOut() => _client.auth.signOut();
}
