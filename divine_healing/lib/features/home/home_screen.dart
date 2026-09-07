import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/content_session.dart';
import '../../providers/auth_providers.dart';
import '../../providers/content_providers.dart';
import '../../providers/subscription_providers.dart';
import '../../theme.dart';

/// Home screen — matches Glide app landing:
///   Hero (logo + pill + h1 + p + CTAs) → "What's included" (8 category cards)
///   → "Try these free sessions" (3 preview cards) → "Unlock the full library" CTA
///
/// The last two are dropped once the viewer has full access.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Both of the sections below are written at someone who has not paid:
    // one offers three free sessions with no sign-in, the other sells the
    // subscription. A subscriber was still being shown both, and said so.
    final selling = !ref.watch(hasFullAccessProvider);
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
              if (selling) ...[
                const _FreePreviewSection(),
                const SizedBox(height: 40),
                _UnlockCta(),
              ],
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }
}

// ============================================================
// Hero section — logo + optional greeting + pill + h1 + buttons
// ============================================================
class _Hero extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final displayName = ref.watch(userDisplayNameProvider);
    // A subscriber has nothing to subscribe to. The first pass at this
    // caught the two sections lower down and missed the button up here,
    // which is the one the client noticed second.
    final selling = !ref.watch(hasFullAccessProvider);

    return Container(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
      child: Column(
        children: [
          Image.asset(
            'assets/logo/client_logo.png',
            width: 140,
            height: 140,
            fit: BoxFit.contain,
          ),
          const SizedBox(height: 4),
          _pill('Guided healing for your inner journey'),
          const SizedBox(height: 16),
          if (displayName != null) ...[
            Text('Welcome home, $displayName',
                style: DHTypography.body(
                    size: 14, color: DHColors.secondary)),
            const SizedBox(height: 6),
          ],
          Text(
            'Heal. Grow. Awaken.',
            style: DHTypography.heading(size: 40, weight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            'Guided meditations, shadow work, chakra healing '
            'and Reiki — all in one place.',
            style: DHTypography.body(size: 15, color: DHColors.secondary),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => context.go('/library'),
              // "Explore Free Content" is an offer, and it stops being true
              // the moment someone pays — the client read it as the app not
              // knowing she had subscribed.
              child: Text(selling ? 'Explore Free Content' : 'Open the Library'),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              if (selling) ...[
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => context.go('/profile'),
                    child: const Text('Subscribe'),
                  ),
                ),
                const SizedBox(width: 12),
              ],
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => context.push('/booking'),
                  icon: const Icon(Icons.event_available, size: 18),
                  label: const Text('Book'),
                ),
              ),
            ],
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
    _Cat('Shadow Work',        Icons.flash_on_outlined,    DHColors.sunlightGold,  '/shadow-work/31',
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
                              : constraints.maxWidth >= 340 ? 2
                              : 1;
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: crossAxis,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.95,
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

// ============================================================
// Free Preview Section — 3 free sessions from admin_content.json
// ============================================================
class _FreePreviewSection extends ConsumerWidget {
  const _FreePreviewSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(freePreviewSessionsProvider);
    return async.when(
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
      data: (sessions) {
        if (sessions.isEmpty) return const SizedBox.shrink();
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 28,
                    height: 2,
                    decoration: BoxDecoration(
                      color: DHColors.sunlightGold,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text('Try these free sessions',
                      style: DHTypography.heading(size: 18)),
                ],
              ),
              const SizedBox(height: 6),
              Padding(
                padding: const EdgeInsets.only(left: 38),
                child: Text(
                  'No sign-in needed — tap the play button.',
                  style: DHTypography.caption(color: DHColors.secondary),
                ),
              ),
              const SizedBox(height: 14),
              for (final s in sessions)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: _PreviewCard(session: s),
                ),
            ],
          ),
        );
      },
    );
  }
}

class _PreviewCard extends StatelessWidget {
  const _PreviewCard({required this.session});
  final ContentSession session;

  @override
  Widget build(BuildContext context) {
    final s = session;
    return InkWell(
      onTap: () => context.push('/content/${s.id}'),
      borderRadius: BorderRadius.circular(DHRadius.card),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white,
              DHColors.sandstone.withOpacity(0.45),
            ],
          ),
          borderRadius: BorderRadius.circular(DHRadius.card),
          border: Border.all(color: DHColors.sunlightGold.withOpacity(0.4)),
          boxShadow: DHShadows.card,
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [DHColors.sunlightGold, DHColors.softClay],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: DHColors.sunlightGold.withOpacity(0.35),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Icon(
                s.hasAudio ? Icons.play_arrow : Icons.article_outlined,
                color: Colors.white,
                size: 24,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(s.title, style: DHTypography.heading(size: 15)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: DHColors.strawberryBlush.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text('FREE',
                            style: DHTypography.caption(
                                    color: DHColors.strawberryBlush)
                                .copyWith(
                                    letterSpacing: 0.5,
                                    fontWeight: FontWeight.w700)),
                      ),
                      const SizedBox(width: 8),
                      if (s.durationMinutes > 0) ...[
                        const Icon(Icons.access_time,
                            size: 12, color: DHColors.secondary),
                        const SizedBox(width: 4),
                        Text('${s.durationMinutes} min',
                            style: DHTypography.caption(
                                color: DHColors.secondary)),
                      ] else
                        Text('Text',
                            style: DHTypography.caption(
                                color: DHColors.secondary)),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: DHColors.forestGreen),
          ],
        ),
      ),
    );
  }
}
