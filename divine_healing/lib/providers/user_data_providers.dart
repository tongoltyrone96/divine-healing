import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/env.dart';
import '../repositories/user_data_repository.dart';
import 'auth_providers.dart';

/// Repository for user-specific data. Null in local (M1) mode.
final userDataRepositoryProvider = Provider<UserDataRepository?>((ref) {
  if (!Env.hasSupabase) return null;
  return UserDataRepository(Supabase.instance.client);
});

/// The user's saved manifestation exercise (latest submission).
/// Null while loading, empty map when signed out, actual values when saved.
final latestManifestationProvider =
    FutureProvider<Map<String, String>?>((ref) {
  final repo = ref.watch(userDataRepositoryProvider);
  if (repo == null) return Future.value(null);
  // Re-fetch when auth state changes.
  ref.watch(authStateStreamProvider);
  return repo.loadLatestManifestation();
});

/// The user's favourite affirmations (set of 0..19 indices).
final favouritesProvider = FutureProvider<Set<int>>((ref) {
  final repo = ref.watch(userDataRepositoryProvider);
  if (repo == null) return Future.value(<int>{});
  ref.watch(authStateStreamProvider);
  return repo.loadFavourites();
});

/// The user's completed content sessions (set of content IDs).
final completedContentProvider = FutureProvider<Set<int>>((ref) {
  final repo = ref.watch(userDataRepositoryProvider);
  if (repo == null) return Future.value(<int>{});
  ref.watch(authStateStreamProvider);
  return repo.loadCompletedContentIds();
});

/// Loaded shadow-work reflection responses for one specific session.
final shadowWorkResponsesProvider =
    FutureProvider.family<Map<int, String>, int>((ref, contentId) {
  final repo = ref.watch(userDataRepositoryProvider);
  if (repo == null) return Future.value(<int, String>{});
  ref.watch(authStateStreamProvider);
  return repo.loadShadowWorkResponses(contentId);
});
