import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../providers/auth_providers.dart';
import '../../providers/user_data_providers.dart';
import '../../theme.dart';
import 'explanation_step.dart';

/// Shadow Work — 3-step wizard: Explanation → Meditation → Reflection.
///
/// Reflection saves the 7 prompt answers to Supabase (sh_shadow_work_responses)
/// for signed-in users. Anonymous users fall back to SharedPreferences.
class ShadowWorkScreen extends ConsumerStatefulWidget {
  const ShadowWorkScreen({super.key, required this.contentId});
  final String contentId;

  @override
  ConsumerState<ShadowWorkScreen> createState() => _ShadowWorkScreenState();
}

class _ShadowWorkScreenState extends ConsumerState<ShadowWorkScreen> {
  static const _stepNames = ['Explanation', 'Meditation', 'Reflection'];

  int _step = 0;
  bool _playing = false;
  List<String> _prompts = const [];
  final _controllers = <int, TextEditingController>{};

  @override
  void initState() {
    super.initState();
    _load();
  }

  int get _contentIdInt => int.tryParse(widget.contentId) ?? 0;

  Future<void> _load() async {
    final raw =
        await rootBundle.loadString('assets/content/shadow_work_prompts.json');
    final map = json.decode(raw) as Map<String, dynamic>;
    final prompts = (map['prompts'] as List).cast<String>();

    // Cloud-first: try Supabase for signed-in users.
    Map<int, String> cloud = {};
    final repo = ref.read(userDataRepositoryProvider);
    if (repo != null && repo.isSignedIn) {
      try {
        cloud = await repo.loadShadowWorkResponses(_contentIdInt);
      } catch (_) {
        // fall back to local
      }
    }
    // Local fallback (or as merge for anonymous users).
    final prefs = await SharedPreferences.getInstance();

    if (!mounted) return;
    setState(() {
      _prompts = prompts;
      for (var i = 0; i < prompts.length; i++) {
        final cloudVal = cloud[i];
        final localVal = prefs.getString(_prefsKey(i));
        _controllers[i] = TextEditingController(
          text: cloudVal ?? localVal ?? '',
        );
      }
    });
  }

  String _prefsKey(int i) =>
      'shadow_work_${widget.contentId}_prompt_${i + 1}';

  Future<void> _save() async {
    final anyText =
        _controllers.values.any((c) => c.text.trim().isNotEmpty);
    if (!anyText) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Write at least one reflection to save.')),
      );
      return;
    }

    // Always keep a local copy so users don't lose progress.
    final prefs = await SharedPreferences.getInstance();
    for (final e in _controllers.entries) {
      await prefs.setString(_prefsKey(e.key), e.value.text);
    }

    final signedIn = ref.read(isSignedInProvider);
    if (!signedIn) {
      if (!mounted) return;
      final go = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Sign in to sync'),
          content: const Text(
              'Your reflections are saved on this device. Sign in so they '
              'sync to your account and are available on any device.'),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Keep on this device')),
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
      final payload = <int, String>{
        for (final e in _controllers.entries) e.key: e.value.text.trim(),
      };
      await repo.saveShadowWorkResponses(
        contentId: _contentIdInt,
        promptsByZeroIndex: payload,
      );
      ref.invalidate(shadowWorkResponsesProvider(_contentIdInt));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Reflections saved to your account.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Saved locally. Retry to sync to the cloud.')),
      );
    }
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
      backgroundColor:
          _step == 2 ? DHColors.softSage : DHColors.surface,
      appBar: AppBar(
        title: const Text('Shadow Work'),
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
    if (_step == 0) return ExplanationStep(onNext: () => _goto(1));
    if (_step == 1) {
      return _MeditationStep(
        playing: _playing,
        onTogglePlay: () => setState(() => _playing = !_playing),
        onBack: () => _goto(0),
        onNext: () => _goto(2),
      );
    }
    if (_prompts.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    return _ReflectionStep(
      prompts: _prompts,
      controllers: _controllers,
      onBack: () => _goto(1),
      onSave: _save,
    );
  }

  void _goto(int step) {
    setState(() => _step = step);
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
                  width: 100,
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
        color: done ? DHColors.forestGreen : Colors.white,
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
// Step 2 — Meditation player (mock)
// ============================================================
class _MeditationStep extends StatelessWidget {
  const _MeditationStep({
    required this.playing,
    required this.onTogglePlay,
    required this.onBack,
    required this.onNext,
  });
  final bool playing;
  final VoidCallback onTogglePlay;
  final VoidCallback onBack;
  final VoidCallback onNext;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        Text('Shadow Work Meditation',
            style: DHTypography.heading(size: 20, weight: FontWeight.w600),
            textAlign: TextAlign.center),
        const SizedBox(height: 6),
        Center(
          child: Container(
              width: 32, height: 2, color: DHColors.sunlightGold),
        ),
        const SizedBox(height: 22),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [DHColors.forestGreen, DHColors.mossGreen],
            ),
            borderRadius: BorderRadius.circular(DHRadius.card),
            border: Border.all(color: DHColors.sunlightGold.withOpacity(0.4)),
          ),
          child: Column(
            children: [
              InkWell(
                onTap: onTogglePlay,
                borderRadius: BorderRadius.circular(999),
                child: Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [DHColors.sunlightGold, DHColors.softClay],
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: DHColors.sunlightGold.withOpacity(0.4),
                        blurRadius: 20,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Icon(Icons.eco,
                          size: 40, color: Colors.white.withOpacity(0.35)),
                      Icon(playing ? Icons.pause : Icons.play_arrow,
                          size: 42, color: Colors.white),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                playing ? 'Playing (preview)' : 'Tap to start (preview)',
                style: DHTypography.caption(color: DHColors.sunlightGold),
              ),
              const SizedBox(height: 14),
              Text(
                'Take your time with this meditation. Let the guidance help you '
                'explore what is beneath the surface — gently and safely. When '
                'you are ready, tap Continue to Reflection.',
                style: DHTypography.body(
                    size: 13, color: Colors.white.withOpacity(0.9), height: 1.55),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
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
                label: const Text('Continue to Reflection'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ============================================================
// Step 3 — Reflection (client's Journaling spec)
// ============================================================
class _ReflectionStep extends StatelessWidget {
  const _ReflectionStep({
    required this.prompts,
    required this.controllers,
    required this.onBack,
    required this.onSave,
  });
  final List<String> prompts;
  final Map<int, TextEditingController> controllers;
  final VoidCallback onBack;
  final VoidCallback onSave;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: DHColors.sunlightGold.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.book_outlined,
                  color: DHColors.sunlightGold, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('SHADOW WORK',
                      style: DHTypography.caption(color: DHColors.mossGreen)),
                  Text('Reflection Prompts',
                      style: DHTypography.heading(
                          size: 20, weight: FontWeight.w600)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'These questions help you understand what came up for you during '
          'the meditation. Take your time — there are no right or wrong answers.',
          style:
              DHTypography.body(size: 13, color: DHColors.secondary, height: 1.5),
        ),
        const SizedBox(height: 18),
        for (var i = 0; i < prompts.length; i++) ...[
          _JournalBox(
            index: i + 1,
            prompt: prompts[i],
            controller: controllers[i]!,
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
              child: ElevatedButton(
                onPressed: onSave,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.auto_awesome,
                        size: 16, color: DHColors.sunlightGold),
                    const SizedBox(width: 8),
                    const Text('Save'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _JournalBox extends StatelessWidget {
  const _JournalBox({
    required this.index,
    required this.prompt,
    required this.controller,
  });
  final int index;
  final String prompt;
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold, width: 1.2),
        boxShadow: DHShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.eco,
                  size: 18, color: DHColors.sunlightGold),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: DHColors.sunlightGold.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text('$index',
                    style: DHTypography.button(
                        size: 10, color: DHColors.forestGreen)),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(prompt,
                    style: DHTypography.heading(size: 13)),
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
              hintText: 'Write what came up for you...',
              hintStyle:
                  DHTypography.body(size: 13, color: DHColors.secondary),
              filled: true,
              fillColor: DHColors.sageMist,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(DHRadius.image),
                borderSide: BorderSide(
                    color: DHColors.sunlightGold.withOpacity(0.3)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(DHRadius.image),
                borderSide: BorderSide(
                    color: DHColors.sunlightGold.withOpacity(0.3)),
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
