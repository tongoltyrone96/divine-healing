import 'package:supabase_flutter/supabase_flutter.dart';

/// Reads and writes the current user's personal content —
/// shadow-work journal, manifestation form, affirmation favourites, and
/// content-completion progress.
///
/// All calls require an authenticated Supabase session. If the user is
/// signed out, methods either throw `AuthException` or return empty data,
/// depending on whether the operation is a read or a write.
class UserDataRepository {
  UserDataRepository(this._client);

  final SupabaseClient _client;

  String? get _email => _client.auth.currentUser?.email;

  bool get isSignedIn => _client.auth.currentUser != null;

  // ============================================================
  // Shadow Work — 7 reflection prompts per meditation session
  // Table: sh_shadow_work_responses(content_id, prompt_1..prompt_7)
  // ============================================================

  Future<Map<int, String>> loadShadowWorkResponses(int contentId) async {
    final email = _email;
    if (email == null) return {};
    final rows = await _client
        .from('sh_shadow_work_responses')
        .select('prompt_1, prompt_2, prompt_3, prompt_4, '
            'prompt_5, prompt_6, prompt_7')
        .eq('user_email', email)
        .eq('content_id', contentId)
        .order('created_at', ascending: false)
        .limit(1);
    if ((rows as List).isEmpty) return {};
    final row = rows.first as Map<String, dynamic>;
    final map = <int, String>{};
    for (var i = 1; i <= 7; i++) {
      final v = row['prompt_$i'] as String?;
      if (v != null && v.isNotEmpty) map[i - 1] = v;
    }
    return map;
  }

  Future<void> saveShadowWorkResponses({
    required int contentId,
    required Map<int, String> promptsByZeroIndex,
  }) async {
    final email = _email;
    if (email == null) {
      throw const AuthException('Sign in required to save reflections.');
    }
    final row = <String, dynamic>{
      'user_email': email,
      'content_id': contentId,
    };
    for (var i = 0; i < 7; i++) {
      row['prompt_${i + 1}'] = promptsByZeroIndex[i] ?? '';
    }
    await _client.from('sh_shadow_work_responses').insert(row);
  }

  // ============================================================
  // Manifestation — 5-field exercise
  // Table: sh_manifestation_responses(what_to_manifest, why_you_want_it,
  //          version_achieved, does_differently, one_action)
  // ============================================================

  Future<Map<String, String>?> loadLatestManifestation() async {
    final email = _email;
    if (email == null) return null;
    final rows = await _client
        .from('sh_manifestation_responses')
        .select('what_to_manifest, why_you_want_it, version_achieved, '
            'does_differently, one_action')
        .eq('user_email', email)
        .order('created_at', ascending: false)
        .limit(1);
    if ((rows as List).isEmpty) return null;
    final row = rows.first as Map<String, dynamic>;
    return {
      for (final k in [
        'what_to_manifest',
        'why_you_want_it',
        'version_achieved',
        'does_differently',
        'one_action',
      ])
        k: (row[k] as String?) ?? '',
    };
  }

  Future<void> saveManifestation(Map<String, String> fields) async {
    final email = _email;
    if (email == null) {
      throw const AuthException('Sign in required to save the exercise.');
    }
    await _client.from('sh_manifestation_responses').insert({
      'user_email': email,
      ...fields,
    });
  }

  // ============================================================
  // Affirmation favourites — set of indices 0..19
  // Table: sh_affirmation_favourites(affirmation_index) UNIQUE per user
  // ============================================================

  Future<Set<int>> loadFavourites() async {
    final email = _email;
    if (email == null) return {};
    final rows = await _client
        .from('sh_affirmation_favourites')
        .select('affirmation_index')
        .eq('user_email', email);
    return {
      for (final r in (rows as List))
        ((r as Map<String, dynamic>)['affirmation_index'] as num).toInt(),
    };
  }

  Future<void> addFavourite(int index) async {
    final email = _email;
    if (email == null) {
      throw const AuthException('Sign in required to save favourites.');
    }
    await _client.from('sh_affirmation_favourites').insert({
      'user_email': email,
      'affirmation_index': index,
    });
  }

  Future<void> removeFavourite(int index) async {
    final email = _email;
    if (email == null) return;
    await _client
        .from('sh_affirmation_favourites')
        .delete()
        .eq('user_email', email)
        .eq('affirmation_index', index);
  }

  // ============================================================
  // Content progress — mark session complete
  // Table: sh_content_progress(content_id, completed_at) UNIQUE per user
  // ============================================================

  Future<Set<int>> loadCompletedContentIds() async {
    final email = _email;
    if (email == null) return {};
    final rows = await _client
        .from('sh_content_progress')
        .select('content_id')
        .eq('user_email', email);
    return {
      for (final r in (rows as List))
        ((r as Map<String, dynamic>)['content_id'] as num).toInt(),
    };
  }

  Future<void> markComplete(int contentId) async {
    final email = _email;
    if (email == null) {
      throw const AuthException('Sign in required to track progress.');
    }
    await _client.from('sh_content_progress').upsert(
      {
        'user_email': email,
        'content_id': contentId,
      },
      onConflict: 'user_email,content_id',
    );
  }
}
