/// In-app purchases, through RevenueCat.
///
/// The Profile screen used to open a Stripe payment link in the browser.
/// Both stores forbid that for digital goods sold inside an app, so on iOS
/// and Android this replaces it. Stripe still handles the web build, where
/// no store takes a cut and the links are legitimate.
///
/// `sh_subscribers` stays the single source of truth. RevenueCat's webhook
/// writes to it exactly as the Stripe webhook does, so the audio paywall in
/// Storage RLS keeps working without knowing which store paid.
///
/// Needs REVENUECAT_IOS_KEY / REVENUECAT_ANDROID_KEY at build time. Without
/// them [isAvailable] is false and the UI falls back to saying so, rather
/// than showing a button that cannot work.
library;

import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;
import 'package:flutter/services.dart' show PlatformException;
import 'package:purchases_flutter/purchases_flutter.dart';

import '../config/env.dart';

/// What a purchase attempt did, so the UI can tell the three apart.
enum PurchaseOutcome {
  /// Entitlement is active. The webhook writes the row; the UI refreshes.
  purchased,

  /// The sheet was dismissed. Not an error, and not worth a red banner.
  cancelled,

  /// Nothing was bought, but an earlier purchase was found and restored.
  restored,

  /// Nothing to restore. Distinct from failure: the call worked.
  nothingToRestore,

  /// The store or the network refused. [PurchasesService.lastError] says why.
  failed,
}

class PurchasesService {
  PurchasesService._();

  static final instance = PurchasesService._();

  /// The entitlement configured in RevenueCat. One entitlement covers both
  /// plans, because the app only asks "may this person hear the audio".
  static const entitlement = 'full_access';

  bool _configured = false;
  String? lastError;

  /// Whether purchases can run at all here: a mobile build with a key.
  static bool get isAvailable {
    if (kIsWeb) return false;
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return Env.revenueCatKeyIos.isNotEmpty;
    }
    if (defaultTargetPlatform == TargetPlatform.android) {
      return Env.revenueCatKeyAndroid.isNotEmpty;
    }
    return false;
  }

  static String get _apiKey => defaultTargetPlatform == TargetPlatform.iOS
      ? Env.revenueCatKeyIos
      : Env.revenueCatKeyAndroid;

  /// Ties purchases to the Supabase session, account or not.
  ///
  /// [userId] is the Supabase user id rather than the email: RevenueCat's
  /// app user id is permanent and public-ish, and an email is neither. The
  /// webhook keys the `sh_subscribers` row on this id.
  ///
  /// [email] is absent for a guest, who has an anonymous session and no
  /// address. That is the ordinary case rather than an error — Apple's
  /// guideline 5.1.1(v) requires that buying works without registering — and
  /// the webhook writes a synthetic address for those rows. Passing one when
  /// it is known still helps: it is how a purchase reconciles with an
  /// account someone made later.
  Future<void> configure({
    required String userId,
    String? email,
  }) async {
    if (!isAvailable) return;
    if (!_configured) {
      await Purchases.setLogLevel(LogLevel.warn);
      await Purchases.configure(
        PurchasesConfiguration(_apiKey)..appUserID = userId,
      );
      _configured = true;
    } else {
      // A second account on the same device. Without this the new purchase
      // would attach to whoever signed in first.
      await Purchases.logIn(userId);
    }
    if (email != null && email.isNotEmpty) await Purchases.setEmail(email);
  }

  /// Called on sign-out so the next person starts clean.
  Future<void> signOut() async {
    if (!isAvailable || !_configured) return;
    try {
      await Purchases.logOut();
    } on PlatformException {
      // Logging out an anonymous user throws, and there is nothing to do
      // about it — the state we wanted is the state we have.
    }
  }

  /// The plans to show, in the order RevenueCat's current offering lists.
  /// Empty when the offering has not been set up on RevenueCat's side.
  Future<List<Package>> plans() async {
    if (!isAvailable) return const [];
    try {
      final offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages ?? const [];
    } on PlatformException catch (e) {
      lastError = e.message;
      return const [];
    }
  }

  Future<PurchaseOutcome> buy(Package package) async {
    lastError = null;
    if (!isAvailable) return PurchaseOutcome.failed;
    try {
      // purchase(PurchaseParams) replaced purchasePackage in 10.x, and
      // returns the transaction alongside the customer info rather than the
      // info on its own.
      final result = await Purchases.purchase(PurchaseParams.package(package));
      return _entitled(result.customerInfo)
          ? PurchaseOutcome.purchased
          : PurchaseOutcome.failed;
    } on PlatformException catch (e) {
      if (PurchasesErrorHelper.getErrorCode(e) ==
          PurchasesErrorCode.purchaseCancelledError) {
        return PurchaseOutcome.cancelled;
      }
      lastError = e.message;
      return PurchaseOutcome.failed;
    }
  }

  /// Apple requires a way to restore purchases; someone reinstalling the app
  /// or switching devices has already paid and must not be asked again.
  Future<PurchaseOutcome> restore() async {
    lastError = null;
    if (!isAvailable) return PurchaseOutcome.failed;
    try {
      final info = await Purchases.restorePurchases();
      return _entitled(info)
          ? PurchaseOutcome.restored
          : PurchaseOutcome.nothingToRestore;
    } on PlatformException catch (e) {
      lastError = e.message;
      return PurchaseOutcome.failed;
    }
  }

  bool _entitled(CustomerInfo info) =>
      info.entitlements.active.containsKey(entitlement);
}
