-- Make ad_suggestions_cache persistent (no daily expiry).
-- Old unique key was (ad_id, platform, cache_date) — one entry per day.
-- New key is (ad_id, platform) — one entry per ad, updated on refresh.
-- This eliminates repeat AI calls across days for the same ad.

-- 1. Add generated_at column to record actual generation time
ALTER TABLE ad_suggestions_cache
  ADD COLUMN IF NOT EXISTS generated_at timestamptz DEFAULT now();

-- 2. Back-fill generated_at from created_at for existing rows
UPDATE ad_suggestions_cache
   SET generated_at = created_at
 WHERE generated_at IS NULL;

-- 3. Keep only the latest row per (ad_id, platform) before adding new constraint
DELETE FROM ad_suggestions_cache a
 USING ad_suggestions_cache b
 WHERE a.ad_id = b.ad_id
   AND a.platform = b.platform
   AND a.created_at < b.created_at;

-- 4. Drop old date-scoped unique constraint + index
ALTER TABLE ad_suggestions_cache
  DROP CONSTRAINT IF EXISTS ad_suggestions_cache_ad_id_platform_cache_date_key;

DROP INDEX IF EXISTS idx_suggestions_cache_lookup;

-- 5. Add persistent unique constraint and index
ALTER TABLE ad_suggestions_cache
  ADD CONSTRAINT ad_suggestions_cache_ad_id_platform_key UNIQUE (ad_id, platform);

CREATE INDEX IF NOT EXISTS idx_suggestions_cache_lookup
  ON ad_suggestions_cache (ad_id, platform);
