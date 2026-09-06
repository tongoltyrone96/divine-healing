import 'package:audio_service/audio_service.dart';
import 'package:audio_session/audio_session.dart';
import 'package:just_audio/just_audio.dart';

import '../models/content_session.dart';
import 'artwork.dart';

/// The app's single audio pipeline.
///
/// Extends [BaseAudioHandler] so the OS owns a media session for us: playback
/// survives the app being backgrounded, and the lock screen / notification /
/// headphone buttons drive the same player the UI does. Sessions run 5-22
/// minutes and are meant to be listened to with the screen off, so this is a
/// requirement rather than a nicety.
///
/// The handler wraps `just_audio` directly, so it still works if the platform
/// integration fails to initialise (see [initAudioHandler]) — the app simply
/// loses the OS controls rather than losing playback.
class DivineHealingAudioHandler extends BaseAudioHandler with SeekHandler {
  DivineHealingAudioHandler() {
    // Every player event becomes a playbackState broadcast, which is what the
    // lock screen renders from.
    _player.playbackEventStream.listen(
      _broadcastState,
      onError: (Object e, StackTrace st) {
        playbackState.add(
          playbackState.value
              .copyWith(processingState: AudioProcessingState.error),
        );
      },
    );

    // A finished session should look replayable rather than stuck at the end.
    _player.processingStateStream.listen((state) async {
      if (state == ProcessingState.completed) {
        await _player.pause();
        await _player.seek(Duration.zero);
      }
    });

    // The real duration only arrives after the track loads; the lock screen
    // needs it to draw a scrubber.
    _player.durationStream.listen((d) {
      final item = mediaItem.value;
      if (d != null && item != null && item.duration != d) {
        mediaItem.add(item.copyWith(duration: d));
      }
    });
  }

  final AudioPlayer _player = AudioPlayer();

  int? _currentSessionId;
  int? get currentSessionId => _currentSessionId;

  /// Set when playback was cut off by something transient (a phone call), so
  /// we know whether resuming afterwards is what the listener expects.
  bool _resumeAfterInterruption = false;

  // --- state the UI binds to -------------------------------------------------

  bool get playing => _player.playing;
  Duration get position => _player.position;
  Duration? get duration => _player.duration;

  Stream<bool> get playingStream => _player.playingStream;
  Stream<Duration> get positionStream => _player.positionStream;
  Stream<Duration?> get durationStream => _player.durationStream;
  Stream<PlayerState> get playerStateStream => _player.playerStateStream;

  // --- setup -----------------------------------------------------------------

  /// Declares us as a music app and wires interruption handling.
  ///
  /// Without this a phone call or another app's audio would either be talked
  /// over or would silently kill the session with no way back.
  Future<void> configureAudioSession() async {
    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration.music());

    session.interruptionEventStream.listen((event) async {
      if (event.begin) {
        switch (event.type) {
          case AudioInterruptionType.duck:
            // A navigation prompt or similar — drop under it, don't stop.
            await _player.setVolume(0.3);
          case AudioInterruptionType.pause:
          case AudioInterruptionType.unknown:
            _resumeAfterInterruption = _player.playing;
            if (_player.playing) await pause();
        }
      } else {
        switch (event.type) {
          case AudioInterruptionType.duck:
            await _player.setVolume(1);
          case AudioInterruptionType.pause:
            if (_resumeAfterInterruption) {
              _resumeAfterInterruption = false;
              await play();
            }
          case AudioInterruptionType.unknown:
            // Cause unknown, so resuming could start audio out of nowhere.
            _resumeAfterInterruption = false;
        }
      }
    });

    // Headphones pulled out: pause rather than blast the session aloud.
    session.becomingNoisyEventStream.listen((_) => pause());
  }

  // --- app-facing API --------------------------------------------------------

  /// Loads [session] from [url]. No-op when that session is already loaded, so
  /// tapping play on the screen you are already listening to does not restart
  /// the track.
  Future<void> setTrack({
    required ContentSession session,
    required String url,
  }) async {
    if (_currentSessionId == session.id) return;
    _currentSessionId = session.id;

    // Staged on first use and cached after, so this is a no-op from the second
    // session onward. Null off Android/iOS, and the item simply carries no art.
    final artUri = await mediaArtworkUri();

    // Published before loading so the lock screen has something to show while
    // the audio buffers.
    mediaItem.add(
      MediaItem(
        id: session.contentBody,
        title: session.title,
        artist: 'Divine Awakening',
        album: _categoryLabel(session.category),
        duration: Duration(minutes: session.durationMinutes),
        artUri: artUri,
      ),
    );

    await _player.setUrl(url);
  }

  Future<void> togglePlayPause() => _player.playing ? pause() : play();

  // --- media session commands ------------------------------------------------
  // These arrive from the lock screen and headphone buttons as well as from
  // the UI, so all playback control routes through them.

  @override
  Future<void> play() => _player.play();

  @override
  Future<void> pause() => _player.pause();

  @override
  Future<void> seek(Duration position) => _player.seek(position);

  @override
  Future<void> stop() async {
    await _player.stop();
    _currentSessionId = null;
    mediaItem.add(null);
    playbackState.add(
      playbackState.value.copyWith(
        processingState: AudioProcessingState.idle,
        playing: false,
      ),
    );
    await super.stop();
  }

  Future<void> dispose() => _player.dispose();

  // --- internals -------------------------------------------------------------

  void _broadcastState(PlaybackEvent event) {
    final isPlaying = _player.playing;
    playbackState.add(
      playbackState.value.copyWith(
        controls: [
          MediaControl.rewind,
          if (isPlaying) MediaControl.pause else MediaControl.play,
          MediaControl.fastForward,
        ],
        systemActions: const {
          MediaAction.seek,
          MediaAction.seekForward,
          MediaAction.seekBackward,
        },
        // Which of the above survive the collapsed Android notification.
        androidCompactActionIndices: const [0, 1, 2],
        processingState: const {
          ProcessingState.idle: AudioProcessingState.idle,
          ProcessingState.loading: AudioProcessingState.loading,
          ProcessingState.buffering: AudioProcessingState.buffering,
          ProcessingState.ready: AudioProcessingState.ready,
          ProcessingState.completed: AudioProcessingState.completed,
        }[_player.processingState]!,
        playing: isPlaying,
        updatePosition: _player.position,
        bufferedPosition: _player.bufferedPosition,
        speed: _player.speed,
      ),
    );
  }

  static String _categoryLabel(String category) {
    switch (category) {
      case 'shadow_work':
        return 'Shadow Work';
      case 'reiki':
        return 'Reiki';
      default:
        return 'Meditations';
    }
  }
}

/// Builds the handler, registering it with the OS where the platform allows.
///
/// [AudioService.init] can throw when there is no media session to bind to.
/// That should cost the OS controls, not the ability to play audio at all, so
/// the fallback returns a bare handler.
Future<DivineHealingAudioHandler> initAudioHandler() async {
  DivineHealingAudioHandler handler;
  try {
    handler = await AudioService.init(
      builder: DivineHealingAudioHandler.new,
      config: const AudioServiceConfig(
        androidNotificationChannelId: 'com.divinehealing.app.audio',
        androidNotificationChannelName: 'Meditation playback',
        androidNotificationChannelDescription:
            'Controls for the session you are listening to.',
        // Mid-session pauses are normal, and the listener needs the controls
        // to still be there afterwards.
        androidNotificationOngoing: false,
        androidStopForegroundOnPause: true,
        // Not the launcher icon: Android keeps only a small icon's alpha
        // channel and fills the rest with a flat colour, so an opaque
        // launcher icon draws as a solid square on the lock screen.
        androidNotificationIcon: 'drawable/ic_notification',
        // The source image is 1024px square; the lock screen and notification
        // want a fraction of that, and shuttling the full bitmap between
        // processes on every track change is pure waste.
        artDownscaleWidth: 384,
        artDownscaleHeight: 384,
        fastForwardInterval: Duration(seconds: 30),
        rewindInterval: Duration(seconds: 15),
      ),
    );
  } catch (_) {
    handler = DivineHealingAudioHandler();
  }
  await handler.configureAudioSession();
  return handler;
}
