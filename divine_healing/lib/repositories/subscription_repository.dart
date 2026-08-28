import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/subscription_status.dart';

/// Reads the current user's row from `sh_subscribers`.
///
/// Rows are written by the `stripe-webhook` Edge Function whenever a Stripe
/// subscription event fires (checkout completed, trial → active, canceled, …).
class SubscriptionRepository {
  SubscriptionRepository(this._client);

  final SupabaseClient _client;

  String? get _email => _client.auth.currentUser?.email;

  /// Returns the current user's subscription row, or `SubscriptionStatus.none`
  /// if there is no row yet (never subscribed) or the user is signed out.
  Future<SubscriptionStatus> loadCurrent() async {
    final email = _email;
    if (email == null) return const SubscriptionStatus.none();

    final rows = await _client
        .from('sh_subscribers')
        .select(
            'subscription_status, plan_name, trial_ends_at, current_period_end')
        .eq('user_email', email)
        .order('updated_at', ascending: false)
        .limit(1);

    if (rows.isEmpty) return const SubscriptionStatus.none();
    return SubscriptionStatus.fromJson(rows.first as Map<String, dynamic>);
  }
}
