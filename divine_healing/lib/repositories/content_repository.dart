import '../models/content_session.dart';

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
  /// - Supabase M2: returns a short-lived signed URL from Storage.
  ///
  /// Returns null if audio is not available for this session.
  Future<String?> getAudioUrl(String contentBody);
}
