import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/content_session.dart';
import '../../providers/audio_providers.dart';
import '../../providers/content_providers.dart';
import '../../providers/subscription_providers.dart';
import '../../repositories/content_repository.dart';

/// What happened when a screen asked to play a session.
enum PlaybackOutcome {
  /// Playback was toggled — the caller should reflect the new play state.
  toggled,

  /// The session is behind the paywall, or Storage refused the signed URL.
  /// Either way the caller should offer the subscription, not an error.
  denied,

  /// This session has no audio (Reiki intro, "ABC"), or Storage had no file.
  unavailable,

  /// Something else went wrong — network, decode, a 5xx.
  failed,
}

/// Starts or pauses [session], loading it first if it is not the current track.
///
/// Shared because two screens play the same catalogue: the session detail
/// player and the meditation step of the Shadow Work journey. The access
/// rules, the signed-URL round trip and the meaning of a refusal have to
/// agree between them, and they only will if there is one copy.
///
/// The caller owns the UI: this reports what happened and changes no widget
/// state of its own.
Future<PlaybackOutcome> togglePlayback(
  WidgetRef ref,
  ContentSession session,
) async {
  if (!session.hasAudio) return PlaybackOutcome.unavailable;

  // Free tier is the preview sessions; everything else needs a subscription.
  // This is the client-side half — Storage RLS has the final say below.
  if (!session.isPreview && !ref.read(hasFullAccessProvider)) {
    return PlaybackOutcome.denied;
  }

  final player = ref.read(audioHandlerProvider);

  if (player.currentSessionId != session.id) {
    try {
      final url =
          await ref.read(contentRepositoryProvider).getAudioUrl(session.contentBody);
      if (url == null) return PlaybackOutcome.unavailable;
      await player.setTrack(session: session, url: url);
    } on AudioAccessDeniedException {
      // The server disagreed with our local view of the subscription, so
      // re-read it before the caller shows anything.
      ref.invalidate(subscriptionStatusProvider);
      return PlaybackOutcome.denied;
    } catch (_) {
      return PlaybackOutcome.failed;
    }
  }

  await player.togglePlayPause();
  return PlaybackOutcome.toggled;
}

/// mm:ss for a player position or duration.
String formatDuration(Duration d) {
  final minutes = d.inMinutes;
  final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
  return '$minutes:$seconds';
}
