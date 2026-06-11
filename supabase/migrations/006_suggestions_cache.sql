-- Cache for AI-generated ad suggestions.
-- Keyed by (ad_id, platform, cache_date) so each ad gets at most one
-- AI call per day. The cache row is upserted on write and read before
-- calling Claude — graceful fallback if the table doesn't exist yet.

CREATE TABLE IF NOT EXISTS ad_suggestions_cache (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id       text        NOT NULL,
  platform    text        NOT NULL CHECK (platform IN ('meta', 'google')),
  cache_date  date        NOT NULL DEFAULT CURRENT_DATE,
  suggestions jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz DEFAULT now(),

  UNIQUE (ad_id, platform, cache_date)
);

CREATE INDEX IF NOT EXISTS idx_suggestions_cache_lookup
  ON ad_suggestions_cache (ad_id, platform, cache_date);
