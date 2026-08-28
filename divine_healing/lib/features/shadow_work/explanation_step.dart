import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;

import '../../theme.dart';

/// Step 1 of the Shadow Work journey — the same explanation before every
/// shadow work session.
///
/// Rendered from `assets/content/shadow_work_explanation.json` rather than
/// from strings in this file. The copy used to be transcribed by hand, and
/// three whole sections were missing while the rest had been quietly reworded
/// and trimmed. Reading it from the extracted data means the client's wording
/// is what ships, and re-running data/10_extract_shadow_work.js is enough to
/// pick up any edit she makes.
class ExplanationStep extends StatefulWidget {
  const ExplanationStep({super.key, required this.onNext});

  final VoidCallback onNext;

  @override
  State<ExplanationStep> createState() => _ExplanationStepState();
}

class _ExplanationStepState extends State<ExplanationStep> {
  Future<_Explanation>? _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_Explanation> _load() async {
    final raw = await rootBundle
        .loadString('assets/content/shadow_work_explanation.json');
    return _Explanation.fromJson(json.decode(raw) as Map<String, dynamic>);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<_Explanation>(
      future: _future,
      builder: (context, snap) {
        if (!snap.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        final d = snap.data!;
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          children: [
            _header(),
            const SizedBox(height: 20),
            _card([for (final p in d.intro) _paragraph(p)]),
            for (final section in d.sections) ...[
              const SizedBox(height: 12),
              _card([
                Text(section.title, style: DHTypography.heading(size: 14)),
                const SizedBox(height: 8),
                for (final block in section.blocks)
                  if (block.isBullets)
                    ...block.items.map(_bullet)
                  else
                    _paragraph(block.text),
              ]),
            ],
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: widget.onNext,
                icon: const Icon(Icons.headphones, size: 18),
                label: const Text('Start Meditation'),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _header() => Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: DHColors.sunlightGold.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.flash_on,
                color: DHColors.sunlightGold, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('SHADOW WORK',
                    style: DHTypography.caption(color: DHColors.mossGreen)),
                Text(
                  'What Shadow Work Really Is',
                  style:
                      DHTypography.heading(size: 20, weight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ],
      );

  Widget _paragraph(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Text(
          text,
          style: DHTypography.body(
              size: 13, height: 1.6, color: DHColors.secondary),
        ),
      );

  Widget _bullet(String text) => Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 6),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.only(top: 6, right: 8),
              child:
                  Icon(Icons.circle, size: 6, color: DHColors.sunlightGold),
            ),
            Expanded(
              child: Text(
                text,
                style: DHTypography.body(
                    size: 13, height: 1.55, color: DHColors.secondary),
              ),
            ),
          ],
        ),
      );

  Widget _card(List<Widget> children) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(DHRadius.card),
          border: Border.all(color: DHColors.sunlightGold.withOpacity(0.3)),
          boxShadow: DHShadows.card,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: children,
        ),
      );
}

// ============================================================
// Data
// ============================================================

/// A paragraph, or a run of bullets. The original interleaves them — a list
/// of trigger questions sits between two paragraphs — so order is preserved
/// rather than grouping all the prose and then all the bullets.
class _Block {
  const _Block.paragraph(this.text)
      : isBullets = false,
        items = const [];
  const _Block.bullets(this.items)
      : isBullets = true,
        text = '';

  final bool isBullets;
  final String text;
  final List<String> items;

  factory _Block.fromJson(Map<String, dynamic> j) {
    if (j['type'] == 'bullets') {
      return _Block.bullets((j['items'] as List).cast<String>());
    }
    return _Block.paragraph(j['text'] as String);
  }
}

class _Section {
  const _Section({required this.title, required this.blocks});

  final String title;
  final List<_Block> blocks;
}

class _Explanation {
  const _Explanation({required this.intro, required this.sections});

  final List<String> intro;
  final List<_Section> sections;

  factory _Explanation.fromJson(Map<String, dynamic> j) {
    return _Explanation(
      intro: (j['intro'] as List).cast<String>(),
      sections: (j['sections'] as List)
          .cast<Map<String, dynamic>>()
          .map((s) => _Section(
                title: s['title'] as String,
                blocks: (s['blocks'] as List)
                    .cast<Map<String, dynamic>>()
                    .map(_Block.fromJson)
                    .toList(),
              ))
          .toList(),
    );
  }
}
