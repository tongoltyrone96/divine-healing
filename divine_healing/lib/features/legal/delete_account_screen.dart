/// How to delete a Divine Healing account.
///
/// This page exists because both stores require it. Google Play asks for a
/// web address that works without installing the app, so somebody who has
/// already uninstalled can still ask; Apple asks for the route inside the
/// app, which is on the Profile screen. The URL goes in both store
/// listings and in Play's Data safety form.
///
/// It is deliberately reachable without signing in — the whole point is
/// that it works for someone who cannot get into the app any more.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/support.dart';
import '../../theme.dart';

class DeleteAccountScreen extends StatelessWidget {
  const DeleteAccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Delete Account'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.canPop() ? context.pop() : context.go('/'),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            // The store links open this in a desktop browser as often as on a
            // phone, and a line of text the full width of a monitor is
            // unreadable.
            constraints: const BoxConstraints(maxWidth: 620),
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Deleting your account',
                    style: DHTypography.heading(
                        size: 26, weight: FontWeight.w600),
                  ),
                  const SizedBox(height: 20),
                  _p('You can delete your Divine Healing account at any '
                      'time. Deletion is permanent and cannot be undone.'),
                  _h('In the app'),
                  _p('Open Profile, scroll to Account, and tap Delete '
                      'Account. You will be asked to confirm once.'),
                  _h('If you no longer have the app'),
                  _p('Email ${Support.email} from the address you signed up '
                      'with and ask for your account to be deleted. We will '
                      'confirm once it is done.'),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: () => launchUrl(
                      Support.mailto(subject: 'Delete my account'),
                      mode: LaunchMode.externalApplication,
                    ),
                    icon: const Icon(Icons.mail_outline, size: 18),
                    label: Text('Email ${Support.email}'),
                  ),
                  _h('What is deleted'),
                  _bullet('Your account and sign-in'),
                  _bullet('Shadow work journal entries'),
                  _bullet('Manifestation exercise answers'),
                  _bullet('Saved affirmations'),
                  _bullet('Session progress and completion history'),
                  _bullet('Your subscription record'),
                  const SizedBox(height: 12),
                  _p('All of it is removed immediately. Nothing is kept in a '
                      'recoverable form, and there is no waiting period '
                      'during which it could be restored.'),
                  _h('Your subscription'),
                  _p('Deleting your account does not cancel a subscription. '
                      'Apple and Google hold the billing, not us, so cancel '
                      'it in the App Store or Play Store as well — otherwise '
                      'it keeps renewing after the account is gone.'),
                  const SizedBox(height: 20),
                  TextButton(
                    onPressed: () => context.go('/privacy'),
                    child: const Text('Read the privacy policy'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _h(String title) => Padding(
        padding: const EdgeInsets.only(top: 22, bottom: 6),
        child: Text(title,
            style: DHTypography.heading(size: 17, weight: FontWeight.w600)),
      );

  Widget _p(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(text, style: DHTypography.body(size: 14, height: 1.6)),
      );

  Widget _bullet(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.only(top: 6, right: 10),
              child: Icon(Icons.circle, size: 5, color: DHColors.mossGreen),
            ),
            Expanded(
              child:
                  Text(text, style: DHTypography.body(size: 14, height: 1.6)),
            ),
          ],
        ),
      );
}
