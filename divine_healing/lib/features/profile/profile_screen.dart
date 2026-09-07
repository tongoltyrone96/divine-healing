import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/stripe_links.dart';
import '../../models/subscription_status.dart';
import '../../providers/auth_providers.dart';
import '../../providers/subscription_providers.dart';
import '../../config/support.dart';
import '../../theme.dart';
import '../../providers/content_providers.dart';
import '../../providers/account_providers.dart';
import '../../services/account_deletion_service.dart';
import '../../services/purchases_service.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    // Handle Stripe checkout redirect: /profile?checkout=success. Refresh the
    // subscription provider a few times because the webhook may take a moment
    // to write the row after Stripe redirects the user back.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final uri = GoRouterState.of(context).uri;
      final checkout = uri.queryParameters['checkout'];
      if (checkout == 'success') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Welcome! Your 7-day free trial is being set up — this may '
              'take a few seconds.',
            ),
          ),
        );
        _refreshWithRetries();
      }
    });
  }

  Future<void> _refreshWithRetries() async {
    for (var i = 0; i < 5; i++) {
      await Future<void>.delayed(Duration(seconds: i == 0 ? 2 : 3));
      if (!mounted) return;
      ref.invalidate(subscriptionStatusProvider);
      final s = await ref.read(subscriptionStatusProvider.future);
      if (s.hasFullAccess) return;
    }
  }

  @override
  Widget build(BuildContext context) {
    final sessionCount = ref.watch(sessionCountProvider);
    final user = ref.watch(currentUserProvider);
    final displayName = ref.watch(userDisplayNameProvider);
    final email = user?.email;
    final subAsync = ref.watch(subscriptionStatusProvider);
    final sub = subAsync.valueOrNull;
    final hasSub = sub?.hasFullAccess ?? false;
    // Cancelled but still inside the paid period. Access continues, so the
    // active card is right — but hiding the plans as well left no way back in,
    // and the moment someone regrets cancelling is exactly when they need one.
    final cancelled = sub?.isCanceledButActive ?? false;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(subscriptionStatusProvider.future),
        child: ListView(
          padding: const EdgeInsets.all(16),
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            _userCard(context, ref, user: user, displayName: displayName),
            const SizedBox(height: 20),
            _sectionHeader('Subscription'),
            const SizedBox(height: 12),
            if (hasSub) ...[
              _activeSubscriptionCard(sub!, sessionCount),
              if (cancelled) const SizedBox(height: 20),
            ],
            if (!hasSub || cancelled) ...[
              if (cancelled) ...[
                Text('Changed your mind?',
                    style: DHTypography.heading(size: 16)),
                const SizedBox(height: 4),
                Text(
                  'Resubscribe any time — you keep access until '
                  '${_formatDate(sub!.currentPeriodEnd)} either way.',
                  style: DHTypography.body(size: 13, height: 1.5),
                ),
                const SizedBox(height: 12),
              ],
              _planCard(
                context: context,
                sessionCount: sessionCount,
                tag: 'ANNUAL · MOST POPULAR',
                price: 'CAD \$149',
                period: '/year',
                subtitle: 'Save 35% vs monthly',
                highlighted: true,
                paymentLink: StripeLinks.annual,
                annual: true,
                email: email,
              ),
              const SizedBox(height: 12),
              _planCard(
                context: context,
                sessionCount: sessionCount,
                tag: 'MONTHLY',
                price: 'CAD \$19',
                period: '/month',
                subtitle: 'Cancel any time',
                highlighted: false,
                paymentLink: StripeLinks.monthly,
                annual: false,
                email: email,
              ),
              const SizedBox(height: 12),
              if (!hasSub) _freeForeverCard(),
            ],
            const SizedBox(height: 28),
            _sectionHeader('Account'),
            const SizedBox(height: 8),
            // The Notifications row that used to sit here did nothing, and
            // promised daily reminders the app cannot send — push is not built
            // yet. A row that advertises a feature it does not have is worse
            // than no row, and reviewers look for exactly that. It comes back
            // with push.
            _accountTile(
              icon: Icons.help_outline,
              title: 'Help & Support',
              subtitle: Support.email,
              onTap: () => _openSupportEmail(context),
            ),
            // Apple requires a way to restore purchases. Someone who
            // reinstalls, or signs in on a second device, has already paid
            // and must not be asked again.
            if (PurchasesService.isAvailable)
              _accountTile(
                icon: Icons.restore,
                title: 'Restore Purchases',
                subtitle: 'Already subscribed on this account?',
                onTap: () => _restorePurchases(context),
              ),
            _accountTile(
              icon: Icons.lock_outline,
              title: 'Privacy Policy',
              subtitle: 'How your data is handled',
              onTap: () => context.push('/privacy'),
            ),
            _accountTile(
              icon: Icons.description_outlined,
              title: 'Terms of Service',
              subtitle: 'The agreement you are on',
              onTap: () => context.push('/terms'),
            ),
            // Both stores require this for any app with sign-in, and it is last
            // on the list on purpose — nobody should reach it while aiming for
            // something else.
            if (user != null)
              _accountTile(
                icon: Icons.person_remove_outlined,
                title: 'Delete Account',
                subtitle: 'Permanently remove your account and data',
                onTap: () => _confirmDeleteAccount(context),
              ),
            const SizedBox(height: 24),
            const _VersionLine(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  /// The count comes from the catalogue rather than being written out, so it
  /// cannot promise a number the library no longer has. Null while loading —
  /// the sentence simply drops the figure rather than flashing a wrong one.
  static List<String> _benefits(int? sessionCount) => [
        sessionCount == null
            ? 'Every guided session'
            : '$sessionCount guided sessions',
        'All journaling & exercises',
        'All future content',
      ];

  Widget _userCard(
    BuildContext context,
    WidgetRef ref, {
    required dynamic user,
    required String? displayName,
  }) {
    if (user == null) {
      return _SignedOutCard(onTap: () => context.push('/sign-in'));
    }
    return _SignedInCard(
      email: (user.email as String?) ?? '',
      displayName: displayName ?? 'You',
      onSignOut: () async {
        final svc = ref.read(authServiceProvider);
        if (svc == null) return;
        await svc.signOut();
        // Otherwise the next person to sign in on this device inherits
        // the previous account's entitlement.
        await PurchasesService.instance.signOut();
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Signed out.')),
          );
        }
      },
    );
  }

  Future<void> _startCheckout(
    BuildContext context,
    String paymentLink,
    String? email, {
    required bool annual,
  }) async {
    // Guests must sign in first so the purchase can be associated with a
    // real user record in Supabase.
    if (email == null || email.isEmpty) {
      final go = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Sign in first'),
          content: const Text(
              'Please sign in so we can link your subscription to your '
              'account. Your 7-day trial will start after checkout.'),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Not now')),
            ElevatedButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Sign in')),
          ],
        ),
      );
      if (go == true && context.mounted) context.push('/sign-in');
      return;
    }
    // On a phone this has to go through the store. Apple and Google both
    // forbid taking payment for in-app digital goods any other way, and a
    // browser link is exactly what they reject for. The web build keeps
    // Stripe: no store is involved there and it costs no commission.
    if (PurchasesService.isAvailable) {
      await _buyThroughStore(context, annual: annual);
      return;
    }
    final url = Uri.parse(StripeLinks.withEmail(paymentLink, email));
    await launchUrl(url, mode: LaunchMode.externalApplication);
  }

  /// Signs the current user into RevenueCat before any purchase or restore,
  /// so what they buy attaches to their account rather than the device.
  Future<bool> _ensurePurchasesReady() async {
    final user = ref.read(authServiceProvider)?.currentUser;
    final email = user?.email;
    if (user == null || email == null) return false;
    await PurchasesService.instance.configure(userId: user.id, email: email);
    return true;
  }

  Future<void> _buyThroughStore(
    BuildContext context, {
    required bool annual,
  }) async {
    if (!await _ensurePurchasesReady()) return;
    final service = PurchasesService.instance;

    final packages = await service.plans();
    if (!context.mounted) return;
    if (packages.isEmpty) {
      _say(context,
          'Subscriptions are not available right now. Please try again '
          'shortly.');
      return;
    }
    // Matched on the product id rather than RevenueCat's package type, so
    // renaming a package in their dashboard cannot quietly sell the wrong
    // plan.
    //
    // No leading dot in the match. Apple's identifiers are
    // com.divinehealing.app.annual, but Play's are shaped
    // divine_healing_annual:annual — a dot would have matched on iOS and
    // silently fallen through to packages.first on Android, which is the
    // monthly plan.
    final wanted = annual ? 'annual' : 'monthly';
    final package = packages.firstWhere(
      (p) => p.storeProduct.identifier.contains(wanted),
      orElse: () => packages.first,
    );

    final outcome = await service.buy(package);
    if (!context.mounted) return;
    switch (outcome) {
      case PurchaseOutcome.purchased:
      case PurchaseOutcome.restored:
        await _waitForEntitlement(context);
      case PurchaseOutcome.cancelled:
        break;
      case PurchaseOutcome.nothingToRestore:
      case PurchaseOutcome.failed:
        _say(
            context,
            service.lastError ??
                'The purchase did not complete. You have not been charged.');
    }
  }

  Future<void> _restorePurchases(BuildContext context) async {
    if (!await _ensurePurchasesReady()) {
      if (context.mounted) _say(context, 'Sign in first to restore.');
      return;
    }
    final service = PurchasesService.instance;
    final outcome = await service.restore();
    if (!context.mounted) return;
    switch (outcome) {
      case PurchaseOutcome.restored:
      case PurchaseOutcome.purchased:
        await _waitForEntitlement(context);
      case PurchaseOutcome.nothingToRestore:
        _say(context, 'No previous purchase found on this account.');
      case PurchaseOutcome.cancelled:
      case PurchaseOutcome.failed:
        _say(context, service.lastError ?? 'Could not restore purchases.');
    }
  }

  /// The store confirms instantly; the entitlement reaches us only once
  /// RevenueCat's webhook has written to `sh_subscribers`. The audio paywall
  /// reads that table from Storage RLS, so until the row lands the sessions
  /// genuinely will not play — better to wait here than to unlock a library
  /// that then refuses to open.
  Future<void> _waitForEntitlement(BuildContext context) async {
    for (var attempt = 0; attempt < 10; attempt++) {
      ref.invalidate(subscriptionStatusProvider);
      final status = await ref.read(subscriptionStatusProvider.future);
      if (status.hasFullAccess) {
        if (context.mounted) _say(context, 'You are all set. Enjoy.');
        return;
      }
      await Future<void>.delayed(const Duration(seconds: 2));
    }
    if (context.mounted) {
      _say(
          context,
          'Payment received. Your access will appear in a moment — pull '
          'down to refresh.');
    }
  }

  /// Two taps, and the second one spells out what goes. Reviewers check
  /// that deletion is reachable; the confirmation is for the person who
  /// reached it by accident.
  Future<void> _confirmDeleteAccount(BuildContext context) async {
    final service = ref.read(accountDeletionServiceProvider);
    if (service == null) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete your account?'),
        content: const Text(
          'This removes your account, your journal entries, your '
          'manifestation answers, your saved affirmations and your progress. '
          'It cannot be undone.\n\n'
          'If you have a subscription, cancel it in the App Store or Play '
          'Store as well. Deleting your account here does not stop the '
          'billing they hold.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Keep my account'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(
              foregroundColor: DHColors.strawberryBlush,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;

    final outcome = await service.deleteCurrentAccount();
    if (!context.mounted) return;
    switch (outcome) {
      case DeletionOutcome.deleted:
        _say(context, 'Your account has been deleted.');
        context.go('/');
      case DeletionOutcome.notSignedIn:
        break;
      case DeletionOutcome.failed:
        _say(context, service.lastError ??
            'Could not delete the account. Please try again.');
    }
  }

  void _say(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  Future<void> _openSupportEmail(BuildContext context) async {
    final uri = Support.mailto();
    if (await launchUrl(uri, mode: LaunchMode.externalApplication)) return;
    // A device with no mail app configured would otherwise just swallow the
    // tap, which is how the row behaved before this change.
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Email ${Support.email}')),
      );
    }
  }

  Widget _sectionHeader(String label) => Row(
        children: [
          Container(
            width: 28,
            height: 2,
            decoration: BoxDecoration(
              color: DHColors.sunlightGold,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 12),
          Text(label, style: DHTypography.heading(size: 18)),
        ],
      );

  Widget _planCard({
    required BuildContext context,
    required int? sessionCount,
    required String tag,
    required String price,
    required String period,
    required String subtitle,
    required bool highlighted,
    required String paymentLink,
    required String? email,
    required bool annual,
  }) =>
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(DHRadius.card),
          border: Border.all(
            color: highlighted
                ? DHColors.sunlightGold
                : DHColors.sunlightGold.withOpacity(0.3),
            width: highlighted ? 2 : 1,
          ),
          boxShadow: DHShadows.card,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              tag,
              style: DHTypography.caption(color: DHColors.forestGreen),
            ),
            const SizedBox(height: 6),
            RichText(
              text: TextSpan(
                style: DHTypography.heading(size: 28, weight: FontWeight.w600),
                children: [
                  TextSpan(text: price),
                  TextSpan(
                    text: period,
                    style: DHTypography.body(size: 13, color: DHColors.secondary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: DHTypography.body(size: 12, color: DHColors.secondary),
            ),
            const SizedBox(height: 12),
            ..._benefits(sessionCount).map(
              (b) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_outline,
                        size: 16, color: DHColors.mossGreen),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(b, style: DHTypography.body(size: 12)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () =>
                      _startCheckout(context, paymentLink, email,
                          annual: annual),
                child: const Text('Start 7-day free trial'),
              ),
            ),
          ],
        ),
      );

  Widget _activeSubscriptionCard(SubscriptionStatus s, int? sessionCount) {
    final planLine = s.planName ?? 'Divine Awakening';
    final trialDays = s.trialDaysLeft;
    String statusLine;
    if (s.isTrialing && trialDays != null) {
      statusLine = trialDays <= 0
          ? 'Trial ends today — renews automatically.'
          : 'Free trial • $trialDays day${trialDays == 1 ? '' : 's'} left';
    } else if (s.isCanceledButActive) {
      statusLine = 'Canceled • Access until ${_formatDate(s.currentPeriodEnd)}';
    } else if (s.isActive && s.currentPeriodEnd != null) {
      statusLine = 'Renews on ${_formatDate(s.currentPeriodEnd)}';
    } else {
      statusLine = 'Active';
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            DHColors.softSage.withOpacity(0.55),
            DHColors.sandstone.withOpacity(0.45),
          ],
        ),
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold),
        boxShadow: DHShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.verified_rounded,
                    color: DHColors.forestGreen, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Subscription active',
                        style: DHTypography.heading(size: 15)),
                    Text(planLine,
                        style: DHTypography.caption(
                            color: DHColors.secondary)),
                  ],
                ),
              ),
              if (s.isTrialing)
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: DHColors.strawberryBlush.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text('TRIAL',
                      style: DHTypography.caption(
                              color: DHColors.strawberryBlush)
                          .copyWith(
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5)),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(statusLine,
              style: DHTypography.body(size: 13, color: DHColors.forestGreen)),
          const SizedBox(height: 8),
          Text(
            sessionCount == null
                ? 'You have full access to every session and to future '
                    'content. '
                : 'You have full access to all $sessionCount sessions and '
                    'future content. '
            'To cancel or update payment, email ${Support.email}.',
            style: DHTypography.caption(color: DHColors.secondary),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime? d) {
    if (d == null) return '—';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[d.month - 1]} ${d.day}, ${d.year}';
  }

  Widget _freeForeverCard() => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: DHColors.warmEarth.withOpacity(0.35),
          borderRadius: BorderRadius.circular(DHRadius.card),
          border: Border.all(color: DHColors.softClay.withOpacity(0.4)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: DHColors.softClay.withOpacity(0.25),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.spa_outlined,
                  color: DHColors.softClay, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Free forever',
                    style: DHTypography.heading(
                        size: 14, color: DHColors.softClay),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '2 preview meditations · Reiki & Spiritual Awakening info · Bookings',
                    style: DHTypography.body(size: 11, color: DHColors.secondary),
                  ),
                ],
              ),
            ),
          ],
        ),
      );

  Widget _accountTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(DHRadius.card),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(DHRadius.card),
              border: Border.all(color: DHColors.sunlightGold.withOpacity(0.25)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: DHColors.softSage.withOpacity(0.4),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, size: 18, color: DHColors.forestGreen),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: DHTypography.heading(size: 14)),
                      Text(subtitle,
                          style: DHTypography.body(
                              size: 11, color: DHColors.secondary)),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right,
                    color: DHColors.secondary, size: 20),
              ],
            ),
          ),
        ),
      );
}

// ============================================================
// User card variants
// ============================================================
class _SignedOutCard extends StatelessWidget {
  const _SignedOutCard({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(DHRadius.card),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              DHColors.softSage.withOpacity(0.6),
              DHColors.sandstone.withOpacity(0.5),
            ],
          ),
          borderRadius: BorderRadius.circular(DHRadius.card),
          border: Border.all(color: DHColors.sunlightGold.withOpacity(0.4)),
          boxShadow: DHShadows.card,
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                border: Border.all(color: DHColors.sunlightGold),
              ),
              child: const Icon(Icons.person_outline,
                  color: DHColors.forestGreen, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Sign in',
                      style: DHTypography.heading(size: 16)),
                  const SizedBox(height: 2),
                  Text('Sync your favourites, journal, and progress.',
                      style: DHTypography.caption(color: DHColors.secondary)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: DHColors.forestGreen),
          ],
        ),
      ),
    );
  }
}

class _SignedInCard extends StatelessWidget {
  const _SignedInCard({
    required this.email,
    required this.displayName,
    required this.onSignOut,
  });

  final String email;
  final String displayName;
  final VoidCallback onSignOut;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(DHRadius.card),
        border: Border.all(color: DHColors.sunlightGold.withOpacity(0.4)),
        boxShadow: DHShadows.card,
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [DHColors.sunlightGold, DHColors.softClay],
              ),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              displayName.isNotEmpty ? displayName[0].toUpperCase() : '?',
              style: DHTypography.heading(
                  size: 20, color: Colors.white, weight: FontWeight.w600),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Welcome home',
                    style: DHTypography.caption(color: DHColors.secondary)),
                Text(displayName,
                    style: DHTypography.heading(size: 16)),
                if (email.isNotEmpty)
                  Text(email,
                      style: DHTypography.caption(color: DHColors.secondary)),
              ],
            ),
          ),
          TextButton(
            onPressed: onSignOut,
            child: const Text('Sign out'),
          ),
        ],
      ),
    );
  }
}

/// The build actually running, at the foot of the profile.
///
/// Every round of "it's fixed" / "it still isn't" in testing came down to a
/// phone quietly holding an older build, and Android shows the user no way to
/// tell: the app info screen gives the version name, which never changes, and
/// not the build number, which does. Read from the platform rather than passed
/// in at build time, so it cannot disagree with what is installed.
class _VersionLine extends StatelessWidget {
  const _VersionLine();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<PackageInfo>(
      future: PackageInfo.fromPlatform(),
      builder: (context, snapshot) {
        final info = snapshot.data;
        if (info == null) return const SizedBox.shrink();
        return Center(
          child: Text(
            '${info.appName}  ${info.version} (${info.buildNumber})',
            style: DHTypography.caption(color: DHColors.secondary),
          ),
        );
      },
    );
  }
}
