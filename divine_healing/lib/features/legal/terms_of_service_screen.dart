import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../config/support.dart';
import '../../theme.dart';

/// Terms of Service — sets out the contract between the user and
/// Strawberry Hope. Client should have this reviewed by a lawyer before
/// public launch in regulated markets.
class TermsOfServiceScreen extends StatelessWidget {
  const TermsOfServiceScreen({super.key});

  static const _effectiveDate = 'August 27, 2026';
  // One definition, in config/support.dart.
  static const _contactEmail = Support.email;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Terms of Service'),
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
              Text('Terms of Service',
                  style: DHTypography.heading(size: 26, weight: FontWeight.w600)),
              const SizedBox(height: 6),
              Text('Effective date: $_effectiveDate',
                  style: DHTypography.body(size: 12, color: DHColors.secondary)),
              const SizedBox(height: 20),
              _p(
                'Welcome to Divine Awakening. These Terms of Service ("Terms") '
                'govern your use of the Divine Awakening app and website '
                '(collectively, the "Service") operated by Strawberry Hope. '
                'By using the Service you agree to these Terms.',
              ),
              _h('1. About the Service'),
              _p(
                'Divine Awakening offers guided meditations, shadow work '
                'sessions, chakra healing, Reiki, and related wellness '
                'content. Some content is free; the rest requires an active '
                'subscription.',
              ),
              _h('2. Your account'),
              _p(
                'You need a Divine Awakening account to access most features. '
                'You are responsible for keeping your sign-in method secure '
                'and for all activity on your account. Notify us at '
                '$_contactEmail if you suspect unauthorised use.',
              ),
              _h('3. Subscriptions and payment'),
              _b('Plans', 'We offer Monthly and Annual subscriptions in CAD. '
                  'Prices are shown in the App and may change with notice.'),
              _b('Free trial', 'New subscribers may receive a 7-day free '
                  'trial. Cancel before it ends to avoid being charged.'),
              _b('Auto-renewal', 'Subscriptions renew automatically at the '
                  'end of each billing period unless cancelled at least 24 '
                  'hours before the renewal date.'),
              _b('Cancellations', 'You can cancel at any time from your '
                  'App Store or Google Play account settings. Access '
                  'continues until the end of the paid period.'),
              _b('Refunds', 'Refunds are handled by Apple, Google, or Stripe '
                  'according to their policies. Contact them directly to '
                  'request one.'),
              _h('4. Health and medical disclaimer'),
              _p(
                'Divine Awakening is a wellness tool, not medical advice. Our '
                'content is not intended to diagnose, treat, cure, or '
                'prevent any medical or mental-health condition. Consult a '
                'qualified professional for any health concern. If you are '
                'in crisis, contact your local emergency services.',
              ),
              _h('5. Acceptable use'),
              _p(
                'You agree not to:',
              ),
              _bullet('Reverse-engineer, copy, or resell any part of the App.'),
              _bullet('Share your account with anyone else.'),
              _bullet('Use the Service in a way that could damage or '
                  'overload our servers.'),
              _bullet('Upload harmful, illegal, or infringing content in '
                  'your journal entries.'),
              _h('6. Intellectual property'),
              _p(
                'All content in the App — audio recordings, text, images, '
                'artwork, logo — is owned by Strawberry Hope or its '
                'licensors and protected by copyright. Your journal entries '
                'and personal responses remain yours; we do not claim '
                'ownership of them.',
              ),
              _h('7. Booking sessions with Strawberry Hope'),
              _p(
                'The App includes a link to book one-on-one sessions '
                '(coaching, Reiki, healing) directly with Strawberry Hope. '
                'Those bookings are governed by a separate agreement made '
                'when you schedule the session.',
              ),
              _h('8. Termination'),
              _p(
                'You may stop using the Service at any time. We may suspend '
                'or terminate accounts that violate these Terms, with or '
                'without notice. On termination your subscription ends and '
                'access to paid content is removed.',
              ),
              _h('9. Limitation of liability'),
              _p(
                'To the maximum extent permitted by law, Strawberry Hope is '
                'not liable for indirect, incidental, or consequential '
                'damages arising from your use of the Service. Our total '
                'liability is limited to the amount you paid for the '
                'Service in the 12 months before the claim.',
              ),
              _h('10. Changes to these Terms'),
              _p(
                'We may update these Terms occasionally. Material changes '
                'will be highlighted in the App and by email. Continued use '
                'after an update means you accept the new Terms.',
              ),
              _h('11. Governing law'),
              _p(
                'These Terms are governed by the laws of the Province of '
                'Ontario, Canada. Disputes will be resolved in the courts '
                'of that jurisdiction, subject to any consumer-protection '
                'rights available in your country of residence.',
              ),
              _h('12. Contact'),
              _p(
                'Questions about these Terms? Reach us at $_contactEmail.',
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: DHColors.sandstone.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(DHRadius.card),
                ),
                child: Text(
                  'These Terms are a v1 draft and do not constitute legal '
                  'advice. Consult a lawyer for jurisdiction-specific '
                  'requirements before launch.',
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
