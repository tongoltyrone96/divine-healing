// Drives the app on a simulator and captures each main screen.
//
// Two jobs in one run. It proves the iOS build launches and navigates —
// there is no iPhone on this project, so until now nothing had ever run the
// iOS binary — and it produces the App Store screenshots at the exact pixel
// size Apple asks for, because a simulator screenshot is native resolution.
//
// Run it through the workflow, not by hand:
//   .github/workflows/ios-simulator.yml

import 'dart:io' show Platform;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:divine_healing/main.dart' as app;

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('captures the main screens', (tester) async {
    // Android renders Flutter into a SurfaceView, which screenshot capture
    // cannot read. Converting it first is Android-only; calling it on iOS
    // throws.
    if (Platform.isAndroid) {
      await binding.convertFlutterSurfaceToImage();
    }

    app.main();

    // pumpAndSettle waits for every animation to stop, and this app always
    // has one running — the splash breathes, cards fade in. It would time out
    // rather than settle, so the wait is explicit instead.
    await _settle(tester, const Duration(seconds: 8));
    await binding.takeScreenshot('01-home');

    await _openTab(tester, binding, 'Library', '02-library');
    await _openTab(tester, binding, 'Profile', '04-profile');

    // The session screen is captured last, and deliberately. It sits outside
    // the tab shell, so leaving it means navigating back — and pageBack only
    // recognises the stock back buttons, not this app's own. Ending here
    // needs no way out. The file names are the store's running order, which
    // does not have to match the order they were taken in.
    await _openTab(tester, binding, 'Library', '02-library');
    final session = find.text('Introduction to Reiki');
    if (session.evaluate().isNotEmpty) {
      // One of the three free sessions, so no paywall stands in front of it.
      await tester.tap(session.first);
      await _settle(tester, const Duration(seconds: 4));
      await binding.takeScreenshot('03-session');
    }
  });
}

/// Pumps in slices for [total]. Network fills the catalogue, so this has to
/// outlast a cold Supabase request on a runner.
Future<void> _settle(WidgetTester tester, Duration total) async {
  const slice = Duration(milliseconds: 250);
  for (var spent = Duration.zero; spent < total; spent += slice) {
    await tester.pump(slice);
  }
}

Future<void> _openTab(
  WidgetTester tester,
  IntegrationTestWidgetsFlutterBinding binding,
  String label,
  String name,
) async {
  // The label is inside a NavigationDestination, and the same word may appear
  // in the page body — "Library" is a heading too. Scoping to the navigation
  // bar keeps the tap on the tab.
  final tab = find.descendant(
    of: find.byType(NavigationBar),
    matching: find.text(label),
  );
  expect(tab, findsOneWidget, reason: 'no "$label" tab in the navigation bar');

  await tester.tap(tab);
  await _settle(tester, const Duration(seconds: 4));
  await binding.takeScreenshot(name);
}
