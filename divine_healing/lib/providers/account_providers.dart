import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/env.dart';
import '../services/account_deletion_service.dart';

/// Account deletion, which both stores require for any app with sign-in.
///
/// Its own file so the existing provider files are untouched — nothing here
/// participates in sign-in, content or subscriptions.
///
/// Null in local (M1) mode, where there is no account to delete.
final accountDeletionServiceProvider =
    Provider<AccountDeletionService?>((ref) {
  if (!Env.hasSupabase) return null;
  return AccountDeletionService(Supabase.instance.client);
});
