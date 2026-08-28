import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/content_session.dart';
import '../../providers/auth_providers.dart';
import '../../providers/content_providers.dart';
import '../../providers/subscription_providers.dart';
import '../../theme.dart';

/// Library — 24 sessions from `admin_content.json` (or Supabase in M2),
/// filtered by category, with per-session cards that navigate to the
/// audio player.
class LibraryScreen extends ConsumerWidget {
  const LibraryScreen({super.key, this.category});
  final String? category;

  static const _filters = [
    (label: 'All',            slug: null),
    (label: 'Meditations',    slug: 'meditation'),
    (label: 'Shadow Work',    slug: 'shadow_work'),
    (label: 'Chakra Healing', slug: 'chakra_healing'),
    (label: 'Reiki',          slug: 'reiki'),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isReiki = category == 'reiki';
    final isChakra = category == 'chakra_healing';
    final isSignedIn = ref.watch(isSignedInProvider);

    // Chakra Healing has no DB rows (all static, hardcoded 7 chakras in
    // /chakras). Everything else queries admin_content.json via provider.
    final sessionsAsync = isChakra
        ? const AsyncValue<List<ContentSession>>.data(<ContentSession>[])
        : ref.watch(allSessionsProvider(category));

    return Scaffold(
      appBar: AppBar(title: const Text('Library')),
      body: Column(
        children: [
          if (!isSignedIn) _signInPrompt(context),
          _filterChips(context),
          if (isReiki) _reikiBookingCard(context),
          if (isChakra) _chakraLink(context),
          Expanded(
            child: sessionsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (list) {
                if (list.isEmpty && !isChakra) {
                  // "No sessions yet" was actively wrong for a signed-out
                  // visitor: the sessions exist, they are just not readable
                  // yet. Saying so, with a way in, beats telling someone the
                  // category is empty.
                  return _emptyState(context, signedIn: isSignedIn);
                }
                if (isChakra) {
                  return const SizedBox.shrink();
                }
                final hasAccess = ref.watch(hasFullAccessProvider);
                return ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                  itemCount: list.length,
                  itemBuilder: (_, i) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _SessionCard(
                      session: list[i],
                      hasFullAccess: hasAccess,
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyState(BuildContext context, {required bool signedIn}) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(signedIn ? Icons.spa_outlined : Icons.lock_outline,
                  size: 34, color: DHColors.mossGreen),
              const SizedBox(height: 12),
              Text(
                signedIn
                    ? 'Nothing in this category yet.'
                    : 'Sign in to see these sessions',
                style: DHTypography.heading(size: 16),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                signedIn
                    ? 'New sessions are added here as they are published.'
                    : 'The full library is here — signing in reveals it, and '
                        'a free trial unlocks the audio.',
                style: DHTypography.body(size: 13, height: 1.5),
                textAlign: TextAlign.center,
              ),
              if (!signedIn) ...[
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => context.push('/sign-in'),
                  child: const Text('Sign in'),
                ),
              ],
            ],
          ),
        ),
      );

  Widget _signInPrompt(BuildContext context) => Container(
        width: double.infinity,
        margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              DHColors.softSage.withOpacity(0.6),
              DHColors.sandstone.withOpacity(0.6),
            ],
          ),
          borderRadius: BorderRadius.circular(DHRadius.card),
          border: Border.all(color: DHColors.sunlightGold.withOpacity(0.4)),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: const Icon(Icons.lock_open_outlined,
                  color: DHColors.sunlightGold, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Free preview',
                      style: DHTypography.heading(size: 14)),
                  const SizedBox(height: 2),
                  Text(
                    'Sign in to unlock all 24 guided sessions.',
                    style: DHTypography.caption(color: DHColors.secondary),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: () => context.push('/sign-in'),
              style: ElevatedButton.styleFrom(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                textStyle: DHTypography.button(size: 13),
              ),
              child: const Text('Sign in'),
            ),
          ],
        ),
      );

  Widget _filterChips(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: _rowChips(context, _filters.sublist(0, 3)),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: _rowChips(context, _filters.sublist(3)),
            ),
          ],
        ),
      );

  Widget _reikiBookingCard(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: DHColors.strawberryBlush.withOpacity(0.1),
            borderRadius: BorderRadius.circular(DHRadius.card),
            border: Border.all(color: DHColors.strawberryBlush.withOpacity(0.4)),
          ),
          child: Row(
            children: [
              const Icon(Icons.event_available,
                  color: DHColors.strawberryBlush),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Book a Reiki session with Strawberry Hope',
                  style: DHTypography.heading(
                      size: 14, color: DHColors.strawberryBlush),
                ),
              ),
              ElevatedButton(
                onPressed: () => context.push('/booking'),
                child: const Text('Book'),
              ),
            ],
          ),
        ),
      );

  Widget _chakraLink(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
        child: InkWell(
          onTap: () => context.push('/chakras'),
          borderRadius: BorderRadius.circular(DHRadius.card),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  DHColors.softSage.withOpacity(0.6),
                  DHColors.sandstone.withOpacity(0.5),
                ],
              ),
              borderRadius: BorderRadius.circular(DHRadius.card),
              border: Border.all(color: DHColors.sunlightGold.withOpacity(0.35)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.brightness_low,
                      color: DHColors.sunlightGold, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Chakra Healing',
                          style: DHTypography.heading(size: 15)),
                      Text('Seven energy centres — text-only guide',
                          style: DHTypography.caption(color: DHColors.secondary)),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: DHColors.forestGreen),
              ],
            ),
          ),
        ),
      );

  List<Widget> _rowChips(
    BuildContext context,
    List<({String label, String? slug})> chips,
  ) {
    final widgets = <Widget>[];
    for (var i = 0; i < chips.length; i++) {
      final f = chips[i];
      final selected = f.slug == category;
      widgets.add(
        ChoiceChip(
          label: Text(f.label),
          selected: selected,
          onSelected: (_) {
            context.go(f.slug == null ? '/library' : '/library/${f.slug}');
          },
        ),
      );
      if (i < chips.length - 1) {
        widgets.add(const SizedBox(width: 8));
      }
    }
    return widgets;
  }
}

// ============================================================
// Session card
// ============================================================
class _SessionCard extends StatelessWidget {
  const _SessionCard({
    required this.session,
    required this.hasFullAccess,
  });
  final ContentSession session;
  final bool hasFullAccess;

  /// Preview sessions and any session for a paid user are unlocked.
  bool get _unlocked => session.isPreview || hasFullAccess;

  @override
  Widget build(BuildContext context) {
    final s = session;
    final isFree = s.isPreview;
    final iconInfo = _iconForCategory(s.category);

    return InkWell(
      onTap: () {
        // Shadow work sessions have a 3-step wizard, not a plain player.
        if (s.category == 'shadow_work') {
          context.push('/shadow-work/${s.id}');
        } else if (s.category == 'reiki') {
          // Reiki is written content, not a track — the detail screen would
          // show a title and nothing else.
          context.push('/reiki');
        } else {
          context.push('/content/${s.id}');
        }
      },
      borderRadius: BorderRadius.circular(DHRadius.card),
      child: Container(
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
                color: iconInfo.color.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Icon(iconInfo.icon, size: 22, color: iconInfo.color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(s.title, style: DHTypography.heading(size: 15)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      if (s.durationMinutes > 0) ...[
                        Icon(Icons.access_time,
                            size: 12, color: DHColors.secondary),
                        const SizedBox(width: 4),
                        Text('${s.durationMinutes} min',
                            style: DHTypography.caption(
                                color: DHColors.secondary)),
                        const SizedBox(width: 8),
                      ],
                      if (isFree) _freeBadge(),
                      if (!_unlocked && s.hasAudio) ...[
                        Icon(Icons.lock_outline,
                            size: 12,
                            color: DHColors.secondary.withOpacity(0.7)),
                      ],
                      if (!s.hasAudio && s.category != 'shadow_work') ...[
                        const SizedBox(width: 4),
                        Text('Text only',
                            style: DHTypography.caption(
                                color: DHColors.secondary)),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            _trailingButton(s, isFree),
          ],
        ),
      ),
    );
  }

  Widget _trailingButton(ContentSession s, bool isFree) {
    if (!s.hasAudio && s.category != 'shadow_work') {
      // Text-only session (e.g. Reiki intro) — chevron
      return const Icon(Icons.chevron_right, color: DHColors.forestGreen);
    }
    if (_unlocked) {
      return Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [DHColors.sunlightGold, DHColors.softClay],
          ),
          shape: BoxShape.circle,
        ),
        alignment: Alignment.center,
        child: const Icon(Icons.play_arrow, size: 22, color: Colors.white),
      );
    }
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: DHColors.softSage.withOpacity(0.6),
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Icon(Icons.lock_outline,
          size: 18, color: DHColors.forestGreen.withOpacity(0.7)),
    );
  }

  Widget _freeBadge() => Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
        decoration: BoxDecoration(
          color: DHColors.strawberryBlush.withOpacity(0.15),
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text('FREE',
            style: DHTypography.caption(color: DHColors.strawberryBlush)
                .copyWith(letterSpacing: 0.5, fontWeight: FontWeight.w700)),
      );

  ({IconData icon, Color color}) _iconForCategory(String category) =>
      switch (category) {
        'meditation' =>
          (icon: Icons.nights_stay_outlined, color: DHColors.mossGreen),
        'shadow_work' =>
          (icon: Icons.flash_on_outlined, color: DHColors.sunlightGold),
        'reiki' => (icon: Icons.star_border, color: DHColors.strawberryBlush),
        _ => (icon: Icons.spa_outlined, color: DHColors.forestGreen),
      };
}
