/// One row from `sh_content` in Supabase (M2) or `admin_content.json` bundled
/// asset (M1). Shape matches the original Glide schema exactly so both sources
/// deserialize into the same object.
class ContentSession {
  const ContentSession({
    required this.id,
    required this.category,
    required this.title,
    required this.description,
    required this.contentBody,
    required this.durationMinutes,
    required this.isPreview,
    required this.sortOrder,
  });

  final int id;
  final String category;      // 'meditation' | 'shadow_work' | 'reiki'
  final String title;
  final String description;
  final String contentBody;   // storage path, e.g. 'audio/15.mp3'
  final int durationMinutes;
  final bool isPreview;
  final int sortOrder;

  bool get hasAudio => contentBody.isNotEmpty;

  factory ContentSession.fromJson(Map<String, dynamic> j) {
    final rawId = j['id'];
    return ContentSession(
      id: rawId is int ? rawId : int.parse(rawId.toString()),
      category: (j['category'] as String?) ?? 'meditation',
      title: (j['title'] as String?) ?? 'Untitled',
      description: (j['description'] as String?) ?? '',
      contentBody: (j['content_body'] as String?) ?? '',
      durationMinutes: (j['duration_minutes'] as num?)?.toInt() ?? 0,
      isPreview: (j['is_preview'] as bool?) ?? false,
      sortOrder: (j['sort_order'] as num?)?.toInt() ?? 0,
    );
  }
}
