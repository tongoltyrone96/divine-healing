import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';

import '../services/audio_player_service.dart';

/// Single shared audio player instance. Not `.autoDispose` — audio should
/// keep playing when the user navigates away from the player screen.
final audioPlayerServiceProvider = Provider<AudioPlayerService>((ref) {
  final service = AudioPlayerService();
  ref.onDispose(() => service.dispose());
  return service;
});

/// True when the player is actively playing (as opposed to paused/stopped).
final audioPlayingProvider = StreamProvider<bool>((ref) {
  return ref.watch(audioPlayerServiceProvider).playingStream;
});

/// Current playback position, updates roughly 30 times per second.
final audioPositionProvider = StreamProvider<Duration>((ref) {
  return ref.watch(audioPlayerServiceProvider).positionStream;
});

/// Total duration of the loaded track (null while loading / before ready).
final audioDurationProvider = StreamProvider<Duration?>((ref) {
  return ref.watch(audioPlayerServiceProvider).durationStream;
});

/// Full player state (loading / buffering / ready / completed).
final audioPlayerStateProvider = StreamProvider<PlayerState>((ref) {
  return ref.watch(audioPlayerServiceProvider).playerStateStream;
});
