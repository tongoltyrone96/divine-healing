import 'artwork_stub.dart' if (dart.library.io) 'artwork_io.dart' as impl;

/// Album art for the OS media session, or null where there is none to give.
///
/// Split behind a conditional import because the only way to hand Android a
/// picture is a file on disk, and importing dart:io to write one would break
/// the web build outright — the demo the client reviews runs on web.
Future<Uri?> mediaArtworkUri() => impl.mediaArtworkUri();
