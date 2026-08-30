// Host side of the screenshot run.
//
// takeScreenshot in the test sends bytes here; on iOS there is no other way
// to get them off the device. Without this file the test still passes and
// silently produces nothing.

import 'dart:io';

import 'package:integration_test/integration_test_driver_extended.dart';

Future<void> main() async {
  await integrationDriver(
    onScreenshot: (String name, List<int> bytes, [Map<String, Object?>? _]) async {
      final file = File('screenshots/$name.png');
      await file.parent.create(recursive: true);
      await file.writeAsBytes(bytes);
      stdout.writeln('screenshot: ${file.path} (${bytes.length} bytes)');
      return true;
    },
  );
}
