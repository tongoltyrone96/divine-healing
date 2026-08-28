import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme.dart';

/// Splash — soft gradient (Sage → Forest Green), leaf + gold orb icon,
/// "Divine Healing" + "by Strawberry Hope" text, thin gold accent line.
///
/// Per client spec — brand hook screen.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Auto-advance after brief hold.
    // TODO: check auth state → route to /sign-in or / accordingly.
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) context.go('/');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [DHColors.softSage, DHColors.forestGreen],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Leaf + gold orb icon
                // TODO: replace with client-provided logo asset when available
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.15),
                    border: Border.all(color: DHColors.sunlightGold, width: 2),
                  ),
                  child: const Icon(
                    Icons.eco,           // temp: leaf icon from Material
                    size: 48,
                    color: DHColors.sunlightGold,
                  ),
                ),
                const SizedBox(height: 32),
                Text(
                  'Divine Healing',
                  style: DHTypography.heading(
                    size: 32,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'by Strawberry Hope',
                  style: DHTypography.body(
                    size: 14,
                    color: Colors.white.withOpacity(0.85),
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  width: 40,
                  height: 1,
                  color: DHColors.sunlightGold,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
