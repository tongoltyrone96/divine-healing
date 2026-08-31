// Supabase Edge Function — deletes the caller's account and everything of
// theirs.
//
// Required by both stores for any app with sign-in: Google Play since 2023,
// Apple's guideline 5.1.1(v) since June 2022. Each wants an in-app route and
// a public web page, and the Data safety form asks about it directly.
//
// The caller is taken from their JWT and never from the request body. There
// is no user id parameter to tamper with, so the worst a forged request can
// do is delete the account it already authenticated as.
//
// Note the anon key is itself a valid JWT, so platform-level verification is
// not enough on its own — getUser() below is what establishes who is asking.
//
// Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, all
// provided by the runtime.
//
// Deploy WITH jwt verification, unlike the webhooks:
//   supabase functions deploy delete-account

import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/// Every table that holds something belonging to a person. All are keyed on
/// user_email, following sh_subscribers.
///
/// Adding a table elsewhere in the schema and forgetting it here would leave
/// orphaned rows behind after a deletion someone asked for, so this list is
/// the thing to update when the schema grows.
const USER_TABLES = [
  'sh_content_progress',
  'sh_affirmation_favourites',
  'sh_manifestation_responses',
  'sh_shadow_work_responses',
  'sh_subscribers',
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') {
    return json({ error: 'Use POST' }, 405);
  }

  const authorization = req.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) {
    return json({ error: 'Not signed in' }, 401);
  }

  // Resolve the caller with their own token, under RLS, before touching
  // anything with the service key.
  const asCaller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: caller, error: whoError } = await asCaller.auth.getUser();
  const user = caller?.user;
  if (whoError || !user?.email) {
    return json({ error: 'Not signed in' }, 401);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const removed: Record<string, number> = {};
  try {
    for (const table of USER_TABLES) {
      const { count, error } = await admin
        .from(table)
        .delete({ count: 'exact' })
        .eq('user_email', user.email);
      if (error) throw new Error(`${table}: ${error.message}`);
      removed[table] = count ?? 0;
    }

    // Last, so that a failure above leaves an account that can still sign in
    // and try again rather than orphaned rows nobody can reach.
    const { error: authError } = await admin.auth.admin.deleteUser(user.id);
    if (authError) throw new Error(`auth: ${authError.message}`);
  } catch (e) {
    console.error(`Deletion failed for ${user.email}:`, e);
    return json({ error: 'Deletion failed. Nothing was left half-done that ' +
      'you cannot retry — please try again, or email support.' }, 500);
  }

  console.log(`Deleted ${user.email}`, removed);
  return json({ deleted: true, rows: removed });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}
