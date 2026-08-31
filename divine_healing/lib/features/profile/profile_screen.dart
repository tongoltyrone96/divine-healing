import 'package:flutter/material.dart';
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
    String? email,
  ) async {
    // Guests must sign in first so Stripe can associate the subscription
    // with a real user record in Supabase.
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
    final url = Uri.parse(StripeLinks.withEmail(paymentLink, email));
    await launchUrl(url, mode: LaunchMode.externalApplication);
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
                onPressed: () => _startCheckout(context, paymentLink, email),
                child: const Text('Start 7-day free trial'),
              ),
            ),
          ],
        ),
      );

  Widget _activeSubscriptionCard(SubscriptionStatus s, int? sessionCount) {
    final planLine = s.planName ?? 'Divine Healing';
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
