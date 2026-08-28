import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/content_session.dart';
import '../../providers/audio_providers.dart';
import '../../providers/auth_providers.dart';
import '../../providers/content_providers.dart';
import '../../theme.dart';
import '../player/session_playback.dart';

/// Step 2 of the Shadow Work journey — the guided meditation itself.
///
/// This was a mock: a play button that toggled an icon and a caption reading
/// "Playing (preview)". "Shadow Work Meditation" has real audio in Storage, so
/// the middle step of the journey played nothing at all.
///
/// It now drives the same audio handler as the session player, which means
/// background playback and lock-screen controls work here too — the step a
/// listener is most likely to close their eyes during.
class MeditationStep extends ConsumerStatefulWidget {
  const MeditationStep({
    super.key,
    required this.contentId,
    required this.onBack,
    required this.onNext,
  });

  final int contentId;
  final VoidCallback onBack;
  final VoidCallback onNext;

  @override
  ConsumerState<MeditationStep> createState() => _MeditationStepState();
}

class _MeditationStepState extends ConsumerState<MeditationStep> {
  bool _loading = false;
  String? _error;

  Future<void> _handleTap(ContentSession session) async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final outcome = await togglePlayback(ref, session);
    if (!mounted) return;

    setState(() {
      _loading = false;
      _error = switch (outcome) {
        PlaybackOutcome.unavailable => 'This meditation has no audio yet.',
        PlaybackOutcome.failed => 'Audio failed to load. Please try again.',
        _ => null,
      };
    });

    if (outcome == PlaybackOutcome.denied) _promptPaywall();
  }

  void _promptPaywall() {
    final signedIn = ref.read(isSignedInProvider);
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Unlock the full library'),
        content: Text(
          signedIn
              ? 'Start your 7-day free trial to listen to the shadow work '
                  'meditation and every other session. You can still read the '
                  'explanation and write your reflections.'
              : 'Sign in and start your 7-day free trial to listen to the '
                  'shadow work meditation.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Not now'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.push(signedIn ? '/profile' : '/sign-in');
            },
            child: Text(signedIn ? 'Start free trial' : 'Sign in'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final sessionAsync = ref.watch(sessionByIdProvider(widget.contentId));

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        Text(
          sessionAsync.valueOrNull?.title ?? 'Shadow Work Meditation',
          style: DHTypography.heading(size: 20, weight: FontWeight.w600),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 6),
        Center(
          child: Container(width: 32, height: 2, color: DHColors.sunlightGold),
        ),
        const SizedBox(height: 22),
        sessionAsync.when(
          loading: () => const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (e, _) => _playerCard(session: null),
          data: (session) => _playerCard(session: session),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: widget.onBack,
                icon: const Icon(Icons.arrow_back, size: 18),
                label: const Text('Back'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: widget.onNext,
                icon: const Icon(Icons.arrow_forward, size: 18),
                label: const Text('Continue to Reflection'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _playerCard({required ContentSession? session}) {
    final player = ref.watch(audioHandlerProvider);
    final isCurrentTrack = session != null &&
        player.currentSessionId == session.id;

    final playing =
        isCurrentTrack && (ref.watch(audioPlayingProvider).valueOrNull ?? false);
    final position = isCurrentTrack
        ? (ref.watch(audioPositionProvider).valueOrNull ?? Duration.zero)
        : Duration.zero;
    final duration = isCurrentTrack
        ? (ref.watch(audioDurationProvider).valueOrNull ?? Duration.zero)
        : Duration.zero;

    return Container(
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
            // A signed-out visitor cannot see paid rows at all — RLS returns
            // nothing for them — so the session is null rather than locked.
            // Tapping still has to explain itself instead of doing nothing.
            onTap: _loading
                ? null
                : () => session == null
                    ? _promptPaywall()
                    : _handleTap(session),
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
                  if (_loading)
                    const SizedBox(
                      width: 30,
                      height: 30,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  else
                    Icon(playing ? Icons.pause : Icons.play_arrow,
                        size: 42, color: Colors.white),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Only meaningful once the track is loaded; before that the bar
          // would sit at zero and look broken.
          if (isCurrentTrack && duration > Duration.zero) ...[
            SliderTheme(
              data: SliderTheme.of(context).copyWith(
                trackHeight: 3,
                activeTrackColor: DHColors.sunlightGold,
                inactiveTrackColor: Colors.white.withOpacity(0.25),
                thumbColor: DHColors.sunlightGold,
                overlayColor: DHColors.sunlightGold.withOpacity(0.2),
                thumbShape:
                    const RoundSliderThumbShape(enabledThumbRadius: 6),
              ),
              child: Slider(
                value: position.inMilliseconds
                    .clamp(0, duration.inMilliseconds)
                    .toDouble(),
                max: duration.inMilliseconds.toDouble(),
                onChanged: (v) => ref
                    .read(audioHandlerProvider)
                    .seek(Duration(milliseconds: v.round())),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(formatDuration(position),
                      style: DHTypography.caption(
                          color: Colors.white.withOpacity(0.8))),
                  Text(formatDuration(duration),
                      style: DHTypography.caption(
                          color: Colors.white.withOpacity(0.8))),
                ],
              ),
            ),
          ] else
            Text(
              _loading
                  ? 'Loading…'
                  : session == null
                      ? 'Sign in to listen'
                      : 'Tap to begin',
              style: DHTypography.caption(color: DHColors.sunlightGold),
            ),

          if (_error != null) ...[
            const SizedBox(height: 10),
            Text(
              _error!,
              style: DHTypography.caption(color: Colors.white),
              textAlign: TextAlign.center,
            ),
          ],

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
    );
  }
}
