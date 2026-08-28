import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:go_router/go_router.dart';

import '../../theme.dart';

/// Chakra Healing — reads the 7 chakras from assets/content/chakras.json.
///
/// Home hero → intro card → expandable per-chakra cards (description,
/// affirmations, practices, imbalance signs).
class ChakrasScreen extends StatefulWidget {
  const ChakrasScreen({super.key});

  @override
  State<ChakrasScreen> createState() => _ChakrasScreenState();
}

class _ChakrasScreenState extends State<ChakrasScreen> {
  Future<List<_Chakra>>? _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<_Chakra>> _load() async {
    final raw = await rootBundle.loadString('assets/content/chakras.json');
    final list = json.decode(raw) as List<dynamic>;
    return list
        .cast<Map<String, dynamic>>()
        .asMap()
        .entries
        .map((e) => _Chakra.fromJson(e.value, e.key))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chakra Healing'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: FutureBuilder<List<_Chakra>>(
        future: _future,
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final chakras = snap.data!;
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
            children: [
              _intro(),
              const SizedBox(height: 20),
              for (final c in chakras) ...[
                _ChakraCard(chakra: c),
                const SizedBox(height: 12),
              ],
            ],
          );
        },
      ),
    );
  }

  Widget _intro() => Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              DHColors.softSage.withOpacity(0.55),
              DHColors.sandstone.withOpacity(0.55),
            ],
          ),
          borderRadius: BorderRadius.circular(DHRadius.card),
          border: Border.all(color: DHColors.sunlightGold.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.brightness_low,
                      color: DHColors.sunlightGold, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text('Seven Energy Centres',
                      style: DHTypography.heading(size: 18)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              'Balance and awaken your energy centres — from the grounding '
              'Root to the transcendent Crown. Tap any card to explore its '
              'affirmations, practices, and signs of imbalance.',
              style: DHTypography.body(size: 13, color: DHColors.secondary),
            ),
          ],
        ),
      );
}

// ============================================================
// Card
// ============================================================
class _ChakraCard extends StatefulWidget {
  const _ChakraCard({required this.chakra});
  final _Chakra chakra;

  @override
  State<_ChakraCard> createState() => _ChakraCardState();
}

class _ChakraCardState extends State<_ChakraCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final c = widget.chakra;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: c.color.withOpacity(0.35), width: 1.4),
        boxShadow: DHShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: BorderRadius.circular(DHRadius.card),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: c.color.withOpacity(0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: c.color.withOpacity(0.6)),
                    ),
                    alignment: Alignment.center,
                    child: Container(
                      width: 18,
                      height: 18,
                      decoration:
                          BoxDecoration(color: c.color, shape: BoxShape.circle),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(c.name, style: DHTypography.heading(size: 16)),
                        Text(c.sanskrit,
                            style: DHTypography.body(
                                size: 12, color: DHColors.secondary)),
                      ],
                    ),
                  ),
                  Icon(
                    _expanded ? Icons.expand_less : Icons.expand_more,
                    color: DHColors.forestGreen,
                  ),
                ],
              ),
            ),
          ),
          AnimatedCrossFade(
            duration: const Duration(milliseconds: 220),
            crossFadeState: _expanded
                ? CrossFadeState.showSecond
                : CrossFadeState.showFirst,
            firstChild: const SizedBox(width: double.infinity),
            secondChild: Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(height: 1, color: c.color.withOpacity(0.2)),
                  const SizedBox(height: 12),
                  Text(c.description,
                      style: DHTypography.body(size: 13, height: 1.55)),
                  const SizedBox(height: 14),
                  _list(
                    icon: Icons.favorite_outline,
                    title: 'Affirmations',
                    items: c.affirmations,
                    accent: c.color,
                  ),
                  const SizedBox(height: 12),
                  _list(
                    icon: Icons.self_improvement,
                    title: 'Practices',
                    items: c.practices,
                    accent: c.color,
                  ),
                  const SizedBox(height: 12),
                  _list(
                    icon: Icons.info_outline,
                    title: 'Signs of imbalance',
                    items: c.imbalance,
                    accent: c.color,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _list({
    required IconData icon,
    required String title,
    required List<String> items,
    required Color accent,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 15, color: accent),
            const SizedBox(width: 6),
            Text(title,
                style: DHTypography.caption(color: DHColors.forestGreen)),
          ],
        ),
        const SizedBox(height: 6),
        for (final it in items)
          Padding(
            padding: const EdgeInsets.only(left: 22, bottom: 4),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 6, right: 8),
                  child: Container(
                    width: 4,
                    height: 4,
                    decoration:
                        BoxDecoration(color: accent, shape: BoxShape.circle),
                  ),
                ),
                Expanded(
                  child: Text(it, style: DHTypography.body(size: 13)),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

// ============================================================
// Model
// ============================================================
class _Chakra {
  const _Chakra({
    required this.name,
    required this.sanskrit,
    required this.description,
    required this.affirmations,
    required this.practices,
    required this.imbalance,
    required this.color,
  });

  final String name;
  final String sanskrit;
  final String description;
  final List<String> affirmations;
  final List<String> practices;
  final List<String> imbalance;
  final Color color;

  static const _palette = [
    Color(0xFFE55353), // Root — soft red
    Color(0xFFF08A3E), // Sacral — orange
    Color(0xFFE7B549), // Solar Plexus — amber
    Color(0xFF6EAE7A), // Heart — moss green
    Color(0xFF4A9AD6), // Throat — sky blue
    Color(0xFF6C6BC7), // Third Eye — indigo
    Color(0xFF9E7BC5), // Crown — soft violet
  ];

  factory _Chakra.fromJson(Map<String, dynamic> j, int index) {
    return _Chakra(
      name: j['name'] as String,
      sanskrit: j['sanskrit'] as String,
      description: j['description'] as String,
      affirmations: (j['affirmations'] as List).cast<String>(),
      practices: (j['practices'] as List).cast<String>(),
      imbalance: (j['imbalance'] as List).cast<String>(),
      color: _palette[index % _palette.length],
    );
  }
}
