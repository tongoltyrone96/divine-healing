import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/env.dart';
import '../models/subscription_status.dart';
import '../repositories/subscription_repository.dart';
import 'auth_providers.dart';

/// Repository for reading `sh_subscribers`. Null in local (M1) mode.
final subscriptionRepositoryProvider =
    Provider<SubscriptionRepository?>((ref) {
  if (!Env.hasSupabase) return null;
  return SubscriptionRepository(Supabase.instance.client);
});

/// Current user's subscription row, refreshed when auth state changes.
///
/// - Signed out or M1 mode → `SubscriptionStatus.none()`
/// - Signed in with no `sh_subscribers` row → `SubscriptionStatus.none()`
/// - Signed in with a row → parsed status
final subscriptionStatusProvider =
    FutureProvider<SubscriptionStatus>((ref) async {
  final repo = ref.watch(subscriptionRepositoryProvider);
  if (repo == null) return const SubscriptionStatus.none();
  ref.watch(authStateStreamProvider);
  return repo.loadCurrent();
});

/// True when the current user can access the full paid catalog.
///
/// Loading state resolves to `false` so paywall guards fail closed —
/// once the check finishes, we re-render with the real answer.
final hasFullAccessProvider = Provider<bool>((ref) {
  final async = ref.watch(subscriptionStatusProvider);
  return async.maybeWhen(
    data: (s) => s.hasFullAccess,
    orElse: () => false,
  );
});
