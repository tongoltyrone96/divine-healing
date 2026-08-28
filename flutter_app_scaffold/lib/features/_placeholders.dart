// Stub screens — enough to compile the app and navigate. Each will be
// fleshed out iteratively. Split into individual files when adding real UI.
//
// Kept in one file for now to speed up scaffolding without directory churn.

import 'package:flutter/material.dart';
import '../theme.dart';

// ============================================================
// Auth
// ============================================================
class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Sign in')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Welcome back',
                    style: DHTypography.heading(size: 24)),
                const SizedBox(height: 24),
                // TODO: real Google/Microsoft/Apple/Email sign-in
                OutlinedButton.icon(
                  icon: const Icon(Icons.g_mobiledata, size: 24),
                  label: const Text('Continue with Google'),
                  onPressed: () {},
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  icon: const Icon(Icons.window),
                  label: const Text('Continue with Microsoft'),
                  onPressed: () {},
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  icon: const Icon(Icons.mail_outline),
                  label: const Text('Continue with Email'),
                  onPressed: () {},
                ),
              ],
            ),
          ),
        ),
      );
}

// ============================================================
// Content Detail (session player wrapper)
// ============================================================
class ContentDetailScreen extends StatelessWidget {
  const ContentDetailScreen({super.key, required this.contentId});
  final int contentId;
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text('Session #$contentId')),
        body: const Center(child: Text('Audio player + description here')),
      );
}

// ============================================================
// Hardcoded content screens (M1 stubs, wire to StaticContentRepository later)
// ============================================================
class ChakrasScreen extends StatelessWidget {
  const ChakrasScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Chakra Healing')),
        body: const Center(child: Text('7 chakras list (Root → Crown)')),
      );
}

class AffirmationsScreen extends StatelessWidget {
  const AffirmationsScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Affirmations')),
        body: const Center(child: Text('20 affirmations + daily card + favourites')),
      );
}

class BreathingScreen extends StatelessWidget {
  const BreathingScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Breathing')),
        body: const Center(child: Text('7 breathing techniques')),
      );
}

class ManifestationIntroScreen extends StatelessWidget {
  const ManifestationIntroScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Manifestation')),
        body: const Center(child: Text('Intro → Inner Work → 5-field form')),
      );
}

class SpiritualAwakeningScreen extends StatelessWidget {
  const SpiritualAwakeningScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Spiritual Awakening')),
        body: const Center(child: Text('Overview → Benefits/Expect → 7 prompts')),
      );
}

class ShadowWorkExplanationScreen extends StatelessWidget {
  const ShadowWorkExplanationScreen({super.key, required this.contentId});
  final int contentId;
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Shadow Work')),
        body: Center(child: Text('Explain → Meditation ($contentId) → Reflection')),
      );
}

class BookingScreen extends StatelessWidget {
  const BookingScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Bookings')),
        body: const Center(child: Text('Book a Zoom Session → external link')),
      );
}
