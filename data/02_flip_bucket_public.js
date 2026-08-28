// Flip 'sh-audio' bucket to public for the M2 demo, so the web preview can
// stream audio without requiring auth. Once Supabase Auth is wired in a
// later M2 step, we lock the bucket back down and switch to signed URLs.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

(async () => {
  const { data: existing } = await supabase.storage.getBucket('sh-audio');
  if (!existing) {
    console.error("Bucket 'sh-audio' does not exist.");
    process.exit(1);
  }
  console.log(`Before: public=${existing.public}`);

  const { error } = await supabase.storage.updateBucket('sh-audio', {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ['audio/mpeg'],
  });
  if (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }

  const { data: after } = await supabase.storage.getBucket('sh-audio');
  console.log(`After:  public=${after.public}`);

  const testPath = 'audio/15.mp3';
  const { data: urlData } = supabase.storage.from('sh-audio').getPublicUrl(testPath);
  console.log(`\nTest URL for ${testPath}:`);
  console.log(`  ${urlData.publicUrl}`);
})();
