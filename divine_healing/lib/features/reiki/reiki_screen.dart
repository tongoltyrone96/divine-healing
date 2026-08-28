import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:go_router/go_router.dart';

import '../../theme.dart';

/// Reiki — the page the original Glide app showed for "Introduction to Reiki".
///
/// This session has no audio; it is entirely written content, and none of it
/// shipped until now: the coverage audit found 0 of 16 passages present. The
/// original ran as four screens with next/back navigation. Here they are one
/// scroll, which suits a phone better and means nothing is hidden behind a
/// step the reader might not reach.
///
/// Per the client's 2026-08-25 notes, the page ends with a booking CTA.
class ReikiScreen extends StatefulWidget {
  const ReikiScreen({super.key});

  @override
  State<ReikiScreen> createState() => _ReikiScreenState();
}

class _ReikiScreenState extends State<ReikiScreen> {
  Future<_ReikiData>? _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_ReikiData> _load() async {
    final raw = await rootBundle.loadString('assets/content/reiki.json');
    return _ReikiData.fromJson(json.decode(raw) as Map<String, dynamic>);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reiki'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: FutureBuilder<_ReikiData>(
        future: _future,
        builder: (context, snap) {
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final d = snap.data!;
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
            children: [
              _hero(d.whatIsReiki.paragraphs.first),
              const SizedBox(height: 20),
              _ProseCard(
                title: d.whatIsReiki.title,
                icon: Icons.spa_outlined,
                iconColor: DHColors.mossGreen,
                // The first paragraph is already the hero.
                paragraphs: d.whatIsReiki.paragraphs.skip(1).toList(),
              ),
              const SizedBox(height: 12),
              _ProseCard(
                title: d.whatToExpect.title,
                icon: Icons.self_improvement,
                iconColor: DHColors.forestGreen,
                paragraphs: d.whatToExpect.paragraphs,
                bulletLabel: d.whatToExpect.experienceLabel,
                bullets: d.whatToExpect.experiences,
              ),
              const SizedBox(height: 12),
              _ListCard(
                title: d.benefits.title,
                icon: Icons.favorite_border,
                iconColor: DHColors.strawberryBlush,
                items: d.benefits.items,
              ),
              const SizedBox(height: 12),
              _FaqCard(title: d.faqs.title, faqs: d.faqs.items),
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
            const Icon(Icons.pan_tool_outlined,
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
          border: Border.all(color: DHColors.strawberryBlush.withOpacity(0.4)),
        ),
        child: Column(
          children: [
            const Icon(Icons.event_available,
                size: 30, color: DHColors.strawberryBlush),
            const SizedBox(height: 8),
            Text('Book a session with Strawberry Hope',
                style: DHTypography.heading(size: 16),
                textAlign: TextAlign.center),
            const SizedBox(height: 6),
            Text(
              'Reiki can be given in person or at a distance over Zoom.',
              style: DHTypography.body(size: 13, height: 1.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: DHColors.strawberryBlush,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 13),
                ),
                onPressed: () => context.push('/booking'),
                icon: const Icon(Icons.calendar_month, size: 18),
                label: const Text('Book a Session'),
              ),
            ),
          ],
        ),
      );
}

// ============================================================
// Paragraphs, optionally followed by a labelled bullet list
// ============================================================
class _ProseCard extends StatelessWidget {
  const _ProseCard({
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.paragraphs,
    this.bulletLabel,
    this.bullets = const [],
  });

  final String title;
  final IconData icon;
  final Color iconColor;
  final List<String> paragraphs;
  final String? bulletLabel;
  final List<String> bullets;

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
          for (final p in paragraphs)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Text(p, style: DHTypography.body(size: 13, height: 1.6)),
            ),
          if (bullets.isNotEmpty) ...[
            if (bulletLabel != null) ...[
              const SizedBox(height: 2),
              Text(bulletLabel!, style: DHTypography.heading(size: 14)),
              const SizedBox(height: 8),
            ],
            for (final b in bullets)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 8, right: 10),
                      child: Container(
                        width: 4,
                        height: 4,
                        decoration: BoxDecoration(
                            color: iconColor, shape: BoxShape.circle),
                      ),
                    ),
                    Expanded(
                      child: Text(b,
                          style: DHTypography.body(size: 13, height: 1.5)),
                    ),
                  ],
                ),
              ),
          ],
        ],
      ),
    );
  }
}

// ============================================================
// Bulleted list
// ============================================================
class _ListCard extends StatelessWidget {
  const _ListCard({
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.items,
  });

  final String title;
  final IconData icon;
  final Color iconColor;
  final List<String> items;

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
          for (final item in items)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 8, right: 10),
                    child: Container(
                      width: 4,
                      height: 4,
                      decoration: BoxDecoration(
                          color: iconColor, shape: BoxShape.circle),
                    ),
                  ),
                  Expanded(
                    child: Text(item,
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
// FAQ accordion
// ============================================================
class _FaqCard extends StatelessWidget {
  const _FaqCard({required this.title, required this.faqs});

  final String title;
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
                  Text(title, style: DHTypography.heading(size: 16)),
                ],
              ),
            ),
            for (final f in faqs)
              ExpansionTile(
                tilePadding: const EdgeInsets.symmetric(horizontal: 12),
                childrenPadding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                iconColor: DHColors.forestGreen,
                collapsedIconColor: DHColors.forestGreen,
                title: Text(f.q, style: DHTypography.heading(size: 14)),
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      f.a,
                      style: DHTypography.body(size: 13, height: 1.55),
                    ),
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
// Data
// ============================================================
class _Section {
  const _Section({
    required this.title,
    this.paragraphs = const [],
    this.experienceLabel,
    this.experiences = const [],
    this.items = const [],
  });

  final String title;
  final List<String> paragraphs;
  final String? experienceLabel;
  final List<String> experiences;
  final List<String> items;
}

class _ReikiData {
  const _ReikiData({
    required this.whatIsReiki,
    required this.whatToExpect,
    required this.benefits,
    required this.faqs,
  });

  final _Section whatIsReiki;
  final _Section whatToExpect;
  final _Section benefits;
  final ({String title, List<({String q, String a})> items}) faqs;

  factory _ReikiData.fromJson(Map<String, dynamic> j) {
    List<String> strings(dynamic v) => ((v as List?) ?? const []).cast<String>();

    final expect = j['what_to_expect'] as Map<String, dynamic>;
    final faqsJson = j['faqs'] as Map<String, dynamic>;

    return _ReikiData(
      whatIsReiki: _Section(
        title: (j['what_is_reiki'] as Map<String, dynamic>)['title'] as String,
        paragraphs:
            strings((j['what_is_reiki'] as Map<String, dynamic>)['paragraphs']),
      ),
      whatToExpect: _Section(
        title: expect['title'] as String,
        paragraphs: strings(expect['paragraphs']),
        experienceLabel: expect['experience_label'] as String?,
        experiences: strings(expect['experiences']),
      ),
      benefits: _Section(
        title: (j['benefits'] as Map<String, dynamic>)['title'] as String,
        items: strings((j['benefits'] as Map<String, dynamic>)['items']),
      ),
      faqs: (
        title: faqsJson['title'] as String,
        items: ((faqsJson['items'] as List?) ?? const [])
            .cast<Map<String, dynamic>>()
            .map((f) => (q: f['q'] as String, a: f['a'] as String))
            .toList(),
      ),
    );
  }
}
