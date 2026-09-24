import 'package:flutter/gestures.dart';
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, TargetPlatform;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart' show AuthException;

import '../../config/env.dart';
import '../../providers/auth_providers.dart';
import '../../theme.dart';

/// Sign In — Google, Apple (iOS only) and email magic link.
///
/// OAuth providers must be enabled in the Supabase Dashboard (Authentication
/// > Providers). Email magic-link uses Supabase's default SMTP.
class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    // If we landed here via auth redirect with an error, surface it once.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final params = GoRouterState.of(context).uri.queryParameters;
      final err = params['auth_error'];
      if (err != null && err.isNotEmpty) {
        _showError('Sign-in failed: $err. Please request a new link.');
      }
    });
  }

  Future<void> _handleApple() async {
    final svc = _requireAuth();
    if (svc == null) return;
    setState(() => _busy = true);
    try {
      await svc.signInWithApple();
    } catch (e) {
      // Deliberately not _friendly(). Two people tried Sign in with Apple,
      // Face ID and then their passcode, and saw nothing at all — the
      // generic message hid which step Apple refused, and there was no way
      // to tell from the outside. Whatever comes back here is shown.
      _showError(_appleError(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  /// Apple's own words where we have them, and something identifiable where
  /// we do not — never a bare "something went wrong".
  String _appleError(Object e) {
    final text = e is AuthException ? e.message : e.toString();
    if (text.toLowerCase().contains('apple could not sign you in')) return text;
    if (text.toLowerCase().contains('nonce')) {
      return 'Apple rejected the sign-in for a security check. Please try '
          'again, or use email.';
    }
    final trimmed = text.replaceAll(RegExp(r'\s+'), ' ').trim();
    return 'Sign in with Apple failed: '
        '${trimmed.length > 120 ? '${trimmed.substring(0, 120)}…' : trimmed}';
  }

  Future<void> _handleGoogle() async {
    final svc = _requireAuth();
    if (svc == null) return;
    setState(() => _busy = true);
    try {
      await svc.signInWithGoogle();
      // On success, browser redirects to Supabase → back to app; auth state
      // provider picks up the session. Nothing else to do here.
    } catch (e) {
      _showError(_friendly(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _handleEmail() async {
    final svc = _requireAuth();
    if (svc == null) return;
    final entered = await _promptForEmail();
    if (entered == null) return;

    setState(() => _busy = true);
    try {
      final password = entered.password;
      if (password != null) {
        await svc.signInWithPassword(email: entered.email, password: password);
        // The auth state provider picks the session up; nothing to show.
        return;
      }
      await svc.sendMagicLink(entered.email);
      if (!mounted) return;
      _showInfo(
        'Sign-in link sent to ${entered.email}. Check your inbox — and your '
        'spam folder if it does not arrive in a minute.',
      );
    } catch (e) {
      _showError(_friendly(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  dynamic _requireAuth() {
    if (!Env.hasSupabase) {
      _showError('Supabase is not configured for this build.');
      return null;
    }
    return ref.read(authServiceProvider);
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.info_outline, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text(msg)),
          ],
        ),
        backgroundColor: DHColors.strawberryBlush,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(DHRadius.card),
        ),
        duration: const Duration(seconds: 5),
      ),
    );
  }

  void _showInfo(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.mark_email_read_outlined,
                color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text(msg)),
          ],
        ),
        backgroundColor: DHColors.forestGreen,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(DHRadius.card),
        ),
        duration: const Duration(seconds: 6),
      ),
    );
  }

  String _friendly(Object e) {
    final s = e.toString().toLowerCase();
    // Named before the generic fallback for a reason. App Review tapped
    // Sign in with credentials that no longer matched an account, and this
    // fell through to "Something went wrong" — which reads as a broken app
    // rather than a wrong password, and cost build 23 a 2.1(a) rejection.
    if (s.contains('invalid login credentials') ||
        s.contains('invalid_credentials')) {
      return 'That email and password do not match an account. Check the '
          'password, or leave it blank and we will send a sign-in link.';
    }
    if (s.contains('email not confirmed')) {
      return 'That account has not been confirmed yet. Use the sign-in link '
          'instead.';
    }
    if (s.contains('over_email_send_rate_limit') ||
        s.contains('email rate limit')) {
      return 'Too many attempts. Please wait a few minutes before trying again.';
    }
    if (s.contains('otp_expired') || s.contains('link is invalid')) {
      return 'That link has expired. Please request a new one.';
    }
    if (s.contains('provider is not enabled')) {
      return 'This sign-in option is not available yet — please use email.';
    }
    if (s.contains('redirect_uri')) {
      return 'App redirect not configured. Please contact support.';
    }
    if (s.contains('invalid') && s.contains('email')) {
      return 'Please enter a valid email address.';
    }
    if (s.contains('network') || s.contains('failed host lookup')) {
      return 'Network issue — please check your connection and try again.';
    }
    // Generic fallback — do NOT expose raw exception text to end users.
    return 'Something went wrong. Please try again in a moment.';
  }

  /// Email, and optionally a password.
  ///
  /// The magic link is still how people get in — nothing in the app sets a
  /// password. The field is here because both stores require reviewer
  /// credentials for an app with paid content, and a reviewer cannot receive
  /// a link sent to somebody else's inbox.
  Future<({String email, String? password})?> _promptForEmail() async {
    final emailController = TextEditingController();
    final passwordController = TextEditingController();
    return showDialog<({String email, String? password})>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) {
          final email = emailController.text.trim();
          final password = passwordController.text;
          void send() {
            if (email.isEmpty) return;
            Navigator.pop(
              ctx,
              (email: email, password: password.isEmpty ? null : password),
            );
          }

          return AlertDialog(
            title: const Text('Sign in with email'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Enter your email and we will send you a link. If you '
                  'already have a password, enter it instead.',
                  style: DHTypography.body(size: 13, color: DHColors.secondary),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: emailController,
                  autofocus: true,
                  keyboardType: TextInputType.emailAddress,
                  onChanged: (_) => setDialogState(() {}),
                  decoration: const InputDecoration(
                    hintText: 'you@example.com',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: passwordController,
                  obscureText: true,
                  onChanged: (_) => setDialogState(() {}),
                  onSubmitted: (_) => send(),
                  decoration: const InputDecoration(
                    labelText: 'Password (optional)',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, null),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: email.isEmpty ? null : send,
                child: Text(password.isEmpty ? 'Send link' : 'Sign in'),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sign in'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 12),
                  Center(
                    child: Image.asset(
                      'assets/logo/client_logo.png',
                      width: 180,
                      height: 180,
                      fit: BoxFit.contain,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('Welcome',
                      style: DHTypography.heading(size: 24),
                      textAlign: TextAlign.center),
                  const SizedBox(height: 6),
                  Text(
                    'Sign in to sync your favourites, journal entries, '
                    'and continue where you left off.',
                    style: DHTypography.body(
                        size: 13, color: DHColors.secondary),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  _ProviderButton(
                    icon: _googleIcon(),
                    label: 'Continue with Google',
                    onPressed: _busy ? null : _handleGoogle,
                  ),
                  // iOS only. Apple mandates this button wherever another
                  // provider is offered; on Android it would just be a web
                  // sheet nobody asked for.
                  if (defaultTargetPlatform == TargetPlatform.iOS) ...[
                    const SizedBox(height: 12),
                    _ProviderButton(
                      icon: const Icon(Icons.apple, size: 22, color: Colors.black),
                      label: 'Continue with Apple',
                      onPressed: _busy ? null : _handleApple,
                    ),
                  ],
                  const SizedBox(height: 12),
                  _ProviderButton(
                    icon: const Icon(Icons.mail_outline,
                        size: 20, color: DHColors.forestGreen),
                    label: 'Continue with Email',
                    onPressed: _busy ? null : _handleEmail,
                  ),
                  const SizedBox(height: 28),
                  Row(
                    children: [
                      Expanded(
                        child: Divider(
                            color: DHColors.sunlightGold.withOpacity(0.4),
                            thickness: 1),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text('or',
                            style: DHTypography.caption(
                                color: DHColors.secondary)),
                      ),
                      Expanded(
                        child: Divider(
                            color: DHColors.sunlightGold.withOpacity(0.4),
                            thickness: 1),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  OutlinedButton(
                    onPressed: _busy ? null : () => context.go('/'),
                    child: const Text('Continue as guest'),
                  ),
                  const SizedBox(height: 28),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: DHTypography.caption(color: DHColors.secondary),
                      children: [
                        const TextSpan(text: 'By continuing you agree to our '),
                        TextSpan(
                          text: 'Terms of Service',
                          style: DHTypography.caption(
                                  color: DHColors.forestGreen)
                              .copyWith(
                                  decoration: TextDecoration.underline,
                                  fontWeight: FontWeight.w600),
                          recognizer: TapGestureRecognizer()
                            ..onTap = () => context.push('/terms'),
                        ),
                        const TextSpan(text: ' and '),
                        TextSpan(
                          text: 'Privacy Policy',
                          style: DHTypography.caption(
                                  color: DHColors.forestGreen)
                              .copyWith(
                                  decoration: TextDecoration.underline,
                                  fontWeight: FontWeight.w600),
                          recognizer: TapGestureRecognizer()
                            ..onTap = () => context.push('/privacy'),
                        ),
                        const TextSpan(text: '.'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            if (_busy)
              Container(
                color: Colors.black.withOpacity(0.15),
                child: const Center(child: CircularProgressIndicator()),
              ),
          ],
        ),
      ),
    );
  }

  Widget _googleIcon() => Container(
        width: 22,
        height: 22,
        alignment: Alignment.center,
        decoration: const BoxDecoration(shape: BoxShape.circle),
        child: const Text(
          'G',
          style: TextStyle(
            fontFamily: 'sans-serif',
            fontWeight: FontWeight.w700,
            fontSize: 16,
            color: Color(0xFF4285F4),
            height: 1.0,
          ),
        ),
      );

}

class _ProviderButton extends StatelessWidget {
  const _ProviderButton({
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  final Widget icon;
  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        style: OutlinedButton.styleFrom(
          foregroundColor: DHColors.primary,
          backgroundColor: Colors.white,
          side: BorderSide(color: DHColors.sunlightGold.withOpacity(0.4)),
          padding:
              const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(DHRadius.button),
          ),
        ),
        onPressed: onPressed,
        child: Row(
          children: [
            SizedBox(width: 22, height: 22, child: Center(child: icon)),
            const SizedBox(width: 14),
            Expanded(
              child: Text(label,
                  style: DHTypography.button(
                      size: 14, color: DHColors.forestGreen)),
            ),
            const Icon(Icons.chevron_right,
                size: 18, color: DHColors.secondary),
          ],
        ),
      ),
    );
  }
}
