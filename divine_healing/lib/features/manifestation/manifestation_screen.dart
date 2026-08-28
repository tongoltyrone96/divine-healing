import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_providers.dart';
import '../../providers/user_data_providers.dart';
import '../../theme.dart';

/// Manifestation — 3-step wizard:
///   1) Understanding Manifestation (intro text)
///   2) The Inner Work (intro text)
///   3) Exercise (5-field form; saves to sh_manifestation_responses)
class ManifestationScreen extends ConsumerStatefulWidget {
  const ManifestationScreen({super.key});

  @override
  ConsumerState<ManifestationScreen> createState() =>
      _ManifestationScreenState();
}

class _ManifestationScreenState extends ConsumerState<ManifestationScreen> {
  int _step = 0;
  Future<List<_FormField>>? _fields;

  static const _stepNames = ['Understanding', 'Inner Work', 'Exercise'];

  final _controllers = <String, TextEditingController>{};

  @override
  void initState() {
    super.initState();
    _fields = _loadFields();
  }

  Future<List<_FormField>> _loadFields() async {
    final raw =
        await rootBundle.loadString('assets/content/manifestation_form.json');
    final map = json.decode(raw) as Map<String, dynamic>;
    final list = (map['fields'] as List).cast<Map<String, dynamic>>();
    final fields = list
        .map((f) => _FormField(
              key: f['key'] as String,
              label: f['label'] as String,
              placeholder: f['placeholder'] as String,
            ))
        .toList();
    for (final f in fields) {
      _controllers[f.key] = TextEditingController();
    }
    return fields;
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manifestation'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: Column(
        children: [
          _stepIndicator(),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 220),
              switchInCurve: Curves.easeOutCubic,
              switchOutCurve: Curves.easeInCubic,
              child: KeyedSubtree(
                key: ValueKey(_step),
                child: _stepChild(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepChild() {
    if (_step == 0) return _UnderstandingStep(onNext: () => _goto(1));
    if (_step == 1) {
      return _InnerWorkStep(onBack: () => _goto(0), onNext: () => _goto(2));
    }
    return FutureBuilder<List<_FormField>>(
      future: _fields,
      builder: (context, snap) {
        if (!snap.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        return _ExerciseStep(
          fields: snap.data!,
          controllers: _controllers,
          onBack: () => _goto(1),
          onSave: _save,
        );
      },
    );
  }

  void _goto(int step) {
    setState(() => _step = step);
  }

  Future<void> _save() async {
    final anyFilled =
        _controllers.values.any((c) => c.text.trim().isNotEmpty);
    if (!anyFilled) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Write at least one answer to save.')),
      );
      return;
    }

    final signedIn = ref.read(isSignedInProvider);
    if (!signedIn) {
      final go = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Sign in required'),
          content: const Text('Sign in to save your exercise to your account '
              'so you can see it on any device.'),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Not now')),
            ElevatedButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Sign in')),
          ],
        ),
      );
      if (go == true && mounted) context.push('/sign-in');
      return;
    }

    final repo = ref.read(userDataRepositoryProvider);
    if (repo == null) return;
    try {
      final payload = <String, String>{
        for (final entry in _controllers.entries)
          entry.key: entry.value.text.trim(),
      };
      await repo.saveManifestation(payload);
      ref.invalidate(latestManifestationProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Manifestation saved to your account.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not save. Please try again.')),
      );
    }
  }

  Widget _stepIndicator() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Column(
        children: [
          Row(
            children: [
              for (var i = 0; i < _stepNames.length; i++) ...[
                _dot(i),
                if (i < _stepNames.length - 1)
                  Expanded(
                    child: Container(
                      height: 2,
                      margin: const EdgeInsets.symmetric(horizontal: 6),
                      color: i < _step
                          ? DHColors.forestGreen
                          : DHColors.sunlightGold.withOpacity(0.35),
                    ),
                  ),
              ],
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              for (var i = 0; i < _stepNames.length; i++)
                SizedBox(
                  width: 90,
                  child: Text(
                    _stepNames[i],
                    style: DHTypography.caption(
                      color: i <= _step
                          ? DHColors.forestGreen
                          : DHColors.secondary,
                    ),
                    textAlign: i == 0
                        ? TextAlign.left
                        : i == _stepNames.length - 1
                            ? TextAlign.right
                            : TextAlign.center,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _dot(int i) {
    final done = i < _step;
    final current = i == _step;
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        color: done
            ? DHColors.forestGreen
            : current
                ? Colors.white
                : Colors.white,
        border: Border.all(
          color: current || done
              ? DHColors.forestGreen
              : DHColors.sunlightGold.withOpacity(0.5),
          width: current ? 2.5 : 1.5,
        ),
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: done
          ? const Icon(Icons.check, size: 14, color: Colors.white)
          : Text('${i + 1}',
              style: DHTypography.button(
                size: 11,
                color: current ? DHColors.forestGreen : DHColors.secondary,
              )),
    );
  }
}

// ============================================================
// Step 1 — Understanding
// ============================================================
class _UnderstandingStep extends StatelessWidget {
  const _UnderstandingStep({required this.onNext});
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        _SectionHeader(
          title: 'Understanding Manifestation',
          subtitle:
              'Learn how your beliefs, focus, and perception shape the life you experience.',
        ),
        const SizedBox(height: 16),
        _AccentQuote(
          text:
              'Manifestation is the process of becoming aware of your beliefs, focusing on what you want, and aligning your inner world with the life you desire.',
        ),
        const SizedBox(height: 14),
        _BodyParagraph(
          "You are manifesting 24/7. The life you are living is based on what you have created. You can learn to work with this and create a life you desire — one that fulfils you and makes you happy. The life you are living is shaped by your beliefs and where you place your attention.",
        ),
        _BodyParagraph(
          "Life is a mirror of your inner being. If you focus on what you want, rather than what you dislike, you will attract more of it. People often sit in victimhood and think they can't achieve great things. This mindset keeps you stuck. You can achieve anything, and it all starts with inner work.",
        ),
        _BodyParagraph(
          "Most people live based on the past. We cling to it so much that it creates a false perception of reality. The first step is to become aware. Once you realise that you are the only one holding yourself back, it becomes much easier to feel motivated to do the work and change.",
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: onNext,
            icon: const Icon(Icons.arrow_forward, size: 18),
            label: const Text('Continue to Inner Work'),
          ),
        ),
      ],
    );
  }
}

// ============================================================
// Step 2 — Inner Work
// ============================================================
class _InnerWorkStep extends StatelessWidget {
  const _InnerWorkStep({required this.onBack, required this.onNext});
  final VoidCallback onBack;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        _SectionHeader(
          title: 'The Inner Work',
          subtitle:
              'Why self-worth, belief, and inner work are essential before manifestation can fully align.',
        ),
        const SizedBox(height: 16),
        _BodyParagraph(
          "The most important part of manifesting is believing in yourself and believing that you are worthy. If you do not work on your inner being first, it will not work. Everything starts from within. Shadow work can tie in very well with this — it can help you get to the bottom of your beliefs, creating a wider range of possibilities for your future.",
        ),
        _BodyParagraph(
          "Once you know your worth and live with confidence and love for yourself, you will attract great things. You will know that your dreams and goals are achievable because you deserve them. If you believe everything is hard for you, that's the reality you'll keep perceiving. Change the belief and your perception widens.",
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: onBack,
                icon: const Icon(Icons.arrow_back, size: 18),
                label: const Text('Back'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: onNext,
                icon: const Icon(Icons.arrow_forward, size: 18),
                label: const Text('Start Exercise'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ============================================================
// Step 3 — Exercise (5-field form)
// ============================================================
class _ExerciseStep extends StatelessWidget {
  const _ExerciseStep({
    required this.fields,
    required this.controllers,
    required this.onBack,
    required this.onSave,
  });

  final List<_FormField> fields;
  final Map<String, TextEditingController> controllers;
  final VoidCallback onBack;
  final VoidCallback onSave;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        _SectionHeader(
          title: 'Your Manifestation',
          subtitle:
              'Answer honestly. Your responses stay private and support your journey.',
        ),
        const SizedBox(height: 16),
        for (var i = 0; i < fields.length; i++) ...[
          _FieldCard(
            index: i + 1,
            field: fields[i],
            controller: controllers[fields[i].key]!,
          ),
          const SizedBox(height: 12),
        ],
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: onBack,
                icon: const Icon(Icons.arrow_back, size: 18),
                label: const Text('Back'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: onSave,
                icon: const Icon(Icons.check, size: 18),
                label: const Text('Save'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _FieldCard extends StatelessWidget {
  const _FieldCard({
    required this.index,
    required this.field,
    required this.controller,
  });
  final int index;
  final _FormField field;
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold.withOpacity(0.35)),
        boxShadow: DHShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: DHColors.sunlightGold.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text('$index',
                    style: DHTypography.button(
                        size: 11, color: DHColors.forestGreen)),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(field.label,
                    style: DHTypography.heading(size: 14)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          TextField(
            controller: controller,
            maxLines: 4,
            minLines: 3,
            style: DHTypography.body(size: 13),
            decoration: InputDecoration(
              hintText: field.placeholder,
              hintStyle:
                  DHTypography.body(size: 13, color: DHColors.secondary),
              filled: true,
              fillColor: DHColors.sageMist,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(DHRadius.image),
                borderSide: BorderSide(
                    color: DHColors.sunlightGold.withOpacity(0.25)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(DHRadius.image),
                borderSide: BorderSide(
                    color: DHColors.sunlightGold.withOpacity(0.25)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(DHRadius.image),
                borderSide:
                    const BorderSide(color: DHColors.forestGreen, width: 1.4),
              ),
              contentPadding: const EdgeInsets.all(12),
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================
// Shared components
// ============================================================
class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.subtitle});
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title,
            style: DHTypography.heading(size: 24, weight: FontWeight.w600)),
        const SizedBox(height: 6),
        Text(subtitle,
            style: DHTypography.body(size: 13, color: DHColors.secondary)),
      ],
    );
  }
}

class _AccentQuote extends StatelessWidget {
  const _AccentQuote({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: DHColors.sandstone.withOpacity(0.5),
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border(
          left: BorderSide(color: DHColors.sunlightGold, width: 3),
        ),
      ),
      child: Text(
        text,
        style: DHTypography.body(size: 13, color: DHColors.forestGreen).copyWith(
          fontStyle: FontStyle.italic,
          height: 1.55,
        ),
      ),
    );
  }
}

class _BodyParagraph extends StatelessWidget {
  const _BodyParagraph(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(text,
          style: DHTypography.body(
              size: 13, height: 1.6, color: DHColors.secondary)),
    );
  }
}

class _FormField {
  const _FormField({
    required this.key,
    required this.label,
    required this.placeholder,
  });
  final String key;
  final String label;
  final String placeholder;
}
