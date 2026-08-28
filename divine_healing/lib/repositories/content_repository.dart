import '../models/content_session.dart';

/// Thrown when Storage refuses to mint a signed URL for a track.
///
/// This is the server having the final say on entitlement: the UI already
/// blocks locked sessions before we get here, so reaching this means either
/// the local subscription state was stale or someone bypassed the UI.
class AudioAccessDeniedException implements Exception {
  const AudioAccessDeniedException(this.contentBody);
  final String contentBody;

  @override
  String toString() =>
      'AudioAccessDeniedException: no entitlement for $contentBody';
}

/// Content data access. Two implementations:
///   - LocalContentRepository  (M1) — bundled asset JSON
///   - SupabaseContentRepository (M2) — live Supabase table + Storage
///
/// The Riverpod provider in `providers/content_providers.dart` picks the impl
/// based on whether Supabase credentials were supplied via `--dart-define`.
abstract class ContentRepository {
  /// All sessions, optionally filtered by category
  /// ('meditation' | 'shadow_work' | 'reiki').
  Future<List<ContentSession>> getAll({String? category});

  /// Free-preview sessions only (Anxiety Release, Anxiety Release Short,
  /// Introduction to Reiki per client's free-tier definition).
  Future<List<ContentSession>> getFreePreview();

  /// Single session by ID, or null if not found.
  Future<ContentSession?> getById(int id);

  /// Playable audio URL for a session's `content_body`.
  ///
  /// - Local M1: returns an asset path (`assets/audio/…`) — not currently used
  ///   because M1 doesn't ship audio in the bundle (325 MB is too large).
  /// - Supabase M2: returns a short-lived signed URL from Storage. The
  ///   `sh-audio` bucket is private, so Storage RLS decides whether the
  ///   caller is entitled to this track (see
  ///   `data/migrations/20260828_01_audio_paywall.sql`).
  ///
  /// Returns null when the session simply has no audio (`content_body` is
  /// empty). Throws [AudioAccessDeniedException] when audio exists but the
  /// caller is not entitled to it.
  Future<String?> getAudioUrl(String contentBody);
}
