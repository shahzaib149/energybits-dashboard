/**
 * Human-readable Airtable base and table names.
 * Base IDs are resolved at runtime via the Meta API (see meta/resolve-base.ts).
 */

export const AIRTABLE_BASES = {
  seo: {
    name: "ENERGYbits SEO & AI Automation System",
    /** Fallback when Meta API listing is unavailable (not a secret). */
    id: "appcQFPrv0jb1uK7t",
    tables: {
      seoTracking: "SEO Tracking",
      seoRuns: "SEO Runs",
      ga4PagePerformance: "GA4 Page Performance",
      ga4TrafficSources: "GA4 Traffic Sources",
      ga4Runs: "GA4 Runs",
      blogPipeline: "Blog Pipeline",
      keywords: "Keywords",
      aeoPromptOpportunities: "AEO Prompt Opportunities",
      productPages: "Product Pages",
      repurposedContent: "Repurposed Content",
      aeoTracking: "AEO Tracking",
      monthlyReports: "Monthly Reports"
    }
  },
  googleAds: {
    name: "Google Ads Daily Performance",
    id: "appisc4ZVeCsiv4Lm",
    tables: {
      campaigns: "Google Ads Campaign Analytics",
      adGroups: "Google Ads Ad Group Analytics",
      creatives: "Google Ads Ad Creative Analytics",
      keywords: "Google Ads Keyword Performance"
    }
  },
  criteo: {
    name: "Criteo Analytics",
    id: "appZVYGQx7fnNfpLZ",
    tables: {
      daily: "Criteo Daily Analytics",
      overall: "Criteo Overall Analytics"
    }
  },
  vibe: {
    name: "Vibe.co Analytics",
    id: "appGay0sWO3KEJcqg",
    tables: {
      analytics: "Vibe.co Analytics"
    }
  },
  klaviyo: {
    name: "Klaviyo Analytics",
    id: "appQ9v3W1WyXg451L",
    tables: {
      analytics: "Klaviyo Analytics"
    }
  },
  meta: {
    name: "Metadata analysis",
    id: "appT4Zh37Im2Ks4Lh",
    tables: {
      campaigns: "Meta Campaign Analytics",
      adInsights: "facebook_ads_insights"
    }
  }
} as const;

export type AirtableBaseKey = keyof typeof AIRTABLE_BASES;
