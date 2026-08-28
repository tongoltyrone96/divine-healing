// Create the 'sh-audio' Storage bucket. Service-role key can do this via
// the Storage Admin API. Safe to re-run (checks if it already exists).
//
// Run:
//   $env:SUPABASE_URL="..."
//   $env:SUPABASE_SERVICE_ROLE_KEY="..."
//   node 01_create_bucket.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const BUCKET = 'sh-audio';

(async () => {
  const { data: existing } = await supabase.storage.getBucket(BUCKET);
  if (existing) {
    console.log(`Bucket '${BUCKET}' already exists. public=${existing.public}, size_limit=${existing.file_size_limit ?? 'unlimited'}`);
    return;
  }

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ['audio/mpeg'],
  });

  if (error) {
    console.error(`Failed to create bucket: ${error.message}`);
    process.exit(1);
  }
  console.log(`Created bucket '${BUCKET}' (private, 50 MB limit, audio/mpeg)`);
})();
