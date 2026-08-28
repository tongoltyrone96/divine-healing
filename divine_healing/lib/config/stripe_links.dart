/// Stripe Payment Links generated via `data/10_setup_stripe_products.js`.
/// These are stable customer-facing URLs — Stripe redirects to our app
/// after checkout (see `after_completion` in the setup script).
///
/// URLs are safe to embed in the client bundle. To rotate, run the script
/// again and paste new URLs here.
class StripeLinks {
  StripeLinks._();

  static const monthly =
      'https://buy.stripe.com/00weVf1nm0dAf4p5Q75os00';
  static const annual =
      'https://buy.stripe.com/7sY6oJea89Oa09vguL5os01';

  /// Appends the user's email as `prefilled_email` so Stripe pre-fills the
  /// checkout form. This also links the resulting Stripe Customer to our
  /// Supabase `sh_subscribers.user_email` when the webhook lands.
  static String withEmail(String link, String? email) {
    if (email == null || email.isEmpty) return link;
    final sep = link.contains('?') ? '&' : '?';
    return '$link${sep}prefilled_email=${Uri.encodeComponent(email)}';
  }
}
