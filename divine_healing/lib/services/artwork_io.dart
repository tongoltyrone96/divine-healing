import 'dart:io';

import 'package:flutter/services.dart' show rootBundle;
import 'package:path_provider/path_provider.dart';

/// The launcher mark rather than the full logo: the lock screen renders this
/// at roughly a fingertip's width, where `client_logo.png`'s wordmark is an
/// unreadable smudge. The launcher icon is already drawn to survive that size.
const _asset = 'assets/logo/app_icon.png';

Uri? _cached;

/// A file: URI the media session can point at for album art.
///
/// A MediaItem's artUri has to be something outside Flutter that can be read,
/// and an asset path is not that — assets live inside the APK. So the image is
/// written once into app storage and the URI reused for every session.
///
/// The file stays app-private. audio_service loads it in our own process and
/// hands the OS a bitmap, so it never needs to open the path itself.
///
/// Art is a nicety; nothing here is worth failing playback over, so every
/// failure just means no artwork.
Future<Uri?> mediaArtworkUri() async {
  if (_cached != null) return _cached;

  try {
    final dir = await getApplicationSupportDirectory();
    final file = File('${dir.path}/media_artwork.png');

    // Rewrite when missing or empty — an interrupted first run can leave a
    // zero-byte file behind, and that renders as a blank square rather than
    // as an error anyone would notice.
    if (!await file.exists() || await file.length() == 0) {
      final data = await rootBundle.load(_asset);
      await file.writeAsBytes(
        data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes),
        flush: true,
      );
    }

    return _cached = file.uri;
  } catch (_) {
    return null;
  }
}
