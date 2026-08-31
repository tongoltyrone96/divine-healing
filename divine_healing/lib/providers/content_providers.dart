import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/env.dart';
import '../models/content_session.dart';
import '../repositories/content_repository.dart';
import '../repositories/local_content_repository.dart';
import '../repositories/supabase_content_repository.dart';

/// The active content source. Automatically resolves to Supabase when
/// SUPABASE_URL + SUPABASE_ANON_KEY were supplied via `--dart-define`; falls
/// back to the bundled JSON asset otherwise (M1 default).
final contentRepositoryProvider = Provider<ContentRepository>((ref) {
  if (Env.hasSupabase) {
    return SupabaseContentRepository(Supabase.instance.client);
  }
  return LocalContentRepository();
});

/// All sessions (optionally filtered by category).
final allSessionsProvider =
    FutureProvider.family<List<ContentSession>, String?>((ref, category) {
  final repo = ref.watch(contentRepositoryProvider);
  return repo.getAll(category: category);
});

/// How many sessions the library holds, for the copy that advertises it.
///
/// This was written out as "24" in five places. The client edits content in
/// Supabase directly now, so a hard-coded number goes stale the first time
/// she adds or removes anything — as it did the moment the empty "ABC"
/// session was deleted and every screen still promised 24.
///
/// While the catalogue is loading there is no number to show. Callers get
/// null and drop the count from the sentence rather than flashing a wrong
/// one.
final sessionCountProvider = Provider<int?>((ref) {
  return ref.watch(allSessionsProvider(null)).whenOrNull(
        data: (sessions) => sessions.length,
      );
});

/// The 3 free preview sessions (Anxiety Release, Anxiety Release Short,
/// Introduction to Reiki per client's free-tier definition).
final freePreviewSessionsProvider = FutureProvider<List<ContentSession>>((ref) {
  final repo = ref.watch(contentRepositoryProvider);
  return repo.getFreePreview();
});

/// Single session by ID.
final sessionByIdProvider =
    FutureProvider.family<ContentSession?, int>((ref, id) {
  final repo = ref.watch(contentRepositoryProvider);
  return repo.getById(id);
});

/// Playable audio URL for a session's content_body (null in M1).
final audioUrlProvider =
    FutureProvider.family<String?, String>((ref, contentBody) {
  final repo = ref.watch(contentRepositoryProvider);
  return repo.getAudioUrl(contentBody);
});
