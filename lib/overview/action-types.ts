export type ActionSource = "seo" | "ga4-bounce" | "google-ads-waste" | "google-ads-roas";

export interface ActionItem {
  actionKey: string;
  source: ActionSource;
  headline: string;
  context: string;
  href: string;
  /** SEO record id when source is seo */
  recordId?: string;
  impressions?: number;
  sessions?: number;
  cost?: number;
  score: number;
}

export interface TopActionsResult {
  actions: ActionItem[];
  errors: string[];
}
