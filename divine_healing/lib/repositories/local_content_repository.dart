import 'dart:convert';

import 'package:flutter/services.dart' show rootBundle;

import '../models/content_session.dart';
import 'content_repository.dart';

/// M1 content source — reads bundled `assets/content/admin_content.json`.
/// Audio playback is not wired in M1; `getAudioUrl` returns null.
class LocalContentRepository implements ContentRepository {
  LocalContentRepository();

  List<ContentSession>? _cache;

  Future<List<ContentSession>> _load() async {
    if (_cache != null) return _cache!;
    final raw = await rootBundle
        .loadString('assets/content/admin_content.json');
    final list = (json.decode(raw) as List).cast<Map<String, dynamic>>();
    _cache = list.map(ContentSession.fromJson).toList();
    return _cache!;
  }

  @override
  Future<List<ContentSession>> getAll({String? category}) async {
    final all = await _load();
    if (category == null) return all;
    return all.where((c) => c.category == category).toList();
  }

  @override
  Future<List<ContentSession>> getFreePreview() async {
    final all = await _load();
    return all.where((c) => c.isPreview).toList();
  }

  @override
  Future<ContentSession?> getById(int id) async {
    final all = await _load();
    for (final c in all) {
      if (c.id == id) return c;
    }
    return null;
  }

  @override
  Future<String?> getAudioUrl(String contentBody) async {
    // Audio not bundled in M1 (325 MB). Real playback wires up in M2 via
    // Supabase Storage signed URLs.
    return null;
  }
}
