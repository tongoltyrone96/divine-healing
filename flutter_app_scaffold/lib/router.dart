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
import 'features/_placeholders.dart';   // stubs: SignIn / ContentDetail / Chakras / Affirmations / Breathing / Manifestation / SpiritualAwakening / ShadowWork / Booking

final _rootKey = GlobalKey<NavigatorState>();
final _shellKey = GlobalKey<NavigatorState>();

GoRouter buildRouter() {
  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/splash',
    debugLogDiagnostics: true,
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
        path: '/affirmations',
        builder: (_, __) => const AffirmationsScreen(),
      ),
      GoRoute(
        path: '/breathing',
        builder: (_, __) => const BreathingScreen(),
      ),
      GoRoute(
        path: '/manifestation',
        builder: (_, __) => const ManifestationIntroScreen(),
      ),
      GoRoute(
        path: '/spiritual-awakening',
        builder: (_, __) => const SpiritualAwakeningScreen(),
      ),
      GoRoute(
        path: '/shadow-work/:id',
        builder: (_, state) => ShadowWorkExplanationScreen(
          contentId: int.parse(state.pathParameters['id']!),
        ),
      ),
      GoRoute(
        path: '/booking',
        builder: (_, __) => const BookingScreen(),
      ),
    ],
  );
}
