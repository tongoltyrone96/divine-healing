/// Web (and anywhere without dart:io) has no filesystem to stage artwork on,
/// and no OS media session to show it in. Returning null leaves the media item
/// without art, which is exactly right there.
///
/// Selected by the conditional import in `artwork.dart`.
Future<Uri?> mediaArtworkUri() async => null;
