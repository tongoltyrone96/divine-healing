// Static content — loaded from assets/content/techniques.json
import 'package:freezed_annotation/freezed_annotation.dart';

part 'breathing_technique.freezed.dart';
part 'breathing_technique.g.dart';

@freezed
class BreathingTechnique with _$BreathingTechnique {
  const factory BreathingTechnique({
    required String emoji,
    required String name,
    required String subtitle,
    required String description,
    required List<String> steps,
    required List<String> benefits,
    String? color,   // ignored — theme handles styling
    String? accent,  // ignored
  }) = _BreathingTechnique;

  factory BreathingTechnique.fromJson(Map<String, dynamic> json) =>
      _$BreathingTechniqueFromJson(json);
}
