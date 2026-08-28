import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme.dart';

/// Home screen — matches Glide app landing:
///   Hero (pill badge + h1 + p + 3 CTAs) → "What's included" (8 category cards)
///   → "Free preview sessions" list → "Unlock the full library" CTA
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DHColors.sageMist,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _Hero(),
              const SizedBox(height: 12),
              _WhatsIncluded(),
              const SizedBox(height: 32),
              // TODO: FreePreviewList — needs content repository (M1-late)
              const SizedBox(height: 40),
              _UnlockCta(),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }
}

// ============================================================
// Hero section — pill + h1 + subtitle + 3 buttons
// ============================================================
class _Hero extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 40, 24, 32),
      child: Column(
        children: [
          _pill('Guided healing for your inner journey'),
          const SizedBox(height: 24),
          Text(
            'Heal. Grow. Awaken.',
            style: DHTypography.heading(size: 40, weight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            'Guided meditations, shadow work sessions, chakra healing and Reiki — '
            'all in one place. Begin your transformation today.',
            style: DHTypography.body(size: 15, color: DHColors.secondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 28),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            alignment: WrapAlignment.center,
            children: [
              ElevatedButton(
                onPressed: () => context.go('/library'),
                child: const Text('Explore Free Content'),
              ),
              OutlinedButton(
                onPressed: () => context.go('/profile'),
                child: const Text('Subscribe Now'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => context.push('/booking'),
            icon: const Icon(Icons.event_available, size: 18),
            label: const Text('Booking'),
          ),
        ],
      ),
    );
  }

  Widget _pill(String text) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: DHColors.softSage.withOpacity(0.4),
          borderRadius: BorderRadius.circular(DHRadius.chip),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.auto_awesome, size: 14, color: DHColors.sunlightGold),
            const SizedBox(width: 6),
            Text(text, style: DHTypography.caption()),
          ],
        ),
      );
}

// ============================================================
// "What's included" — 8 category cards
// ============================================================
class _WhatsIncluded extends StatelessWidget {
  // Order + labels match Glide's CATEGORY_META (see data/content/category_meta.json).
  static const _categories = [
    _Cat('Meditations',        Icons.nights_stay_outlined, DHColors.mossGreen,     '/library/meditation',
         'Cultivate stillness, clarity, and presence through guided breath and awareness practices.'),
    _Cat('Shadow Work',        Icons.flash_on_outlined,    DHColors.sunlightGold,  '/library/shadow_work',
         'A guided journey — learn what shadow work is, listen to a meditation, then reflect with journaling prompts.'),
    _Cat('Chakra Healing',     Icons.favorite_border,      DHColors.mossGreen,     '/chakras',
         'Balance and awaken your energy centres for greater vitality and flow.'),
    _Cat('Reiki',              Icons.star_border,          DHColors.sunlightGold,  '/library/reiki',
         'Channel universal life force energy for deep healing, relaxation, and restoration.'),
    _Cat('Manifestation',      Icons.auto_fix_high,        DHColors.mossGreen,     '/manifestation',
         'A guided journey — understand how manifestation works, explore the inner work, and complete a personal exercise.'),
    _Cat('Affirmations',       Icons.bookmark_border,      DHColors.softClay,      '/affirmations',
         '20 healing affirmations to speak aloud, save your favourites, and draw a daily affirmation.'),
    _Cat('Breathing',          Icons.air,                  DHColors.mossGreen,     '/breathing',
         '7 breathwork techniques for grounding, calm, energy, and nervous system reset.'),
    _Cat('Spiritual Awakening',Icons.wb_sunny_outlined,    DHColors.sunlightGold,  '/spiritual-awakening',
         'Explore the signs, stages, and gifts of spiritual awakening — with guided reflections and journaling prompts.'),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          Text(
            "What's included",
            style: DHTypography.heading(size: 22),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          LayoutBuilder(
            builder: (context, constraints) {
              final crossAxis = constraints.maxWidth >= 900 ? 4
                              : constraints.maxWidth >= 600 ? 2
                              : 1;
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: crossAxis,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.3,
                ),
                itemCount: _categories.length,
                itemBuilder: (_, i) => _CategoryCard(cat: _categories[i]),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _Cat {
  const _Cat(this.title, this.icon, this.iconColor, this.route, this.description);
  final String title;
  final IconData icon;
  final Color iconColor;
  final String route;
  final String description;
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({required this.cat});
  final _Cat cat;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => context.push(cat.route),
      borderRadius: BorderRadius.circular(DHRadius.card),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(DHRadius.card),
          border: Border.all(color: DHColors.accent.withOpacity(0.3)),
          boxShadow: DHShadows.card,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: cat.iconColor.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(cat.icon, color: cat.iconColor, size: 22),
            ),
            const SizedBox(height: 12),
            Text(cat.title, style: DHTypography.heading(size: 16)),
            const SizedBox(height: 6),
            Expanded(
              child: Text(
                cat.description,
                style: DHTypography.body(size: 13, color: DHColors.secondary),
                maxLines: 4,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Text('Explore',
                    style: DHTypography.button(
                      size: 13,
                      color: DHColors.primary,
                    )),
                const Icon(Icons.chevron_right, size: 16, color: DHColors.primary),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================
// "Unlock the full library" CTA
// ============================================================
class _UnlockCta extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(DHRadius.card),
          border: Border.all(color: DHColors.accent.withOpacity(0.3)),
          boxShadow: DHShadows.card,
        ),
        child: Column(
          children: [
            Text('Unlock the full library',
                style: DHTypography.heading(size: 20),
                textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(
              'Get unlimited access to all meditations, shadow work sessions, '
              'chakra healing and Reiki guides. New content added regularly.',
              style: DHTypography.body(size: 13, color: DHColors.secondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => context.go('/profile'),
              child: const Text('Subscribe'),
            ),
          ],
        ),
      ),
    );
  }
}
