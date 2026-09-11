/// Where people reach Strawberry Hope.
///
/// Confirmed by the client 2026-08-29 as gstsaver@me.com, then changed
/// 2026-09-11 to a dedicated address the client's daughter monitors. It
/// appeared in three files already; one definition means changing it once.
class Support {
  Support._();

  static const email = 'cosmicrememberance@gmail.com';

  /// A pre-addressed mail link. The subject names the app so an enquiry that
  /// lands in a personal inbox is recognisable as coming from it.
  static Uri mailto({String subject = 'Divine Awakening app'}) => Uri(
        scheme: 'mailto',
        path: email,
        query: 'subject=${Uri.encodeComponent(subject)}',
      );
}
