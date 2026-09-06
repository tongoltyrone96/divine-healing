/// Where people reach Strawberry Hope.
///
/// Confirmed by the client 2026-08-29 as the address to show publicly, and it
/// is what the store listings will carry. It appeared in three files already;
/// one definition means changing it once.
class Support {
  Support._();

  static const email = 'gstsaver@me.com';

  /// A pre-addressed mail link. The subject names the app so an enquiry that
  /// lands in a personal inbox is recognisable as coming from it.
  static Uri mailto({String subject = 'Divine Awakening app'}) => Uri(
        scheme: 'mailto',
        path: email,
        query: 'subject=${Uri.encodeComponent(subject)}',
      );
}
