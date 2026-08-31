// GoRouter config — routes match Glide URL structure 1:1 for continuity.
//
// Shell (bottom nav) wraps Home / Library / Profile.
// Other screens push above the shell.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'features/splash/splash_screen.dart';
import 'features/shell/main_shell.dart';
import 'features/home/home_screen.dart';
import 'features/library/library_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/chakras/chakras_screen.dart';
import 'features/reiki/reiki_screen.dart';
import 'features/breathing/breathing_screen.dart';
import 'features/affirmations/affirmations_screen.dart';
import 'features/spiritual_awakening/spiritual_awakening_screen.dart';
import 'features/manifestation/manifestation_screen.dart';
import 'features/content_detail/content_detail_screen.dart';
import 'features/shadow_work/shadow_work_screen.dart';
import 'features/auth/sign_in_screen.dart';
import 'features/booking/booking_screen.dart';
import 'features/legal/delete_account_screen.dart';
import 'features/legal/privacy_policy_screen.dart';
import 'features/legal/terms_of_service_screen.dart';

final _rootKey = GlobalKey<NavigatorState>();
final _shellKey = GlobalKey<NavigatorState>();

GoRouter buildRouter() {
  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    // Handle Supabase auth redirects (both success `?code=` and error
    // `?error=` variants) by routing them to '/' — Supabase SDK auto-picks up
    // the code from the URL, so we just need to land somewhere valid.
    redirect: (context, state) {
      final params = state.uri.queryParameters;
      if (params.containsKey('code') || params.containsKey('error')) {
        // Preserve params in fragment so SignIn / Home can show a message.
        final err = params['error_description'] ?? params['error'];
        if (err != null) {
          return '/sign-in?auth_error=${Uri.encodeComponent(err)}';
        }
        return '/';
      }
      return null;
    },
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('Not found')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Page not found'),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => GoRouter.of(context).go('/'),
              child: const Text('Go home'),
            ),
          ],
        ),
      ),
    ),
    routes: [
      GoRoute(
        path: '/splash',
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: '/sign-in',
        builder: (_, __) => const SignInScreen(),
      ),

      // ==================== Shell (bottom nav) ====================
      ShellRoute(
        navigatorKey: _shellKey,
        builder: (_, __, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (_, __) => const HomeScreen(),
          ),
          GoRoute(
            path: '/library',
            builder: (_, state) => LibraryScreen(
              category: state.uri.queryParameters['category'],
            ),
            routes: [
              GoRoute(
                path: ':category',
                builder: (_, state) => LibraryScreen(
                  category: state.pathParameters['category'],
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/profile',
            builder: (_, __) => const ProfileScreen(),
          ),
        ],
      ),

      // ==================== Above-shell routes ====================
      GoRoute(
        path: '/content/:id',
        builder: (_, state) => ContentDetailScreen(
          contentId: int.parse(state.pathParameters['id']!),
        ),
      ),
      GoRoute(
        path: '/chakras',
        builder: (_, __) => const ChakrasScreen(),
      ),
      GoRoute(
        path: '/reiki',
        builder: (_, __) => const ReikiScreen(),
      ),
      GoRoute(
        path: '/affirmations',
        builder: (_, __) => const AffirmationsScreen(),
      ),
      GoRoute(
        path: '/breathing',
        builder: (_, __) => const BreathingScreen(),
      ),
      GoRoute(
        path: '/manifestation',
        builder: (_, __) => const ManifestationScreen(),
      ),
      GoRoute(
        path: '/spiritual-awakening',
        builder: (_, __) => const SpiritualAwakeningScreen(),
      ),
      GoRoute(
        path: '/shadow-work/:id',
        builder: (_, state) => ShadowWorkScreen(
          contentId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/booking',
        builder: (_, __) => const BookingScreen(),
      ),
      GoRoute(
        path: '/privacy',
        builder: (_, __) => const PrivacyPolicyScreen(),
      ),
      GoRoute(
        path: '/terms',
        builder: (_, __) => const TermsOfServiceScreen(),
      ),
      // Outside the shell and outside any sign-in check, on purpose: Play
      // requires an address that works for someone who has already
      // uninstalled the app.
      GoRoute(
        path: '/delete-account',
        builder: (_, __) => const DeleteAccountScreen(),
      ),
    ],
  );
}
