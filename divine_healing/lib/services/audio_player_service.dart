import 'package:just_audio/just_audio.dart';

/// Thin `just_audio` wrapper — single AudioPlayer instance shared across the
/// app via Riverpod. Handles setting the current track, play/pause/seek, and
/// exposes streams for UI to bind to.
///
/// Background playback + lock-screen controls (via `audio_service`) are
/// wired in the native-focused iteration; web preview does not support them.
class AudioPlayerService {
  AudioPlayerService();

  final AudioPlayer _player = AudioPlayer();

  int? _currentSessionId;
  int? get currentSessionId => _currentSessionId;

  bool get playing => _player.playing;
  Duration get position => _player.position;
  Duration? get duration => _player.duration;

  Stream<bool> get playingStream => _player.playingStream;
  Stream<Duration> get positionStream => _player.positionStream;
  Stream<Duration?> get durationStream => _player.durationStream;
  Stream<PlayerState> get playerStateStream => _player.playerStateStream;

  /// Load a track. Does nothing if the same session is already loaded.
  Future<void> setTrack({required int sessionId, required String url}) async {
    if (_currentSessionId == sessionId) return;
    _currentSessionId = sessionId;
    await _player.setUrl(url);
  }

  Future<void> play() => _player.play();
  Future<void> pause() => _player.pause();

  Future<void> togglePlayPause() =>
      _player.playing ? _player.pause() : _player.play();

  Future<void> seek(Duration position) => _player.seek(position);

  Future<void> stop() async {
    await _player.stop();
    _currentSessionId = null;
  }

  Future<void> dispose() => _player.dispose();
}
