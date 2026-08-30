import 'package:flutter/gestures.dart';
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, TargetPlatform;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
      _showError(_friendly(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
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
    final email = await _promptForEmail();
    if (email == null || email.isEmpty) return;

    setState(() => _busy = true);
    try {
      await svc.sendMagicLink(email);
      if (!mounted) return;
      _showInfo(
        'Sign-in link sent to $email. Check your inbox — and your spam '
        'folder if it does not arrive in a minute.',
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

  Future<String?> _promptForEmail() async {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign in with email'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Enter your email and we will send you a magic link.',
              style: DHTypography.body(size: 13, color: DHColors.secondary),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              autofocus: true,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                hintText: 'you@example.com',
                border: OutlineInputBorder(),
              ),
              onSubmitted: (v) =>
                  Navigator.pop(ctx, v.trim().isEmpty ? null : v.trim()),
            ),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, null),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final v = controller.text.trim();
              Navigator.pop(ctx, v.isEmpty ? null : v);
            },
            child: const Text('Send link'),
          ),
        ],
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
