// Model for sh_subscribers row (Stripe/RevenueCat subscription state).
import 'package:freezed_annotation/freezed_annotation.dart';

part 'subscriber.freezed.dart';
part 'subscriber.g.dart';

@freezed
class Subscriber with _$Subscriber {
  const Subscriber._();

  const factory Subscriber({
    required int id,
    required String userEmail,
    String? stripeCustomerId,
    String? stripeSubscriptionId,

    /// One of: 'active' | 'trialing' | 'past_due' | 'canceled' | null
    String? subscriptionStatus,

    /// 'Monthly' | 'Annual' | 'Complimentary' | null
    String? planName,

    DateTime? trialEndsAt,
    DateTime? currentPeriodEnd,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Subscriber;

  factory Subscriber.fromJson(Map<String, dynamic> json) =>
      _$SubscriberFromJson(json);

  bool get isActive => subscriptionStatus == 'active' || subscriptionStatus == 'trialing';
  bool get isTrialing => subscriptionStatus == 'trialing';
  bool get isComplimentary => planName == 'Complimentary';
}
