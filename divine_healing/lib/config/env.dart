/// Compile-time env vars, supplied via `--dart-define`.
///
/// Example:
///   flutter run \
///     --dart-define=SUPABASE_URL=https://xxx.supabase.co \
///     --dart-define=SUPABASE_ANON_KEY=eyJ...
///
/// If either is empty, the app runs in "M1 local-only" mode:
///   - Content Repository reads from bundled JSON assets
///   - Auth is not wired
///   - Journal / manifestation / favourites save to SharedPreferences only
class Env {
  Env._();

  static const supabaseUrl =
      String.fromEnvironment('SUPABASE_URL', defaultValue: '');

  static const supabaseAnonKey =
      String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');

  static const revenueCatKeyIos =
      String.fromEnvironment('REVENUECAT_IOS_KEY', defaultValue: '');

  static const revenueCatKeyAndroid =
      String.fromEnvironment('REVENUECAT_ANDROID_KEY', defaultValue: '');

  /// Whether both Supabase URL and anon key are present.
  static bool get hasSupabase =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;

  /// Whether RevenueCat is configured for the current platform.
  static bool get hasRevenueCat =>
      revenueCatKeyIos.isNotEmpty || revenueCatKeyAndroid.isNotEmpty;
}
