// Divine Healing brand theme.
// Source: client's brand system message (Strawberry Hope).
//
// Move this to `lib/theme.dart` when Flutter project is created:
//   flutter create --org com.strawberryhope divine_healing
//
// Missing (waiting on client answers):
//   - Sandstone / Strawberry Blush full hex codes (last char was cut off in original message)
//   - Font pair confirmation (Playfair+Nunito recommended)
//   - Google Fonts vs bundled — see notes below

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class DHColors {
  DHColors._();

  // ============================================================
  // Primary Palette — REBRANDED 2026-08-26
  // Purple + pink palette derived from the client's tree-of-life logo.
  // Names kept identical to the original green palette so every screen
  // recolours automatically; only the underlying hex values changed.
  // ============================================================
  static const forestGreen   = Color(0xFF5B3A5E);  // Deep Plum — headers, primary buttons
  static const mossGreen     = Color(0xFF8B5A8C);  // Rose Purple — cards, accents
  static const softSage      = Color(0xFFE9D5EA);  // Soft Lavender — backgrounds
  static const sageMist      = Color(0xFFFCF5F8);  // Blush Mist — light bg / near-white

  // ============================================================
  // Secondary Palette
  // ============================================================
  static const warmEarth     = Color(0xFFF5D4D9);  // Warm Blush — module cards
  static const softClay      = Color(0xFFC7A0AB);  // Soft Rose — highlights

  static const sandstone       = Color(0xFFF5E4E7); // Pink Sandstone
  static const strawberryBlush = Color(0xFFD96A7B); // kept — client's CTA colour

  // ============================================================
  // Accents
  // ============================================================
  static const sunlightGold  = Color(0xFFC48B95);  // Rose Gold — borders, icons (formerly gold)

  // ============================================================
  // Semantic aliases (use these in UI code, not raw names)
  // ============================================================
  static const primary       = forestGreen;
  static const onPrimary     = Colors.white;
  static const secondary     = mossGreen;
  static const surface       = sageMist;
  static const surfaceAlt    = softSage;
  static const cardBg        = warmEarth;
  static const highlight     = softClay;
  static const accent        = sunlightGold;
  static const ctaButton     = strawberryBlush;  // "Begin Reflection" etc.
  static const border        = sunlightGold;
}

class DHTypography {
  DHTypography._();

  // Client offered two pairs; awaiting confirmation. Recommended: Playfair + Nunito.
  //
  // Google Fonts approach = zero-download install, always fresh, network-dependent at first launch.
  // Alternative: bundle .ttf in pubspec assets for offline-first (recommended for meditation app).
  //
  // For now use Google Fonts; swap to bundled fonts before v1 release.

  static TextStyle heading({
    double size = 28,
    FontWeight weight = FontWeight.w600,
    Color color = DHColors.primary,
    double? letterSpacing,
  }) =>
      GoogleFonts.playfairDisplay(
        fontSize: size,
        fontWeight: weight,
        color: color,
        letterSpacing: letterSpacing ?? -0.2,
      );

  static TextStyle body({
    double size = 15,
    FontWeight weight = FontWeight.w400,
    Color color = DHColors.primary,
    double height = 1.5,
  }) =>
      GoogleFonts.nunito(
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: height,
      );

  static TextStyle button({
    double size = 15,
    FontWeight weight = FontWeight.w600,
    Color color = Colors.white,
  }) =>
      GoogleFonts.inter(
        fontSize: size,
        fontWeight: weight,
        color: color,
        letterSpacing: 0.2,
      );

  static TextStyle caption({
    double size = 12,
    Color color = DHColors.secondary,
  }) =>
      GoogleFonts.nunito(
        fontSize: size,
        color: color,
        fontWeight: FontWeight.w500,
      );
}

class DHRadius {
  DHRadius._();
  static const card = 16.0;
  static const button = 12.0;
  static const chip = 999.0;
  static const image = 12.0;
}

class DHShadows {
  DHShadows._();

  /// Soft drop shadow used on rounded cards per client spec.
  static final card = [
    BoxShadow(
      color: Colors.black.withOpacity(0.05),
      blurRadius: 12,
      offset: const Offset(0, 2),
    ),
  ];
}

ThemeData buildDivineHealingTheme() {
  final colorScheme = ColorScheme.light(
    primary: DHColors.primary,
    onPrimary: DHColors.onPrimary,
    secondary: DHColors.secondary,
    onSecondary: Colors.white,
    surface: DHColors.surface,
    onSurface: DHColors.primary,
    error: Colors.redAccent,
    onError: Colors.white,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: DHColors.surface,
    textTheme: TextTheme(
      displayLarge: DHTypography.heading(size: 40),
      displayMedium: DHTypography.heading(size: 32),
      headlineLarge: DHTypography.heading(size: 28),
      headlineMedium: DHTypography.heading(size: 22),
      titleLarge: DHTypography.heading(size: 18),
      bodyLarge: DHTypography.body(size: 16),
      bodyMedium: DHTypography.body(size: 14),
      bodySmall: DHTypography.caption(),
      labelLarge: DHTypography.button(),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: DHColors.surface,
      foregroundColor: DHColors.primary,
      elevation: 8,
      shadowColor: DHColors.mossGreen.withOpacity(0.5),
      surfaceTintColor: Colors.transparent,
      centerTitle: true,
      titleTextStyle: DHTypography.heading(size: 26),
      toolbarHeight: 64,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: DHColors.primary,
        foregroundColor: DHColors.onPrimary,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(DHRadius.button),
          side: BorderSide(color: DHColors.accent, width: 1),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        textStyle: DHTypography.button(),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: DHColors.primary,
        side: BorderSide(color: DHColors.accent),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(DHRadius.button),
        ),
        textStyle: DHTypography.button(color: DHColors.primary),
      ),
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(DHRadius.card),
        side: BorderSide(color: DHColors.accent.withOpacity(0.3)),
      ),
    ),
  );
}
