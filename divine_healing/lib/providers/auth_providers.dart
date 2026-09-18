import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/env.dart';
import '../services/auth_service.dart';

/// The shared AuthService. Null when Supabase is not configured (M1 local mode).
final authServiceProvider = Provider<AuthService?>((ref) {
  if (!Env.hasSupabase) return null;
  return AuthService(Supabase.instance.client);
});

/// Streams auth state changes (sign-in, sign-out, token refresh).
final authStateStreamProvider = StreamProvider<AuthState>((ref) {
  final svc = ref.watch(authServiceProvider);
  if (svc == null) return const Stream.empty();
  return svc.onAuthStateChange;
});

/// The raw auth session, which is an anonymous one for anyone who has not
/// signed in. Use it when what matters is "is there a uid to attach things
/// to" — a purchase, a signed audio URL. For "has this person an account",
/// which is what the UI almost always means, use [currentUserProvider].
final authUserProvider = Provider<User?>((ref) {
  final svc = ref.watch(authServiceProvider);
  if (svc == null) return null;
  // Force this provider to rebuild when auth state changes.
  ref.watch(authStateStreamProvider);
  return svc.currentUser;
});

/// The user's account, or null when they are browsing anonymously.
///
/// Every guest holds an anonymous Supabase session from launch, so the raw
/// user is almost never null and cannot stand in for "signed in" any more.
/// App Review's 5.1.1(v) rejection is why the anonymous session exists: a
/// subscription that unlocks the same library for everyone is not
/// account-based content, so registering has to stay optional, and an
/// anonymous uid is what gives a guest something to buy against.
final currentUserProvider = Provider<User?>((ref) {
  final user = ref.watch(authUserProvider);
  if (user == null || user.isAnonymous) return null;
  return user;
});

/// Convenience: is the user currently signed in?
final isSignedInProvider = Provider<bool>((ref) {
  return ref.watch(currentUserProvider) != null;
});

/// Best display name we can extract from the user metadata / email.
final userDisplayNameProvider = Provider<String?>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return null;
  final meta = user.userMetadata ?? {};
  final full = (meta['full_name'] ?? meta['name']) as String?;
  if (full != null && full.trim().isNotEmpty) return full.split(' ').first;
  final email = user.email ?? '';
  if (email.isEmpty) return null;
  return email.split('@').first;
});
