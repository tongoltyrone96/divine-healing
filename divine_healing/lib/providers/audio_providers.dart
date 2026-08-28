import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';

import '../services/audio_handler.dart';

/// The one audio handler, built in `main()` before the app starts because
/// registering with the OS media session is async.
///
/// Overridden in the root ProviderScope; reading it without that override is a
/// programming error rather than something to paper over with a fallback.
final audioHandlerProvider = Provider<DivineHealingAudioHandler>((ref) {
  throw UnimplementedError(
    'audioHandlerProvider must be overridden in main() with the instance '
    'returned by initAudioHandler().',
  );
});

/// True when the player is actively playing (as opposed to paused/stopped).
final audioPlayingProvider = StreamProvider<bool>((ref) {
  return ref.watch(audioHandlerProvider).playingStream;
});

/// Current playback position, updates roughly 30 times per second.
final audioPositionProvider = StreamProvider<Duration>((ref) {
  return ref.watch(audioHandlerProvider).positionStream;
});

/// Total duration of the loaded track (null while loading / before ready).
final audioDurationProvider = StreamProvider<Duration?>((ref) {
  return ref.watch(audioHandlerProvider).durationStream;
});

/// Full player state (loading / buffering / ready / completed).
final audioPlayerStateProvider = StreamProvider<PlayerState>((ref) {
  return ref.watch(audioHandlerProvider).playerStateStream;
});
