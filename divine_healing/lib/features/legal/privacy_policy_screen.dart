import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../config/support.dart';
import '../../theme.dart';

/// Privacy Policy — required by Apple App Store, Google Play, Google OAuth
/// verification, and general data-protection laws (GDPR / CCPA).
///
/// This is a v1 draft using standard wellness-app template language.
/// The client should review with a lawyer before public launch if targeting
/// EU / California / other regulated markets.
class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  static const _effectiveDate = 'August 27, 2026';
  // One definition, in config/support.dart.
  static const _contactEmail = Support.email;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Privacy Policy',
                  style: DHTypography.heading(size: 26, weight: FontWeight.w600)),
              const SizedBox(height: 6),
              Text('Effective date: $_effectiveDate',
                  style: DHTypography.body(size: 12, color: DHColors.secondary)),
              const SizedBox(height: 20),
              _p(
                'Divine Awakening (the "App") is operated by Strawberry Hope '
                '("we", "us", "our"). We respect your privacy and are '
                'committed to protecting your personal data. This policy '
                'explains what we collect, why, and how we handle it.',
              ),
              _h('1. Information we collect'),
              _b('Account information', 'Your email address, name (if '
                  'provided by your sign-in provider), and profile photo (if '
                  'shared through Google sign-in). Signing in with Apple '
                  'shares an email address and, on first sign-in only, a '
                  'name.'),
              _b('Content you create', 'Journal entries from Shadow Work, '
                  'manifestation exercise answers, saved affirmations, and '
                  'session completion records.'),
              _b('Subscription data', 'Plan type (Monthly / Annual / Free), '
                  'subscription status, and billing period. Payment card '
                  'details are handled by the App Store, Google Play, or '
                  'Stripe and are never stored on our servers.'),
              _b('Technical data', 'Device type, operating system version, '
                  'app version, and anonymous crash reports used to fix bugs.'),
              _h('2. How we use your information'),
              _bullet('Provide guided content and audio sessions.'),
              _bullet('Sync your favourites and journal across your devices.'),
              _bullet('Track your session progress and streaks.'),
              _bullet('Send you the sign-in link when you request one.'),
              _bullet('Process subscription payments and confirmations.'),
              _bullet('Improve the App by fixing bugs and adding features.'),
              _h('3. Third parties we use'),
              _b('Supabase', 'Stores your account and content on secure '
                  'servers in Northeast Asia (Tokyo).'),
              _b('Brevo', 'Sends transactional emails such as the sign-in '
                  'magic link.'),
              _b('Google and Apple', 'Handle authentication if you '
                  'sign in with either provider. Apple offers Hide My '
                  'Email, which gives us a relay address instead of '
                  'your own; the App works the same either way.'),
              _b('Apple App Store, Google Play, Stripe', 'Handle subscription '
                  'payments and receipt validation.'),
              _b('Vercel', 'Serves the web version of the App.'),
              _h('4. Data retention'),
              _p(
                'We keep your account data for as long as your account is '
                'active. If you cancel your subscription your content remains '
                'available. If you delete your account we remove all your '
                'personal data within 30 days.',
              ),
              _h('5. Your rights'),
              _p(
                'You have the right to access, correct, export, or delete '
                'your personal data. To exercise any of these rights, contact '
                'us at $_contactEmail. We respond within 30 days.',
              ),
              _h('6. Children'),
              _p(
                'Divine Awakening is not intended for children under 13. We do '
                'not knowingly collect data from anyone under 13. If we '
                'discover we have, we delete it immediately.',
              ),
              _h('7. Security'),
              _p(
                'We use industry-standard encryption in transit (HTTPS) and '
                'at rest. Access to your data on our servers is restricted '
                'and audited. No system is perfectly secure, so please use a '
                'strong password if you sign in with email.',
              ),
              _h('8. International transfers'),
              _p(
                'Our servers are hosted in Japan. By using the App you agree '
                'that your data may be processed in that country.',
              ),
              _h('9. Changes to this policy'),
              _p(
                'We may update this policy from time to time. Material '
                'changes will be highlighted in the App and by email. '
                'Continued use after an update means you accept the changes.',
              ),
              _h('10. Contact us'),
              _p(
                'Questions or concerns? Reach us at $_contactEmail. We '
                'usually reply within a few business days.',
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: DHColors.sandstone.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(DHRadius.card),
                ),
                child: Text(
                  'This policy is provided as-is and does not constitute '
                  'legal advice. Consult a lawyer for jurisdiction-specific '
                  'requirements (GDPR, CCPA, PIPEDA, etc.).',
                  style: DHTypography.caption(color: DHColors.secondary),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _h(String title) => Padding(
        padding: const EdgeInsets.only(top: 22, bottom: 8),
        child: Text(title, style: DHTypography.heading(size: 17)),
      );

  Widget _p(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Text(text,
            style: DHTypography.body(size: 14, height: 1.6)),
      );

  Widget _b(String bold, String rest) => Padding(
        padding: const EdgeInsets.only(bottom: 10, left: 4),
        child: RichText(
          text: TextSpan(
            style: DHTypography.body(size: 14, height: 1.6),
            children: [
              TextSpan(
                  text: '$bold. ',
                  style: DHTypography.body(size: 14, weight: FontWeight.w700)),
              TextSpan(text: rest),
            ],
          ),
        ),
      );

  Widget _bullet(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 6, left: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 9, right: 10),
              child: Container(
                width: 4,
                height: 4,
                decoration: const BoxDecoration(
                    color: DHColors.sunlightGold, shape: BoxShape.circle),
              ),
            ),
            Expanded(
                child: Text(text,
                    style: DHTypography.body(size: 14, height: 1.55))),
          ],
        ),
      );
}
