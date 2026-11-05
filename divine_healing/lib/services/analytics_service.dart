/// Firebase Analytics, wired for Google Ads conversion tracking.
///
/// The ad campaign runs on installs today, which brings cheap downloads that
/// never subscribe. The fix is to report the real conversion — a subscription
/// — back to Google Analytics, link that to Google Ads, and let the campaign
/// optimise for subscribers instead. [logSubscribed] is that conversion.
///
/// Everything here is a no-op until [init] runs, and [init] runs only after
/// Firebase.initializeApp() succeeds in main(). Before the Firebase project is
/// wired (no google-services.json / GoogleService-Info.plist), the app starts
/// and behaves exactly as before — analytics simply stays off. An analytics
/// call must never throw into the app, least of all the purchase flow, so each
/// is guarded.
import 'package:firebase_analytics/firebase_analytics.dart';

class AnalyticsService {
  AnalyticsService._();
  static final AnalyticsService instance = AnalyticsService._();

  FirebaseAnalytics? _analytics;

  /// True once Firebase is up and events will actually be sent.
  bool get enabled => _analytics != null;

  /// Call once, after Firebase.initializeApp() has succeeded. If Firebase is
  /// not configured this is never reached (main() catches the init failure),
  /// so the rest of the class stays dormant.
  Future<void> init() async {
    final a = FirebaseAnalytics.instance;
    await a.setAnalyticsCollectionEnabled(true);
    _analytics = a;
  }

  /// The person tapped Subscribe and a plan was resolved — intent to buy.
  /// Useful as a funnel step, but not the conversion itself.
  Future<void> logBeginCheckout({
    required bool annual,
    double? value,
    String? currency,
  }) async {
    final a = _analytics;
    if (a == null) return;
    try {
      await a.logBeginCheckout(
        value: value,
        currency: currency,
        items: [_item(annual: annual)],
      );
    } catch (_) {
      // Analytics must never interrupt a purchase.
    }
  }

  /// The conversion. Fires only when a subscription is genuinely purchased
  /// (not restored), and carries the value and currency the store charged, so
  /// Google Ads can optimise and bid on real subscribers.
  Future<void> logSubscribed({
    required bool annual,
    required double value,
    required String productId,
    String? currency,
  }) async {
    final a = _analytics;
    if (a == null) return;
    try {
      await a.logPurchase(
        value: value,
        // GA4 pairs value with a currency; default to USD if the store did
        // not supply one rather than drop the conversion value.
        currency: currency == null || currency.isEmpty ? 'USD' : currency,
        items: [_item(annual: annual, id: productId)],
      );
    } catch (_) {
      // Never break the post-purchase flow.
    }
  }

  AnalyticsEventItem _item({required bool annual, String? id}) =>
      AnalyticsEventItem(
        itemId: id,
        itemName: annual ? 'Annual subscription' : 'Monthly subscription',
        itemCategory: 'subscription',
      );
}
