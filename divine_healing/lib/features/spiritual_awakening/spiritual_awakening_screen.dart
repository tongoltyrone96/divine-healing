import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:go_router/go_router.dart';

import '../../theme.dart';

/// Spiritual Awakening — hero text, Benefits, What to Expect, Reflection
/// Prompts, FAQs, and a "Book coaching with Strawberry Hope" CTA (per client).
class SpiritualAwakeningScreen extends StatefulWidget {
  const SpiritualAwakeningScreen({super.key});

  @override
  State<SpiritualAwakeningScreen> createState() =>
      _SpiritualAwakeningScreenState();
}

class _SpiritualAwakeningScreenState extends State<SpiritualAwakeningScreen> {
  Future<_SAData>? _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_SAData> _load() async {
    final raw = await rootBundle
        .loadString('assets/content/spiritual_awakening.json');
    return _SAData.fromJson(json.decode(raw) as Map<String, dynamic>);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Spiritual Awakening'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: FutureBuilder<_SAData>(
        future: _future,
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final d = snap.data!;
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
            children: [
              _hero(d.heroText),
              const SizedBox(height: 20),
              if (d.overview.isNotEmpty) ...[
                _JourneyCard(
                  heading: 'What Awakening Is',
                  body: d.overview.join('\n\n'),
                ),
                const SizedBox(height: 12),
              ],
              for (final section in d.journey) ...[
                _JourneyCard(heading: section.heading, body: section.body),
                const SizedBox(height: 12),
              ],
              const SizedBox(height: 8),
              _ListCard(
                title: 'Benefits of Awakening',
                icon: Icons.star_border,
                iconColor: DHColors.sunlightGold,
                items: d.benefits,
              ),
              const SizedBox(height: 12),
              _ListCard(
                title: 'What to Expect',
                icon: Icons.explore_outlined,
                iconColor: DHColors.mossGreen,
                items: d.whatToExpect,
              ),
              const SizedBox(height: 12),
              _ListCard(
                title: 'Reflection Prompts',
                icon: Icons.edit_note,
                iconColor: DHColors.strawberryBlush,
                items: d.reflectionPrompts,
                numbered: true,
                intro: d.reflectionIntro,
              ),
              const SizedBox(height: 12),
              _FaqCard(faqs: d.faqs),
              const SizedBox(height: 20),
              _bookingCta(),
            ],
          );
        },
      ),
    );
  }

  Widget _hero(String text) => Container(
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
            const Icon(Icons.wb_sunny_outlined,
                color: DHColors.sunlightGold, size: 28),
            const SizedBox(height: 8),
            Text(
              text,
              style: DHTypography.body(size: 14, height: 1.6),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );

  Widget _bookingCta() => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: DHColors.strawberryBlush.withOpacity(0.1),
          borderRadius: BorderRadius.circular(DHRadius.card),
          border:
              Border.all(color: DHColors.strawberryBlush.withOpacity(0.4)),
        ),
        child: Column(
          children: [
            const Icon(Icons.event_available,
                size: 30, color: DHColors.strawberryBlush),
            const SizedBox(height: 8),
            Text('Book coaching with Strawberry Hope',
                style: DHTypography.heading(
                    size: 16, color: DHColors.strawberryBlush),
                textAlign: TextAlign.center),
            const SizedBox(height: 4),
            Text(
              'One-on-one guidance to support your awakening journey.',
              style: DHTypography.body(size: 12, color: DHColors.secondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 14),
            ElevatedButton.icon(
              onPressed: () => context.push('/booking'),
              icon: const Icon(Icons.calendar_month, size: 18),
              label: const Text('Book now'),
            ),
          ],
        ),
      );
}

// ============================================================
// Bullet / numbered list card
// ============================================================
class _ListCard extends StatelessWidget {
  const _ListCard({
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.items,
    this.numbered = false,
    this.intro,
  });

  final String title;
  final IconData icon;
  final Color iconColor;
  final List<String> items;
  final bool numbered;
  /// Lead-in line from the original page, shown above the list.
  final String? intro;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold.withOpacity(0.3)),
        boxShadow: DHShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 16, color: iconColor),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(title, style: DHTypography.heading(size: 16)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (intro != null) ...[
            Text(intro!, style: DHTypography.body(size: 13, height: 1.5)),
            const SizedBox(height: 10),
          ],
          for (var i = 0; i < items.length; i++)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (numbered)
                    Container(
                      width: 20,
                      height: 20,
                      margin: const EdgeInsets.only(right: 10, top: 1),
                      decoration: BoxDecoration(
                        color: iconColor.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Text('${i + 1}',
                          style: DHTypography.button(
                              size: 10, color: iconColor)),
                    )
                  else
                    Padding(
                      padding: const EdgeInsets.only(top: 8, right: 10),
                      child: Container(
                        width: 4,
                        height: 4,
                        decoration:
                            BoxDecoration(color: iconColor, shape: BoxShape.circle),
                      ),
                    ),
                  Expanded(
                    child: Text(items[i],
                        style: DHTypography.body(size: 13, height: 1.5)),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// ============================================================
// FAQs accordion
// ============================================================
class _FaqCard extends StatelessWidget {
  const _FaqCard({required this.faqs});
  final List<({String q, String a})> faqs;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold.withOpacity(0.3)),
        boxShadow: DHShadows.card,
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 4),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: DHColors.mossGreen.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.help_outline,
                        size: 16, color: DHColors.mossGreen),
                  ),
                  const SizedBox(width: 10),
                  Text('Frequently asked',
                      style: DHTypography.heading(size: 16)),
                ],
              ),
            ),
            for (final f in faqs)
              ExpansionTile(
                tilePadding: const EdgeInsets.symmetric(horizontal: 12),
                childrenPadding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                iconColor: DHColors.forestGreen,
                collapsedIconColor: DHColors.forestGreen,
                title: Text(f.q,
                    style: DHTypography.heading(size: 14)),
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(f.a,
                        style: DHTypography.body(
                            size: 13,
                            height: 1.55,
                            color: DHColors.secondary)),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

// ============================================================
// The Journey — one long-form section
// ============================================================
class _JourneyCard extends StatelessWidget {
  const _JourneyCard({required this.heading, required this.body});

  final String heading;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.softSage.withOpacity(0.5)),
        boxShadow: DHShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: DHColors.softSage.withOpacity(0.45),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.auto_awesome,
                    size: 16, color: DHColors.forestGreen),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(heading, style: DHTypography.heading(size: 17)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // The source separates paragraphs with blank lines; keeping them as
          // separate Text runs preserves the pacing of the writing.
          for (final para in body.split('\n\n').where((p) => p.trim().isNotEmpty))
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Text(
                para.trim(),
                style: DHTypography.body(size: 14, height: 1.65),
              ),
            ),
        ],
      ),
    );
  }
}

// ============================================================
// Data
// ============================================================
class _SAData {
  const _SAData({
    required this.heroText,
    required this.overview,
    required this.reflectionIntro,
    required this.journey,
    required this.benefits,
    required this.whatToExpect,
    required this.reflectionPrompts,
    required this.faqs,
  });

  final String heroText;
  /// The Overview tab's plain-language definition of awakening — the first
  /// thing a newcomer reads, and absent until now.
  final List<String> overview;
  final String? reflectionIntro;
  /// The original page's "The Journey" tab — Strawberry Hope's long-form
  /// writing, which the first content extraction dropped entirely.
  final List<({String heading, String body})> journey;
  final List<String> benefits;
  final List<String> whatToExpect;
  final List<String> reflectionPrompts;
  final List<({String q, String a})> faqs;

  factory _SAData.fromJson(Map<String, dynamic> j) {
    final faqsRaw = (j['faqs'] as List).cast<Map<String, dynamic>>();
    final journeyRaw =
        ((j['journey'] as List?) ?? const []).cast<Map<String, dynamic>>();
    return _SAData(
      heroText: j['hero_text'] as String,
      overview: ((j['overview'] as List?) ?? const []).cast<String>(),
      reflectionIntro: j['reflection_intro'] as String?,
      journey: journeyRaw
          .map((b) => (heading: b['heading'] as String, body: b['body'] as String))
          .toList(),
      benefits: (j['benefits'] as List).cast<String>(),
      whatToExpect: (j['what_to_expect'] as List).cast<String>(),
      reflectionPrompts: (j['reflection_prompts'] as List).cast<String>(),
      faqs: faqsRaw
          .map((f) => (q: f['q'] as String, a: f['a'] as String))
          .toList(),
    );
  }
}
