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

/// What to show for one plan on the paywall, read from the store so the
/// price, the current offer and the renewal terms are always what the person
/// will actually be charged — never hard-coded.
///
/// The store returns prices already formatted for the person's country and
/// currency (CA$149.99, A$149.99, …), so [renewalPrice] and [introPrice] are
/// shown as-is, with no currency prefix of our own. [percentOff], the free
/// trial and the intro phase come straight from the offer Google or Apple
/// returned, so an ineligible customer — who the store gives no offer — sees
/// the plain renewal price with nothing to undo.
class PlanOffer {
  const PlanOffer({
    required this.annual,
    required this.renewalPrice,
    required this.periodLabel,
    this.introPrice,
    this.introPhaseLabel,
    this.freeTrialLabel,
    this.percentOff,
  });

  /// True for the yearly plan, false for the monthly one.
  final bool annual;

  /// The ongoing price the plan renews at, e.g. "CA$149.99".
  final String renewalPrice;

  /// "/year" or "/month".
  final String periodLabel;

  /// The discounted price during the offer, e.g. "CA$74.99", or null when the
  /// person gets no discount.
  final String? introPrice;

  /// How long the discount lasts, e.g. "for the first 2 years".
  final String? introPhaseLabel;

  /// "7-day free trial" when the offer is a free trial rather than a discount.
  final String? freeTrialLabel;

  /// The discount as a percentage, e.g. 50, for the badge. Null when there is
  /// no discount.
  final int? percentOff;

  bool get hasFreeTrial => freeTrialLabel != null;
  bool get hasDiscount => introPrice != null;
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

  /// Each plan's real price and current offer, read from the store, in the
  /// order the offering lists them. Empty when the store is unavailable (web,
  /// or not configured), where the UI falls back to its static cards.
  Future<List<PlanOffer>> planOffers() async {
    final packages = await plans();
    return packages.map(_describe).toList();
  }

  /// Reads one package's pricing. Android exposes offers through the
  /// subscription option RevenueCat will actually buy ([defaultOption], whose
  /// phases Google has already filtered by eligibility); iOS through
  /// [introductoryPrice]. Reading what the store will charge means an
  /// ineligible customer, who gets no offer, shows the plain renewal price.
  PlanOffer _describe(Package p) {
    final product = p.storeProduct;
    final annual = product.identifier.toLowerCase().contains('annual');
    final period = annual ? '/year' : '/month';

    final option = product.defaultOption;
    if (option != null) {
      // Android.
      final renewal = option.fullPricePhase?.price.formatted ??
          product.priceString;
      final free = option.freePhase;
      if (free != null) {
        return PlanOffer(
          annual: annual,
          renewalPrice: renewal,
          periodLabel: period,
          freeTrialLabel: _trialLabel(_periodDays(free.billingPeriod)),
        );
      }
      final intro = option.introPhase;
      if (intro != null) {
        return PlanOffer(
          annual: annual,
          renewalPrice: renewal,
          periodLabel: period,
          introPrice: intro.price.formatted,
          introPhaseLabel: _firstLabel(
              intro.billingCycleCount ?? 1, intro.billingPeriod?.unit),
          percentOff: _percentOff(
              intro.price.amountMicros, option.fullPricePhase?.price.amountMicros),
        );
      }
      return PlanOffer(
          annual: annual, renewalPrice: renewal, periodLabel: period);
    }

    // iOS / StoreKit.
    final intro = product.introductoryPrice;
    if (intro != null) {
      if (intro.price == 0) {
        return PlanOffer(
          annual: annual,
          renewalPrice: product.priceString,
          periodLabel: period,
          freeTrialLabel: _trialLabel(
              _unitDays(intro.periodUnit, intro.periodNumberOfUnits)),
        );
      }
      return PlanOffer(
        annual: annual,
        renewalPrice: product.priceString,
        periodLabel: period,
        introPrice: intro.priceString,
        introPhaseLabel: _firstLabel(intro.cycles, intro.periodUnit),
        percentOff: _percentOff(
            (intro.price * 1e6).round(), (product.price * 1e6).round()),
      );
    }
    return PlanOffer(
        annual: annual,
        renewalPrice: product.priceString,
        periodLabel: period);
  }

  /// The discount as a whole percentage, or null when there is none.
  static int? _percentOff(int introMicros, int? fullMicros) {
    if (fullMicros == null || fullMicros <= 0 || introMicros >= fullMicros) {
      return null;
    }
    return ((1 - introMicros / fullMicros) * 100).round();
  }

  static String _trialLabel(int? days) =>
      days != null ? '$days-day free trial' : 'Free trial';

  /// "for the first year", "for the first 2 years", and so on.
  static String _firstLabel(int cycles, PeriodUnit? unit) {
    final noun = _unitNoun(unit);
    if (noun == null) return 'for a limited time';
    if (cycles <= 1) return 'for the first $noun';
    return 'for the first $cycles ${noun}s';
  }

  static String? _unitNoun(PeriodUnit? unit) {
    switch (unit) {
      case PeriodUnit.day:
        return 'day';
      case PeriodUnit.week:
        return 'week';
      case PeriodUnit.month:
        return 'month';
      case PeriodUnit.year:
        return 'year';
      default:
        return null;
    }
  }

  static int? _periodDays(Period? p) =>
      p == null ? null : _unitDays(p.unit, p.value);

  static int? _unitDays(PeriodUnit unit, int value) {
    switch (unit) {
      case PeriodUnit.day:
        return value;
      case PeriodUnit.week:
        return value * 7;
      case PeriodUnit.month:
        return value * 30;
      case PeriodUnit.year:
        return value * 365;
      default:
        return null;
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
