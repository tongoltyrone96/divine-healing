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

/// The currently signed-in user, or null if signed out (or M1 mode).
final currentUserProvider = Provider<User?>((ref) {
  final svc = ref.watch(authServiceProvider);
  if (svc == null) return null;
  // Force this provider to rebuild when auth state changes.
  ref.watch(authStateStreamProvider);
  return svc.currentUser;
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
