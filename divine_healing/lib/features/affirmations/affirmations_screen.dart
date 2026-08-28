import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../providers/user_data_providers.dart';
import '../../theme.dart';

/// Affirmations — 20 statements from assets/content/affirmations.json.
///
/// Favourites sync to Supabase `sh_affirmation_favourites` for signed-in
/// users, fall back to SharedPreferences for anonymous.
class AffirmationsScreen extends ConsumerStatefulWidget {
  const AffirmationsScreen({super.key});

  @override
  ConsumerState<AffirmationsScreen> createState() =>
      _AffirmationsScreenState();
}

class _AffirmationsScreenState extends ConsumerState<AffirmationsScreen> {
  static const _prefsKey = 'sh_favourites';

  List<String> _all = const [];
  Set<int> _favourites = {};
  int _dailyIndex = 0;
  bool _showFavouritesOnly = false;
  bool _loaded = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final raw = await rootBundle.loadString('assets/content/affirmations.json');
    final list = (json.decode(raw) as List).cast<String>();

    // Cloud-first for signed-in users.
    Set<int>? cloud;
    final repo = ref.read(userDataRepositoryProvider);
    if (repo != null && repo.isSignedIn) {
      try {
        cloud = await repo.loadFavourites();
      } catch (_) {}
    }

    final prefs = await SharedPreferences.getInstance();
    final localFavs = (prefs.getStringList(_prefsKey) ?? [])
        .map((s) => int.tryParse(s))
        .whereType<int>()
        .toSet();

    final favs = cloud ?? localFavs;
    final now = DateTime.now();
    final dayOfYear = now.difference(DateTime(now.year)).inDays;

    if (!mounted) return;
    setState(() {
      _all = list;
      _favourites = favs;
      _dailyIndex = dayOfYear % list.length;
      _loaded = true;
    });
  }

  Future<void> _toggleFavourite(int index) async {
    final wasFavourite = _favourites.contains(index);
    setState(() {
      if (wasFavourite) {
        _favourites.remove(index);
      } else {
        _favourites.add(index);
      }
    });

    // Local mirror (works offline + for anonymous users).
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(
      _prefsKey,
      _favourites.map((i) => i.toString()).toList(),
    );

    // Cloud sync for signed-in users.
    final repo = ref.read(userDataRepositoryProvider);
    if (repo == null || !repo.isSignedIn) return;
    try {
      if (wasFavourite) {
        await repo.removeFavourite(index);
      } else {
        await repo.addFavourite(index);
      }
      ref.invalidate(favouritesProvider);
    } catch (_) {
      // Ignore transient errors; local state is still saved.
    }
  }

  void _shuffleDaily() {
    if (_all.length < 2) return;
    final rand = Random();
    var next = _dailyIndex;
    while (next == _dailyIndex) {
      next = rand.nextInt(_all.length);
    }
    setState(() => _dailyIndex = next);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Affirmations'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: !_loaded
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
              children: [
                _dailyCard(),
                const SizedBox(height: 24),
                _filterRow(),
                const SizedBox(height: 12),
                ..._visibleEntries().map((e) {
                  final idx = e.key;
                  final text = e.value;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _AffirmationTile(
                      index: idx,
                      text: text,
                      favourite: _favourites.contains(idx),
                      onToggle: () => _toggleFavourite(idx),
                    ),
                  );
                }),
                if (_showFavouritesOnly && _favourites.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 40),
                    child: Column(
                      children: [
                        Icon(Icons.favorite_border,
                            size: 40,
                            color: DHColors.mossGreen.withOpacity(0.6)),
                        const SizedBox(height: 12),
                        Text('No favourites yet',
                            style: DHTypography.heading(size: 16)),
                        const SizedBox(height: 4),
                        Text('Tap the heart on any affirmation to save it.',
                            style: DHTypography.body(
                                size: 13, color: DHColors.secondary),
                            textAlign: TextAlign.center),
                      ],
                    ),
                  ),
              ],
            ),
    );
  }

  List<MapEntry<int, String>> _visibleEntries() {
    final indexed = _all.asMap().entries.toList();
    if (_showFavouritesOnly) {
      return indexed.where((e) => _favourites.contains(e.key)).toList();
    }
    return indexed;
  }

  Widget _dailyCard() {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            DHColors.forestGreen,
            DHColors.mossGreen,
          ],
        ),
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold, width: 1.2),
        boxShadow: DHShadows.card,
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.wb_sunny_outlined,
                  size: 16, color: DHColors.sunlightGold),
              const SizedBox(width: 6),
              Text('Today\'s affirmation',
                  style: DHTypography.caption(color: DHColors.sunlightGold)),
              const Spacer(),
              InkWell(
                onTap: _shuffleDaily,
                borderRadius: BorderRadius.circular(999),
                child: Padding(
                  padding: const EdgeInsets.all(4),
                  child: Icon(Icons.shuffle,
                      size: 18, color: Colors.white.withOpacity(0.85)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(
            _all[_dailyIndex],
            textAlign: TextAlign.center,
            style: DHTypography.heading(
              size: 22,
              color: Colors.white,
              weight: FontWeight.w500,
            ).copyWith(height: 1.4),
          ),
          const SizedBox(height: 18),
          Container(
            width: 32,
            height: 1,
            color: DHColors.sunlightGold.withOpacity(0.7),
          ),
          const SizedBox(height: 12),
          TextButton.icon(
            onPressed: () => _toggleFavourite(_dailyIndex),
            icon: Icon(
              _favourites.contains(_dailyIndex)
                  ? Icons.favorite
                  : Icons.favorite_border,
              size: 16,
              color: DHColors.sunlightGold,
            ),
            label: Text(
              _favourites.contains(_dailyIndex)
                  ? 'Saved to favourites'
                  : 'Save to favourites',
              style: DHTypography.button(
                size: 12,
                color: DHColors.sunlightGold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterRow() {
    final favCount = _favourites.length;
    return Row(
      children: [
        _filterChip(
          label: 'All ${_all.length}',
          selected: !_showFavouritesOnly,
          onTap: () => setState(() => _showFavouritesOnly = false),
        ),
        const SizedBox(width: 8),
        _filterChip(
          label: 'Favourites $favCount',
          selected: _showFavouritesOnly,
          onTap: () => setState(() => _showFavouritesOnly = true),
          icon: Icons.favorite,
        ),
      ],
    );
  }

  Widget _filterChip({
    required String label,
    required bool selected,
    required VoidCallback onTap,
    IconData? icon,
  }) =>
      ChoiceChip(
        avatar: icon != null
            ? Icon(icon,
                size: 14,
                color: selected ? Colors.white : DHColors.strawberryBlush)
            : null,
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
      );
}

// ============================================================
// Tile
// ============================================================
class _AffirmationTile extends StatelessWidget {
  const _AffirmationTile({
    required this.index,
    required this.text,
    required this.favourite,
    required this.onToggle,
  });

  final int index;
  final String text;
  final bool favourite;
  final VoidCallback onToggle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold.withOpacity(0.3)),
        boxShadow: DHShadows.card,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 22,
            child: Text(
              '${index + 1}',
              style: DHTypography.caption(color: DHColors.mossGreen)
                  .copyWith(fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(text, style: DHTypography.body(size: 14, height: 1.4)),
          ),
          const SizedBox(width: 8),
          InkWell(
            onTap: onToggle,
            borderRadius: BorderRadius.circular(999),
            child: Padding(
              padding: const EdgeInsets.all(4),
              child: Icon(
                favourite ? Icons.favorite : Icons.favorite_border,
                size: 22,
                color: favourite
                    ? DHColors.strawberryBlush
                    : DHColors.mossGreen.withOpacity(0.5),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
