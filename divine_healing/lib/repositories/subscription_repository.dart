import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/subscription_status.dart';

/// Reads the current user's row from `sh_subscribers`.
///
/// Rows are written by the `stripe-webhook` Edge Function whenever a Stripe
/// subscription event fires (checkout completed, trial → active, canceled, …).
class SubscriptionRepository {
  SubscriptionRepository(this._client);

  final SupabaseClient _client;

  /// Returns the current user's subscription row, or `SubscriptionStatus.none`
  /// if there is no row yet (never subscribed) or there is no session at all.
  ///
  /// Matched on the uid as well as the address, and in that order. A guest
  /// who subscribed without registering has an anonymous session with no
  /// email, and their row is keyed on the uid alone — see
  /// data/migrations/20260919_01_anonymous_purchase.sql. Rows written before
  /// that, and everything Stripe writes, still carry only an address.
  Future<SubscriptionStatus> loadCurrent() async {
    final user = _client.auth.currentUser;
    if (user == null) return const SubscriptionStatus.none();

    final email = user.email;
    final match = [
      'user_id.eq.${user.id}',
      if (email != null && email.isNotEmpty) 'user_email.eq.$email',
    ].join(',');

    final rows = await _client
        .from('sh_subscribers')
        .select(
            'subscription_status, plan_name, trial_ends_at, current_period_end')
        .or(match)
        .order('updated_at', ascending: false)
        .limit(1);

    if (rows.isEmpty) return const SubscriptionStatus.none();
    return SubscriptionStatus.fromJson(rows.first as Map<String, dynamic>);
  }
}
