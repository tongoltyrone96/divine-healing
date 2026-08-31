import 'dart:convert' show utf8;
import 'dart:math' show Random;

import 'package:crypto/crypto.dart' show sha256;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart' show LaunchMode;

/// Thin wrapper around Supabase Auth.
///
/// Supports Google and Apple OAuth, and email magic-link. Google needs the provider
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

  /// Apple requires Sign in with Apple wherever a third-party sign-in is
  /// offered, so the Google button obliges us to carry this one.
  ///
  /// On iOS this must be the system sheet, not a web page. Apple's guidelines
  /// call for the native flow, and a browser round-trip for a provider the
  /// device can authenticate locally is a poor experience besides. Elsewhere
  /// the OAuth path stands, though nothing shows the button there.
  Future<bool> signInWithApple() async {
    if (kIsWeb || defaultTargetPlatform != TargetPlatform.iOS) {
      return _client.auth.signInWithOAuth(
        OAuthProvider.apple,
        redirectTo: _redirectTo,
        authScreenLaunchMode: kIsWeb
            ? LaunchMode.externalApplication
            : LaunchMode.inAppBrowserView,
      );
    }

    // Apple signs the nonce's hash into the token; Supabase is given the raw
    // value and checks it matches. Without the pair, a token lifted from one
    // session could be replayed into another.
    final rawNonce = _randomNonce();
    final hashedNonce = sha256.convert(utf8.encode(rawNonce)).toString();

    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: const [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        nonce: hashedNonce,
      );
      final idToken = credential.identityToken;
      if (idToken == null) {
        throw const AuthException(
          'Apple did not return an identity token. Please try again.',
        );
      }
      await _client.auth.signInWithIdToken(
        provider: OAuthProvider.apple,
        idToken: idToken,
        nonce: rawNonce,
      );
      return true;
    } on SignInWithAppleAuthorizationException catch (e) {
      // Dismissing the sheet is a decision, not a failure. Reporting it as an
      // error would put a red banner in front of someone who just changed
      // their mind.
      if (e.code == AuthorizationErrorCode.canceled) return false;
      rethrow;
    }
  }

  /// Apple accepts the characters listed in its own nonce example; anything
  /// outside that set is rejected on some iOS versions.
  static String _randomNonce([int length = 32]) {
    const chars =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._';
    final random = Random.secure();
    return List.generate(length, (_) => chars[random.nextInt(chars.length)])
        .join();
  }

  /// Signs in an account that has a password set.
  ///
  /// Both stores require reviewer credentials for an app with paid content,
  /// and neither can receive a magic link — they have no access to the
  /// inbox. Passwords are set server-side by data/23_make_review_account.js;
  /// nothing in the app creates one, so the magic link remains the only way
  /// an ordinary person gets an account.
  Future<void> signInWithPassword({
    required String email,
    required String password,
  }) async {
    await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signOut() => _client.auth.signOut();
}
