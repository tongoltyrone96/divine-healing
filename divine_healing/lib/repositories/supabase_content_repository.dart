import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/content_session.dart';
import 'content_repository.dart';

/// M2 content source — reads the `sh_content` table and mints short-lived
/// signed URLs from the private `sh-audio` Storage bucket.
///
/// Entitlement is enforced by Storage RLS, not here: this class asks for a
/// signed URL and surfaces the refusal. See
/// `data/migrations/20260828_01_audio_paywall.sql`.
///
/// Enabled automatically once SUPABASE_URL + SUPABASE_ANON_KEY are provided
/// via `--dart-define` (see `config/env.dart`) and the client has run the
/// schema SQL.
class SupabaseContentRepository implements ContentRepository {
  SupabaseContentRepository(this._client);

  final SupabaseClient _client;

  static const _audioBucket = 'sh-audio';
  static const _signedUrlTtlSeconds = 3600;

  @override
  Future<List<ContentSession>> getAll({String? category}) async {
    final query = _client.from('sh_content').select();
    final rows = category == null
        ? await query.order('sort_order').order('id')
        : await query.eq('category', category).order('sort_order').order('id');
    return (rows as List)
        .cast<Map<String, dynamic>>()
        .map(ContentSession.fromJson)
        .toList();
  }

  @override
  Future<List<ContentSession>> getFreePreview() async {
    final rows = await _client
        .from('sh_content')
        .select()
        .eq('is_preview', true)
        .order('id');
    return (rows as List)
        .cast<Map<String, dynamic>>()
        .map(ContentSession.fromJson)
        .toList();
  }

  @override
  Future<ContentSession?> getById(int id) async {
    final rows = await _client
        .from('sh_content')
        .select()
        .eq('id', id)
        .limit(1);
    final list = (rows as List).cast<Map<String, dynamic>>();
    if (list.isEmpty) return null;
    return ContentSession.fromJson(list.first);
  }

  @override
  Future<String?> getAudioUrl(String contentBody) async {
    if (contentBody.isEmpty) return null;

    // The bucket is private. `createSignedUrl` is evaluated against the
    // Storage RLS policies installed by
    // `data/migrations/20260828_01_audio_paywall.sql`:
    //   - preview tracks  -> anon + authenticated
    //   - everything else -> authenticated with an active subscription
    // A non-entitled caller gets a 4xx here, which is the point: knowing the
    // path is no longer enough to download a paid session.
    try {
      return await _client.storage
          .from(_audioBucket)
          .createSignedUrl(contentBody, _signedUrlTtlSeconds);
    } on StorageException catch (e) {
      if (_isDenial(e)) {
        throw AudioAccessDeniedException(contentBody);
      }
      rethrow;
    }
  }

  /// Storage reports an RLS refusal as 400/401/403 depending on whether the
  /// request was anonymous, so match on the status rather than the message.
  static bool _isDenial(StorageException e) {
    const denied = {'400', '401', '403'};
    return denied.contains(e.statusCode);
  }
}
