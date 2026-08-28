import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../theme.dart';

/// Booking — external Square calendar link. Client will provide the URL.
/// Once payment is enabled in Square, a manual Zoom link is sent after
/// confirmation.
class BookingScreen extends StatelessWidget {
  const BookingScreen({super.key});

  // TODO: swap with the real Square appointments URL once the client sends it.
  static const _squareBookingUrl =
      'https://squareup.com/appointments/book/PLACEHOLDER';

  Future<void> _openSquare(BuildContext context) async {
    final uri = Uri.parse(_squareBookingUrl);
    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!launched && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Booking link will be finalized before launch. Placeholder for now.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Book a Session'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _hero(),
              const SizedBox(height: 20),
              _sectionHeader('Session types'),
              const SizedBox(height: 12),
              const _SessionTypeCard(
                icon: Icons.psychology_outlined,
                iconColor: DHColors.forestGreen,
                title: 'Coaching',
                description:
                    'One-on-one guidance on your spiritual and personal growth.',
              ),
              const SizedBox(height: 10),
              const _SessionTypeCard(
                icon: Icons.pan_tool_outlined,
                iconColor: DHColors.strawberryBlush,
                title: 'Reiki',
                description:
                    'Distance or in-person energy healing to restore balance.',
              ),
              const SizedBox(height: 10),
              const _SessionTypeCard(
                icon: Icons.spa_outlined,
                iconColor: DHColors.mossGreen,
                title: 'Healing',
                description:
                    'A deeper healing session tailored to what you are working through.',
              ),
              const SizedBox(height: 24),
              _sectionHeader('How it works'),
              const SizedBox(height: 12),
              _flowStep(
                number: 1,
                icon: Icons.calendar_today_outlined,
                title: 'Pick a time',
                body:
                    'Choose from available slots on the secure booking calendar.',
              ),
              _flowStep(
                number: 2,
                icon: Icons.mail_outline,
                title: 'Confirmation',
                body:
                    'You will receive a confirmation email with all the details.',
              ),
              _flowStep(
                number: 3,
                icon: Icons.videocam_outlined,
                title: 'Zoom link',
                body:
                    'A private Zoom link is sent to you before your session begins.',
                last: true,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _openSquare(context),
                  icon: const Icon(Icons.open_in_new, size: 18),
                  label: const Text('Open booking calendar'),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'You will be redirected to the secure booking calendar.',
                style:
                    DHTypography.caption(color: DHColors.secondary),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _hero() => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              DHColors.sandstone.withOpacity(0.6),
              DHColors.sageMist,
            ],
          ),
          borderRadius: BorderRadius.circular(DHRadius.card),
          border: Border.all(color: DHColors.sunlightGold.withOpacity(0.4)),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.event_available,
                  size: 28, color: DHColors.sunlightGold),
            ),
            const SizedBox(height: 12),
            Text('Sessions with Strawberry Hope',
                style: DHTypography.heading(size: 20),
                textAlign: TextAlign.center),
            const SizedBox(height: 6),
            Text(
              'Book a private session by Zoom. Sessions are gentle, '
              'confidential, and tailored to where you are on your journey.',
              style:
                  DHTypography.body(size: 13, color: DHColors.secondary),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );

  Widget _sectionHeader(String label) => Row(
        children: [
          Container(
            width: 24,
            height: 2,
            decoration: BoxDecoration(
              color: DHColors.sunlightGold,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          Text(label, style: DHTypography.heading(size: 16)),
        ],
      );

  Widget _flowStep({
    required int number,
    required IconData icon,
    required String title,
    required String body,
    bool last = false,
  }) =>
      IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Column(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: DHColors.sunlightGold.withOpacity(0.18),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text('$number',
                      style: DHTypography.button(
                          size: 12, color: DHColors.forestGreen)),
                ),
                if (!last)
                  Expanded(
                    child: Container(
                      width: 1.5,
                      color: DHColors.sunlightGold.withOpacity(0.3),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Padding(
                padding: EdgeInsets.only(bottom: last ? 0 : 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(icon,
                            size: 15, color: DHColors.mossGreen),
                        const SizedBox(width: 6),
                        Text(title,
                            style: DHTypography.heading(size: 14)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(body,
                        style: DHTypography.body(
                            size: 13,
                            color: DHColors.secondary,
                            height: 1.5)),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
}

class _SessionTypeCard extends StatelessWidget {
  const _SessionTypeCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold.withOpacity(0.3)),
        boxShadow: DHShadows.card,
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.14),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: DHTypography.heading(size: 15)),
                const SizedBox(height: 2),
                Text(description,
                    style: DHTypography.body(
                        size: 12, color: DHColors.secondary, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
