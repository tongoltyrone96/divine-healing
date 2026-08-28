// Static content — loaded from assets/content/chakras.json
import 'package:freezed_annotation/freezed_annotation.dart';

part 'chakra.freezed.dart';
part 'chakra.g.dart';

@freezed
class Chakra with _$Chakra {
  const factory Chakra({
    required String name,
    required String sanskrit,
    required String emoji,
    required String description,
    required List<String> affirmations,
    required List<String> practices,
    required List<String> imbalance,

    /// CSS-style hint from Glide (e.g. "bg-red-50 border-red-200") — for reference.
    /// Ignored in Flutter theme; we style via Material theme colors instead.
    String? color,
    String? accent,
    String? badge,
  }) = _Chakra;

  factory Chakra.fromJson(Map<String, dynamic> json) => _$ChakraFromJson(json);
}
