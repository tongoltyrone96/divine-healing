/// Deleting an account, and everything belonging to it.
///
/// Required by both stores for any app with sign-in — Google Play since
/// 2023, Apple's guideline 5.1.1(v) since June 2022 — and asked about
/// directly on Play's Data safety form.
///
/// A separate file rather than a method on [AuthService]: this calls an Edge
/// Function rather than Supabase Auth, and keeping it apart means the
/// sign-in path that works today is not touched.
library;

import 'package:supabase_flutter/supabase_flutter.dart';

enum DeletionOutcome {
  /// Gone. The session is already invalid by the time this returns.
  deleted,

  /// Nobody was signed in, so there was nothing to delete.
  notSignedIn,

  /// The server refused or could not be reached. Nothing was removed.
  failed,
}

class AccountDeletionService {
  AccountDeletionService(this._client);

  final SupabaseClient _client;

  String? lastError;

  /// Deletes the signed-in user's rows and then their login.
  ///
  /// The function derives who is asking from the access token and takes no
  /// user id, so there is nothing here that could delete somebody else's
  /// account by mistake.
  Future<DeletionOutcome> deleteCurrentAccount() async {
    lastError = null;
    if (_client.auth.currentUser == null) return DeletionOutcome.notSignedIn;

    try {
      await _client.functions.invoke('delete-account');
    } on FunctionException catch (e) {
      // The function returns a sentence written for the person reading it.
      final details = e.details;
      lastError = details is Map && details['error'] is String
          ? details['error'] as String
          : 'Could not delete the account. Please try again.';
      return DeletionOutcome.failed;
    } catch (e) {
      lastError = 'Could not reach the server. Please try again.';
      return DeletionOutcome.failed;
    }

    // The login no longer exists, so the stored session is a token for a
    // user that is gone. Clearing it locally is what actually returns the
    // app to its signed-out state.
    try {
      await _client.auth.signOut();
    } on AuthException {
      // Signing out a deleted user can fail on the server; the local session
      // is cleared either way, which is the part that matters here.
    }
    return DeletionOutcome.deleted;
  }
}
