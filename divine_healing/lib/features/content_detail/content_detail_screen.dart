import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/content_session.dart';
import '../../providers/audio_providers.dart';
import '../../providers/auth_providers.dart';
import '../../providers/content_providers.dart';
import '../../providers/subscription_providers.dart';
import '../../providers/user_data_providers.dart';
import '../../theme.dart';
import '../player/session_playback.dart';

/// Session detail with a real audio player backed by `just_audio`, streaming
/// from the private `sh-audio` bucket on Supabase Storage via signed URLs.
class ContentDetailScreen extends ConsumerStatefulWidget {
  const ContentDetailScreen({super.key, required this.contentId});
  final int contentId;

  @override
  ConsumerState<ContentDetailScreen> createState() =>
      _ContentDetailScreenState();
}

class _ContentDetailScreenState extends ConsumerState<ContentDetailScreen> {
  bool _audioLoading = false;
  String? _audioError;

  /// Free users only get the 3 preview sessions. Paid users get everything.
  bool _hasAccess(ContentSession session) {
    if (session.isPreview) return true;
    return ref.read(hasFullAccessProvider);
  }

  Future<void> _handlePlayTap(ContentSession session) async {
    setState(() {
      _audioLoading = true;
      _audioError = null;
    });

    // Shared with the Shadow Work meditation step so both screens agree on
    // who may listen and on what a refusal means.
    final outcome = await togglePlayback(ref, session);
    if (!mounted) return;

    setState(() {
      _audioLoading = false;
      _audioError = switch (outcome) {
        PlaybackOutcome.unavailable => 'Audio is not available for this session.',
        PlaybackOutcome.failed => 'Audio failed to load. Please try again.',
        _ => null,
      };
    });

    if (outcome == PlaybackOutcome.denied) _promptPaywall();
  }

  @override
  Widget build(BuildContext context) {
    final sessionAsync = ref.watch(sessionByIdProvider(widget.contentId));
    return Scaffold(
      appBar: AppBar(
        title: Text(sessionAsync.valueOrNull?.title ?? 'Session'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: sessionAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('Session unavailable: $e',
                style: DHTypography.body(size: 14),
                textAlign: TextAlign.center),
          ),
        ),
        data: (session) => session == null
            ? const Center(child: Text('Session not found.'))
            : _buildBody(session),
      ),
    );
  }

  Widget _buildBody(ContentSession s) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _heroHeader(s),
            const SizedBox(height: 22),
            _playerCard(s),
            const SizedBox(height: 22),
            _descriptionCard(s),
            const SizedBox(height: 24),
            _bottomCta(s),
          ],
        ),
      ),
    );
  }

  Widget _heroHeader(ContentSession s) {
    return Container(
      padding: const EdgeInsets.all(20),
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
      child: Column(
        children: [
          _categoryLabel(s.category),
          const SizedBox(height: 12),
          Text(
            s.title,
            style: DHTypography.heading(size: 26, weight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Container(width: 32, height: 2, color: DHColors.sunlightGold),
          if (s.durationMinutes > 0) ...[
            const SizedBox(height: 10),
            Text(
              '${s.durationMinutes} min',
              style: DHTypography.caption(color: DHColors.mossGreen),
            ),
          ],
        ],
      ),
    );
  }

  Widget _categoryLabel(String category) {
    final label = switch (category) {
      'meditation' => 'MEDITATION',
      'shadow_work' => 'SHADOW WORK',
      'reiki' => 'REIKI',
      _ => category.toUpperCase(),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: DHColors.sunlightGold.withOpacity(0.18),
        borderRadius: BorderRadius.circular(DHRadius.chip),
      ),
      child: Text(label,
          style: DHTypography.caption(color: DHColors.forestGreen)),
    );
  }

  Widget _descriptionCard(ContentSession s) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold.withOpacity(0.25)),
        boxShadow: DHShadows.card,
      ),
      child: Text(
        s.description.isNotEmpty
            ? s.description
            : 'Find a quiet space, put on your headphones, and let '
                'the guidance carry you inward.',
        style: DHTypography.body(size: 14, color: DHColors.secondary, height: 1.6),
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _bottomCta(ContentSession s) {
    if (s.category == 'reiki') {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: () => context.push('/reiki'),
          icon: const Icon(Icons.menu_book_outlined, size: 20),
          label: const Text('Read about Reiki'),
        ),
      );
    }
    if (s.category == 'shadow_work') {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: DHColors.strawberryBlush,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(DHRadius.button),
              side: BorderSide(
                  color: DHColors.strawberryBlush.withOpacity(0.6),
                  width: 1),
            ),
          ),
          onPressed: () => context.push('/shadow-work/${s.id}'),
          icon: const Icon(Icons.auto_stories, size: 20),
          label: const Text('Begin Reflection'),
        ),
      );
    }
    if (!_hasAccess(s)) {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: DHColors.strawberryBlush,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
          onPressed: _promptPaywall,
          icon: const Icon(Icons.lock_open, size: 18),
          label: const Text('Start 7-day free trial'),
        ),
      );
    }
    final completed = ref.watch(completedContentProvider).valueOrNull ?? {};
    final isDone = completed.contains(s.id);
    final signedIn = ref.watch(isSignedInProvider);

    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: isDone
            ? null
            : () => _handleMarkComplete(s, signedIn),
        icon: Icon(
            isDone ? Icons.check_circle : Icons.check_circle_outline,
            size: 18),
        label: Text(isDone ? 'Completed' : 'Mark as complete'),
      ),
    );
  }

  Future<void> _handleMarkComplete(ContentSession s, bool signedIn) async {
    if (!signedIn) {
      _promptSignIn('sign in to track your progress');
      return;
    }
    if (!_hasAccess(s)) {
      _promptPaywall();
      return;
    }
    final repo = ref.read(userDataRepositoryProvider);
    if (repo == null) return;
    try {
      await repo.markComplete(s.id);
      ref.invalidate(completedContentProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Session marked as complete.')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not save. Please try again.')),
      );
    }
  }

  void _promptSignIn(String reason) {
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign in required'),
        content: Text('Please $reason.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Not now')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.push('/sign-in');
            },
            child: const Text('Sign in'),
          ),
        ],
      ),
    );
  }

  void _promptPaywall() {
    final signedIn = ref.read(isSignedInProvider);
    final count = ref.read(sessionCountProvider);
    final library =
        count == null ? 'every guided session' : '$count guided sessions';
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Unlock the full library'),
        content: Text(
          signedIn
              ? 'Start your 7-day free trial to access $library. '
                  'Cancel any time before the trial ends and you won’t be '
                  'charged.'
              : 'Sign in and start your 7-day free trial to access '
                  '$library.',
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

  Widget _playerCard(ContentSession s) {
    final playing = ref.watch(audioPlayingProvider).valueOrNull ?? false;
    final position = ref.watch(audioPositionProvider).valueOrNull ??
        Duration.zero;
    final duration =
        ref.watch(audioDurationProvider).valueOrNull ?? Duration.zero;

    final player = ref.read(audioHandlerProvider);
    final isCurrentTrack = player.currentSessionId == s.id;
    final locked = !_hasAccess(s);
    final canPlay = s.hasAudio && !_audioLoading;

    final totalSecs = duration.inSeconds;
    final progress = (isCurrentTrack && totalSecs > 0)
        ? (position.inSeconds / totalSecs).clamp(0.0, 1.0)
        : 0.0;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold.withOpacity(0.35)),
        boxShadow: DHShadows.card,
      ),
      child: Column(
        children: [
          _PlayButton(
            playing: isCurrentTrack && playing,
            loading: _audioLoading,
            enabled: canPlay,
            locked: locked,
            onTap: () => locked ? _promptPaywall() : _handlePlayTap(s),
          ),
          const SizedBox(height: 18),
          if (locked) ...[
            Text(
              'Members only',
              style: DHTypography.caption(color: DHColors.strawberryBlush)
                  .copyWith(fontWeight: FontWeight.w700, letterSpacing: 0.5),
            ),
            const SizedBox(height: 6),
            Text(
              'Start your 7-day free trial to unlock this session.',
              textAlign: TextAlign.center,
              style: DHTypography.body(size: 13, color: DHColors.secondary),
            ),
          ] else if (canPlay && totalSecs > 0) ...[
            _Scrubber(
              position: isCurrentTrack ? position : Duration.zero,
              duration: duration,
              onSeek: (target) => player.seek(target),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(_fmt(isCurrentTrack ? position : Duration.zero),
                    style: DHTypography.caption(color: DHColors.secondary)),
                Text(_fmt(duration),
                    style: DHTypography.caption(color: DHColors.secondary)),
              ],
            ),
          ] else ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(999),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 4,
                backgroundColor: DHColors.softSage.withOpacity(0.6),
                valueColor: const AlwaysStoppedAnimation<Color>(
                    DHColors.sunlightGold),
              ),
            ),
            const SizedBox(height: 10),
            Text(
              _audioError ??
                  (s.hasAudio
                      ? (_audioLoading
                          ? 'Loading audio…'
                          : 'Tap to start')
                      : 'This session is text-only'),
              style: DHTypography.caption(color: DHColors.secondary),
            ),
          ],
        ],
      ),
    );
  }

  String _fmt(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    final h = d.inHours;
    return h > 0 ? '$h:$m:$s' : '$m:$s';
  }
}

// ============================================================
// Widgets
// ============================================================
class _PlayButton extends StatelessWidget {
  const _PlayButton({
    required this.playing,
    required this.loading,
    required this.enabled,
    required this.locked,
    required this.onTap,
  });
  final bool playing;
  final bool loading;
  final bool enabled;
  final bool locked;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final tappable = locked || enabled;
    final gradient = locked
        ? const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [DHColors.strawberryBlush, DHColors.softClay],
          )
        : const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [DHColors.sunlightGold, DHColors.softClay],
          );
    final glow = locked
        ? DHColors.strawberryBlush.withOpacity(0.3)
        : DHColors.sunlightGold.withOpacity(0.35);
    return Opacity(
      opacity: tappable ? 1.0 : 0.6,
      child: InkWell(
        onTap: tappable ? onTap : null,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          width: 88,
          height: 88,
          decoration: BoxDecoration(
            gradient: gradient,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(color: glow, blurRadius: 18, offset: const Offset(0, 4)),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Icon(Icons.eco, size: 40, color: Colors.white.withOpacity(0.35)),
              if (loading)
                const SizedBox(
                  width: 32,
                  height: 32,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 3,
                  ),
                )
              else if (locked)
                const Icon(Icons.lock_outline, size: 40, color: Colors.white)
              else
                Icon(playing ? Icons.pause : Icons.play_arrow,
                    size: 42, color: Colors.white),
            ],
          ),
        ),
      ),
    );
  }
}

class _Scrubber extends StatelessWidget {
  const _Scrubber({
    required this.position,
    required this.duration,
    required this.onSeek,
  });
  final Duration position;
  final Duration duration;
  final ValueChanged<Duration> onSeek;

  @override
  Widget build(BuildContext context) {
    return SliderTheme(
      data: SliderTheme.of(context).copyWith(
        trackHeight: 4,
        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 7),
        overlayShape: const RoundSliderOverlayShape(overlayRadius: 14),
        activeTrackColor: DHColors.sunlightGold,
        inactiveTrackColor: DHColors.softSage.withOpacity(0.6),
        thumbColor: DHColors.sunlightGold,
        overlayColor: DHColors.sunlightGold.withOpacity(0.2),
      ),
      child: Slider(
        min: 0,
        max: duration.inMilliseconds.toDouble().clamp(1, double.infinity),
        value: position.inMilliseconds
            .toDouble()
            .clamp(0, duration.inMilliseconds.toDouble()),
        onChanged: (v) => onSeek(Duration(milliseconds: v.toInt())),
      ),
    );
  }
}

