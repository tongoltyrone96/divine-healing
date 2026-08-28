import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/content_session.dart';
import 'content_repository.dart';

/// M2 content source — reads `sh_content` table and generates short-lived
/// signed URLs from the private `sh-audio` Storage bucket.
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
    // Bucket is public during launch phase — anyone with the URL can stream.
    // When we lock paid content behind subscription, switch this to
    // `createSignedUrl(contentBody, _signedUrlTtlSeconds)` and flip the
    // bucket back to private, with a Storage RLS policy that lets
    // authenticated + subscribed users generate URLs.
    return _client.storage.from(_audioBucket).getPublicUrl(contentBody);
  }
}
