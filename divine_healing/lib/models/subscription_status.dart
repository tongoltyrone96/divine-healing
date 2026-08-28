/// One row from `sh_subscribers`, or the "no row" state for a signed-in
/// user who has never checked out.
///
/// The webhook (`supabase/functions/stripe-webhook`) writes rows here as
/// Stripe events fire. The app reads them to gate paid content.
class SubscriptionStatus {
  const SubscriptionStatus({
    required this.stripeStatus,
    required this.trialEndsAt,
    required this.currentPeriodEnd,
    required this.planName,
  });

  /// The "no subscription row" case — user is free tier.
  const SubscriptionStatus.none()
      : stripeStatus = null,
        trialEndsAt = null,
        currentPeriodEnd = null,
        planName = null;

  final String? stripeStatus;
  final DateTime? trialEndsAt;
  final DateTime? currentPeriodEnd;
  final String? planName;

  /// Does this user have access to the full paid catalog?
  ///
  /// - `trialing`/`active`/`past_due` → yes (past_due is Stripe's short grace
  ///   window while it retries the failed charge).
  /// - `canceled` → yes until `currentPeriodEnd` passes (user paid for the
  ///   remainder of the period).
  /// - Anything else (`incomplete`, `unpaid`, no row) → no.
  bool get hasFullAccess {
    switch (stripeStatus) {
      case 'trialing':
      case 'active':
      case 'past_due':
        return true;
      case 'canceled':
        final end = currentPeriodEnd;
        return end != null && end.isAfter(DateTime.now());
      default:
        return false;
    }
  }

  bool get isTrialing => stripeStatus == 'trialing';
  bool get isActive => stripeStatus == 'active';
  bool get isCanceledButActive =>
      stripeStatus == 'canceled' &&
      currentPeriodEnd != null &&
      currentPeriodEnd!.isAfter(DateTime.now());

  /// Whole days remaining in the trial (null if not trialing).
  int? get trialDaysLeft {
    if (!isTrialing || trialEndsAt == null) return null;
    final diff = trialEndsAt!.difference(DateTime.now());
    return diff.isNegative ? 0 : diff.inDays;
  }

  factory SubscriptionStatus.fromJson(Map<String, dynamic> j) {
    DateTime? parse(dynamic v) {
      if (v == null) return null;
      return DateTime.tryParse(v.toString());
    }

    return SubscriptionStatus(
      stripeStatus: j['subscription_status'] as String?,
      trialEndsAt: parse(j['trial_ends_at']),
      currentPeriodEnd: parse(j['current_period_end']),
      planName: j['plan_name'] as String?,
    );
  }
}
