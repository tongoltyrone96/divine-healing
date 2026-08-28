// Model for sh_content row (meditation/shadow_work/reiki session).
// Matches Supabase schema exactly.
//
// Regenerate after edits:
//   flutter pub run build_runner build --delete-conflicting-outputs

import 'package:freezed_annotation/freezed_annotation.dart';

part 'content_session.freezed.dart';
part 'content_session.g.dart';

enum ContentCategory {
  @JsonValue('meditation')
  meditation,
  @JsonValue('shadow_work')
  shadowWork,
  @JsonValue('reiki')
  reiki,
}

@freezed
class ContentSession with _$ContentSession {
  const ContentSession._();

  const factory ContentSession({
    required int id,
    required ContentCategory category,
    required String title,
    @Default('') String description,

    /// Storage path relative to bucket, e.g. "audio/15.mp3".
    /// Null / empty means text-only session (e.g. "Introduction to Reiki").
    String? contentBody,

    int? durationMinutes,
    String? thumbnailUrl,
    @Default(false) bool isPreview,
    @Default(0) int sortOrder,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _ContentSession;

  factory ContentSession.fromJson(Map<String, dynamic> json) =>
      _$ContentSessionFromJson(json);

  /// True if this session has an audio file to stream.
  bool get hasAudio =>
      contentBody != null && contentBody!.startsWith('audio/');

  /// Human-readable duration ("12 min" or "" if unknown).
  String get durationLabel =>
      durationMinutes != null ? '$durationMinutes min' : '';
}
