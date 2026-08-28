import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:go_router/go_router.dart';

import '../../theme.dart';

/// Breathing techniques — 7 practices loaded from assets/content/techniques.json.
///
/// Intro card → per-technique accordion (description, numbered steps, benefits).
class BreathingScreen extends StatefulWidget {
  const BreathingScreen({super.key});

  @override
  State<BreathingScreen> createState() => _BreathingScreenState();
}

class _BreathingScreenState extends State<BreathingScreen> {
  Future<List<_Technique>>? _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<_Technique>> _load() async {
    final raw = await rootBundle.loadString('assets/content/techniques.json');
    final list = json.decode(raw) as List<dynamic>;
    return list
        .cast<Map<String, dynamic>>()
        .asMap()
        .entries
        .map((e) => _Technique.fromJson(e.value, e.key))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Breathing'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: FutureBuilder<List<_Technique>>(
        future: _future,
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final items = snap.data!;
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
            children: [
              _intro(),
              const SizedBox(height: 20),
              for (final t in items) ...[
                _TechniqueCard(technique: t),
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
              DHColors.softSage.withOpacity(0.6),
              DHColors.sageMist,
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
                  child: const Icon(Icons.air,
                      color: DHColors.mossGreen, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text('Seven Breathwork Techniques',
                      style: DHTypography.heading(size: 18)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              'Breathwork is one of the fastest ways to shift your nervous '
              'system. Tap any technique to see the exact steps and benefits.',
              style: DHTypography.body(size: 13, color: DHColors.secondary),
            ),
          ],
        ),
      );
}

// ============================================================
// Card
// ============================================================
class _TechniqueCard extends StatefulWidget {
  const _TechniqueCard({required this.technique});
  final _Technique technique;

  @override
  State<_TechniqueCard> createState() => _TechniqueCardState();
}

class _TechniqueCardState extends State<_TechniqueCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final t = widget.technique;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold.withOpacity(0.3)),
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
                      color: DHColors.softSage.withOpacity(0.5),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Icon(t.icon,
                        color: DHColors.forestGreen, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(t.name, style: DHTypography.heading(size: 16)),
                        const SizedBox(height: 2),
                        _subtitleBadge(t.subtitle),
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
                  Container(
                      height: 1, color: DHColors.sunlightGold.withOpacity(0.25)),
                  const SizedBox(height: 12),
                  Text(t.description,
                      style: DHTypography.body(size: 13, height: 1.55)),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      const Icon(Icons.list_alt,
                          size: 15, color: DHColors.forestGreen),
                      const SizedBox(width: 6),
                      Text('Steps',
                          style: DHTypography.caption(
                              color: DHColors.forestGreen)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  for (var i = 0; i < t.steps.length; i++)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 22,
                            height: 22,
                            margin: const EdgeInsets.only(right: 10, top: 1),
                            decoration: BoxDecoration(
                              color: DHColors.sunlightGold.withOpacity(0.2),
                              shape: BoxShape.circle,
                            ),
                            alignment: Alignment.center,
                            child: Text('${i + 1}',
                                style: DHTypography.button(
                                  size: 11,
                                  color: DHColors.forestGreen,
                                )),
                          ),
                          Expanded(
                            child: Text(t.steps[i],
                                style: DHTypography.body(size: 13)),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.check_circle_outline,
                          size: 15, color: DHColors.mossGreen),
                      const SizedBox(width: 6),
                      Text('Benefits',
                          style: DHTypography.caption(
                              color: DHColors.forestGreen)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  for (final b in t.benefits)
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
                              decoration: const BoxDecoration(
                                color: DHColors.mossGreen,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                          Expanded(
                              child: Text(b, style: DHTypography.body(size: 13))),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _subtitleBadge(String text) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: DHColors.sunlightGold.withOpacity(0.18),
          borderRadius: BorderRadius.circular(DHRadius.chip),
        ),
        child: Text(text,
            style: DHTypography.caption(color: DHColors.forestGreen)),
      );
}

// ============================================================
// Model
// ============================================================
class _Technique {
  const _Technique({
    required this.name,
    required this.subtitle,
    required this.description,
    required this.steps,
    required this.benefits,
    required this.icon,
  });

  final String name;
  final String subtitle;
  final String description;
  final List<String> steps;
  final List<String> benefits;
  final IconData icon;

  static const _icons = [
    Icons.crop_square,             // Box Breathing
    Icons.local_fire_department,   // Wim Hof
    Icons.air,                     // Physiological Sigh
    Icons.balance,                 // Coherent
    Icons.spa_outlined,            // Belly Breathing
    Icons.waves,                   // Double Inhale + Long Exhale
    Icons.nightlight_round,        // 4-7-8
  ];

  factory _Technique.fromJson(Map<String, dynamic> j, int index) {
    return _Technique(
      name: j['name'] as String,
      subtitle: j['subtitle'] as String,
      description: j['description'] as String,
      steps: (j['steps'] as List).cast<String>(),
      benefits: (j['benefits'] as List).cast<String>(),
      icon: _icons[index % _icons.length],
    );
  }
}
