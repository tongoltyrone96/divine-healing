// Loads hardcoded content (chakras, affirmations, breathing techniques,
// prompts) from bundled asset JSON files. These never hit the network.

import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;

import '../models/chakra.dart';
import '../models/breathing_technique.dart';

class StaticContentRepository {
  Future<List<String>> loadAffirmations() async {
    final raw = await rootBundle.loadString('assets/content/affirmations.json');
    // File shape: { "prompts": null, "source": "...", "description": "..." }
    // Actually affirmations.json is a bare array. Fallback handling:
    final decoded = jsonDecode(raw);
    if (decoded is List) return decoded.cast<String>();
    if (decoded is Map && decoded['affirmations'] is List) {
      return List<String>.from(decoded['affirmations'] as List);
    }
    throw StateError('Unexpected affirmations.json shape');
  }

  Future<List<Chakra>> loadChakras() async {
    final raw = await rootBundle.loadString('assets/content/chakras.json');
    final list = jsonDecode(raw) as List;
    return list.map((e) => Chakra.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<BreathingTechnique>> loadBreathingTechniques() async {
    final raw = await rootBundle.loadString('assets/content/techniques.json');
    final list = jsonDecode(raw) as List;
    return list.map((e) => BreathingTechnique.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<String>> loadShadowWorkPrompts() async {
    final raw = await rootBundle.loadString('assets/content/shadow_work_prompts.json');
    final map = jsonDecode(raw) as Map<String, dynamic>;
    return List<String>.from(map['prompts'] as List);
  }

  Future<Map<String, dynamic>> loadManifestationForm() async {
    final raw = await rootBundle.loadString('assets/content/manifestation_form.json');
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> loadSpiritualAwakening() async {
    final raw = await rootBundle.loadString('assets/content/spiritual_awakening.json');
    return jsonDecode(raw) as Map<String, dynamic>;
  }
}
