import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path_provider/path_provider.dart';

/// The brand logo — the same image flutter_launcher_icons builds the launcher
/// from, so the lock screen, home screen and app drawer all show one mark.
const _asset = 'assets/logo/client_logo.png';

/// The media card is a wide strip and the OS crops artwork to fill it, so a
/// square logo arrives sliced through the middle: the tree cut top and bottom,
/// the wordmark halved. Compositing onto a canvas of roughly the card's
/// proportions, with the logo set well inside it, gives the crop margin to eat
/// instead of the logo.
const _canvasWidth = 1200;
const _canvasHeight = 630;

/// Fraction of the canvas height the logo occupies. Low enough that the whole
/// mark survives a tighter crop than the one measured on this device.
const _logoScale = 0.68;

/// Bumped whenever the composition changes, so a device holding an older
/// rendering redraws instead of keeping it for the life of the install.
const _revision = 2;

Uri? _cached;

/// A file: URI the media session can point at for album art.
///
/// A MediaItem's artUri has to be something outside Flutter that can be read,
/// and an asset path is not that — assets live inside the APK. So the image is
/// composed once into app storage and the URI reused for every session.
///
/// The file stays app-private. audio_service loads it in our own process and
/// hands the OS a bitmap, so it never opens the path itself.
///
/// Art is a nicety; nothing here is worth failing playback over, so every
/// failure just means no artwork.
Future<Uri?> mediaArtworkUri() async {
  if (_cached != null) return _cached;

  try {
    final dir = await getApplicationSupportDirectory();
    // Named after the asset and the revision, so changing either produces a
    // different file. Under a fixed name an install that had already staged
    // the old artwork would keep serving it forever — the write only happens
    // when the file is missing.
    final stamp = _asset.replaceAll(RegExp(r'[^A-Za-z0-9]+'), '_');
    final file = File('${dir.path}/artwork_${stamp}_v$_revision.png');

    // Rewrite when missing or empty: an interrupted first run leaves a
    // zero-byte file, which renders as a blank card rather than as anything
    // anyone would think to report.
    if (!await file.exists() || await file.length() == 0) {
      final bytes = await _composeArtwork();
      if (bytes == null) return null;
      await file.writeAsBytes(bytes, flush: true);
      await _removeStaleArtwork(dir, keep: file.path);
    }

    return _cached = file.uri;
  } catch (_) {
    return null;
  }
}

/// Draws the logo, scaled and centred, on white.
Future<Uint8List?> _composeArtwork() async {
  final data = await rootBundle.load(_asset);
  final codec = await ui.instantiateImageCodec(
    data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes),
  );
  final logo = (await codec.getNextFrame()).image;

  final size = Size(_canvasWidth.toDouble(), _canvasHeight.toDouble());
  final recorder = ui.PictureRecorder();
  final canvas = Canvas(recorder, Offset.zero & size);

  // White rather than transparent: the OS composites this behind its own
  // scrim, and transparency there comes out as a murky rectangle.
  canvas.drawRect(Offset.zero & size, Paint()..color = Colors.white);

  final scale = (size.height * _logoScale) / logo.height;
  final drawnWidth = logo.width * scale;
  final drawnHeight = logo.height * scale;
  canvas.drawImageRect(
    logo,
    Rect.fromLTWH(0, 0, logo.width.toDouble(), logo.height.toDouble()),
    Rect.fromLTWH(
      (size.width - drawnWidth) / 2,
      (size.height - drawnHeight) / 2,
      drawnWidth,
      drawnHeight,
    ),
    Paint()..filterQuality = FilterQuality.high,
  );

  final image =
      await recorder.endRecording().toImage(_canvasWidth, _canvasHeight);
  final png = await image.toByteData(format: ui.ImageByteFormat.png);

  logo.dispose();
  image.dispose();

  return png?.buffer.asUint8List();
}

/// Deletes renderings from earlier assets or revisions. Without this, every
/// change to the artwork leaves another megabyte behind for good.
Future<void> _removeStaleArtwork(Directory dir, {required String keep}) async {
  try {
    await for (final entry in dir.list()) {
      if (entry is! File || entry.path == keep) continue;
      final name = entry.path.split(Platform.pathSeparator).last;
      if (name.startsWith('artwork_') || name == 'media_artwork.png') {
        await entry.delete();
      }
    }
  } catch (_) {
    // Housekeeping only; not worth surfacing.
  }
}
