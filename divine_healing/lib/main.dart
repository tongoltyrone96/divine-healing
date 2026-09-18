import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config/env.dart';
import 'providers/audio_providers.dart';
import 'router.dart';
import 'services/audio_handler.dart';
import 'services/auth_service.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (Env.hasSupabase) {
    await Supabase.initialize(
      url: Env.supabaseUrl,
      anonKey: Env.supabaseAnonKey,
    );
    // Before any screen can ask whether this person may hear a paid session.
    // Storage RLS answers that for a uid, and a guest has to have one to be
    // able to buy at all — see AuthService.ensureSession.
    await AuthService(Supabase.instance.client).ensureSession();
  }

  // Claiming the OS media session is async and has to finish before any
  // screen can ask for the player, so it happens here rather than lazily.
  final audioHandler = await initAudioHandler();

  runApp(
    ProviderScope(
      overrides: [audioHandlerProvider.overrideWithValue(audioHandler)],
      child: const DivineHealingApp(),
    ),
  );
}

class DivineHealingApp extends StatelessWidget {
  const DivineHealingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Divine Awakening',
      theme: buildDivineHealingTheme(),
      routerConfig: buildRouter(),
      debugShowCheckedModeBanner: false,
    );
  }
}
