export const COPY = {
  hub: {
    meta: {
      title: "Dashboard Overview · ENERGYbits",
      description: "Cross-channel summary of AI visibility, site readiness, SEO, and Google Ads performance."
    }
  },
  aeoAnalytics: {
    meta: {
      title: "AEO Analytics · ENERGYbits",
      description: "How AI search engines like ChatGPT, Gemini, and Perplexity see and cite ENERGYbits."
    },
    header: {
      eyebrow: "AI Search Visibility",
      title: "AEO Analytics"
    },
    notConfigured: {
      title: "AEO Analytics not configured",
      description:
        "This page needs AI visibility API credentials in your environment settings. Contact your developer or administrator."
    },
    loadError: "Unable to load AEO Analytics."
  },
  geoAnalytics: {
    meta: {
      title: "GEO Analytics · ENERGYbits",
      description: "How well energybits.com is technically set up for AI search engines to read and cite."
    },
    header: {
      eyebrow: "Site AI Readiness",
      title: "GEO Analytics",
      subtitle:
        "Technical and content signals that help AI engines understand, trust, and cite your site."
    },
    focusSubtitle: "These categories scored lowest — improving them will boost AI discoverability.",
    notConfigured: {
      title: "GEO Analytics not configured",
      description:
        "This page needs AI readiness API credentials in your environment settings. Contact your developer or administrator."
    },
    loadError: "Unable to load GEO Analytics."
  },
  overview: {
    meta: {
      title: "AI Search Visibility · ENERGYbits",
      description: "How AI search engines like ChatGPT, Gemini, and Perplexity see ENERGYbits."
    },
    header: {
      eyebrow: "AI Search Visibility",
      title: "How AI engines see ENERGYbits",
      analysisFrom: "Analysis from",
      liveData: "Live data",
      lastUpdated: "Updated"
    },
    notConfigured: {
      title: "Analytics not configured",
      description:
        "This dashboard needs API credentials in your environment settings. Contact your developer or administrator to connect the analytics engine."
    },
    noRuns: {
      title: "No analysis results yet",
      description:
        "Once your first AI visibility scan completes, results will appear here automatically.",
      actionLabel: "Learn more"
    },
    loadError: "Unable to load the visibility dashboard.",
    projectBanner: {
      eyebrow: "Brand overview",
      lastAnalysis: "Last analysis",
      nextScheduled: "Next scheduled analysis",
      lastRunCompleted: "Last scan ·"
    },
    geo: {
      eyebrow: "Site AI Readiness",
      title: "Site optimization score",
      subtitle:
        "How well energybits.com is technically set up for AI search engines to read and cite. Scored across four areas.",
      categories: {
        Accessibility: "How easily AI bots can crawl and read your pages",
        Technical: "Site speed, structured data, sitemap, and technical SEO basics",
        Authority: "Backlinks, brand mentions, and external trust signals",
        Content: "Content quality, depth, and topical authority signals"
      } as Record<string, string>
    },
    aeo: {
      sectionLabel: "AI Search Visibility",
      sectionTitle: "How AI search engines see ENERGYbits",
      sectionDescription:
        "How often ENERGYbits is mentioned and cited when people ask AI search engines about supplements."
    },
    atAGlance: {
      title: "At a glance",
      brandMentionLead: (pct: string) => `ENERGYbits is mentioned in ${pct} of AI answers about your category.`,
      brandInQuestions: (count: number, total: number) => `Brand appears in: ${count} of ${total} tracked questions`,
      strongestPlatform: (name: string, pct: string) => `Strongest platform: ${name} (${pct} citation share)`,
      opportunities: (count: number) => `Opportunities: ${count} questions where the brand has 0% mentions`,
      cta: "Scroll down for details, or check the Insights section for recommended next actions."
    },
    colorLegend: {
      title: "Color guide:",
      brand: "Brand (ENERGYbits)",
      competitor: "Competitors",
      neutral: "Third-party (neutral)",
      both: "Both mentioned",
      neither: "Neither mentioned"
    },
    citationsResponses: {
      title: "Citations & Responses",
      tooltip:
        "When people ask AI like ChatGPT, Gemini, or Perplexity about supplements, we measure how often ENERGYbits is mentioned, how often competitors are mentioned, and which third-party websites get cited as sources.",
      metrics: {
        totalCitations: {
          label: "Total Citations",
          description: "Times any web page was cited by AI search engines when answering questions about your category"
        },
        uniqueDomains: {
          label: "Unique Citation Domains",
          description: "Different websites the AI pulled answers from"
        },
        responses: {
          label: "Responses",
          description: "Full AI answers analyzed during this scan"
        },
        neutralShare: {
          label: "Neutral Share (Citations)",
          description:
            "Percentage of cited sources that are independent third-party sites (not your brand or competitors). Higher means more authority sources to win over."
        },
        competitorMentions: {
          label: "Competitor Mentions",
          description: "AI answers where a competitor brand was mentioned"
        }
      }
    },
    llmBreakdown: {
      title: "Performance by AI engine",
      subtitle: "How ENERGYbits performs on each major AI search platform",
      citationsTooltip: "Source URLs the AI cited",
      responsesTooltip: "Full answers from this AI",
      citationsSectionTooltip: "What kind of sources got cited",
      responsesSectionTooltip: "Which brands appeared in the AI's answer",
      citationBars: {
        brand: "Sources from your own website",
        competitor: "Sources from competitor websites",
        neutral: "Independent third-party sources"
      },
      responseBars: {
        brandOnly: "Only ENERGYbits was mentioned",
        compOnly: "Only a competitor was mentioned",
        both: "Both ENERGYbits and a competitor",
        neither: "Neither was mentioned by name"
      }
    },
    promptsGrid: {
      title: "Performance by question",
      subtitle: "How ENERGYbits ranks for each tracked customer question",
      emptyTitle: "No questions in this scan",
      emptyDescription: "Add customer questions to your brand profile and run an AI visibility scan to populate this section.",
      citationsTooltip: "Web sources cited for this question",
      responsesTooltip: "Full AI answers analyzed for this question"
    },
    neutralDomains: {
      title: "Third-party sources AI trusts",
      subtitle:
        "Independent websites the AI cited when answering supplement questions. These are placement and outreach opportunities.",
      emptyTitle: "No third-party sources yet",
      emptyDescription: "Independent sources will appear here once the scan records non-brand, non-competitor citations."
    },
    competitors: {
      title: "Competitor presence",
      subtitle: "How often each tracked competitor shows up in AI answers",
      citationShare: "Share of cited sources",
      responseShare: "Share of full answers",
      emptyTitle: "No competitor data yet",
      emptyDescription: "Add competitors to your brand profile and re-run the analysis to see share metrics here.",
      singleHelper: (name: string) =>
        `Only ${name} appeared in this scan. Add or refine competitor tracking in the brand profile to see more.`
    },
    keywordsTopics: {
      title: "Brand keywords & topics",
      subtitle: "Brand terms and content topics we track across AI search engines.",
      brandKeywords: "Brand names we track",
      contentTopics: "Topics we monitor",
      trackedCompetitors: "Competitors we monitor",
      noKeywords: "No brand keywords configured yet."
    },
    allPrompts: {
      title: "Tracked customer questions",
      subtitle: (active: number, total: number) =>
        `${active} customer questions we track across AI search engines. Each one is asked across multiple AI platforms during every analysis.`,
      columns: {
        question: "Customer question",
        category: "Category",
        status: "Status",
        audience: "Audience"
      }
    },
    insights: {
      title: "Insights & next actions",
      recommendedActions: "Recommended actions",
      brandVariants: "Brand names we track"
    },
    actions: {
      refresh: "Refresh",
      downloadReport: "Download report",
      selectScan: "Select analysis"
    },
    runStatus: {
      success: "completed",
      failed: "failed",
      running: "in progress"
    }
  },
  seoAnalytics: {
    meta: {
      title: "SEO Analytics · ENERGYbits",
      description: "Search performance, page engagement, and traffic source insights for ENERGYbits."
    },
    header: {
      eyebrow: "SEO Performance",
      title: "Search & Traffic Analytics",
      subtitle: "How ENERGYbits performs on Google Search and where visitors come from",
      dateRange: "Last 28 days",
      lastUpdated: "Updated"
    },
    notConfigured: {
      title: "SEO Analytics not configured",
      description: "Add Airtable table IDs to .env.local. See .env.example for required keys."
    },
    loadError: "Unable to load SEO Analytics data.",
    tabs: {
      search: "Search Performance",
      pages: "Page Performance",
      sources: "Traffic Sources"
    },
    metrics: {
      totalClicks: {
        label: "Total Clicks",
        tooltip: "Total visits to energybits.com from Google Search results in the last 28 days.",
        description: "Total visits from Google Search"
      },
      totalImpressions: {
        label: "Total Impressions",
        tooltip: "How often energybits.com appeared in Google search results, whether or not it was clicked.",
        description: "Times your site appeared in search results"
      },
      avgCTR: {
        label: "Average CTR",
        tooltip: "Click-through rate. Of all the times your site appeared in search, what percentage of users clicked.",
        description: "Click-through rate across all keywords"
      },
      avgPosition: {
        label: "Average Position",
        tooltip: "Average ranking in Google search results across all your keywords. Position 1 is best.",
        description: "Average ranking in Google Search"
      }
    },
    search: {
      topKeywords: {
        title: "Top performing keywords",
        subtitle: "Keywords driving the most clicks to your site"
      },
      positionDistribution: {
        title: "Where your keywords rank",
        subtitle: "How your keywords are distributed across Google's ranking positions"
      },
      critical: {
        title: "Critical opportunities",
        subtitle: "Top priority fixes that will move the needle fastest"
      },
      lowCTR: {
        title: "High visibility, low clicks",
        subtitle: "Keywords where your site appears often but few people click. Rewriting meta titles and descriptions will help."
      },
      page2: {
        title: "Page 2 opportunities (biggest wins)",
        subtitle: "Keywords ranking just below page 1. Small content improvements can push these to page 1."
      },
      priorityMix: {
        title: "Keyword priority mix"
      }
    },
    pages: {
      topPages: {
        title: "Most visited pages",
        subtitle: "Pages with the most traffic in the last 28 days"
      },
      pageTypes: {
        title: "Where your traffic goes",
        subtitle: "Breakdown by page type"
      },
      highEngagement: {
        title: "Best engaging pages",
        subtitle: "Pages keeping visitors interested. Use these as templates for other content."
      },
      poorPerformance: {
        title: "Pages needing attention",
        subtitle: "Pages with high traffic but low engagement. Worth investigating."
      },
      engagementVsBounce: {
        title: "Engagement vs bounce comparison"
      }
    },
    sources: {
      channelDonut: {
        title: "Where your visitors come from",
        subtitle: "Traffic by channel"
      },
      topSources: {
        title: "Top traffic sources",
        subtitle: "Specific websites and platforms sending you visitors"
      },
      sourceMedium: {
        title: "Source + medium breakdown"
      },
      engagementByChannel: {
        title: "Engagement quality by channel",
        subtitle: "Which traffic sources bring the most engaged visitors"
      }
    },
    empty: {
      critical: "No critical opportunities found. Great work!",
      lowCTR: "No high-impression, low-click keywords right now.",
      page2: "No page 2 opportunities in this period.",
      highEngagement: "No high-engagement pages matched the threshold yet.",
      poorPerformance: "No underperforming pages matched the threshold."
    }
  },
  googleAds: {
    meta: {
      title: "Google Ads Analytics · ENERGYbits",
      description: "Paid search and display performance across campaigns, ad groups, creatives, and keywords."
    },
    header: {
      eyebrow: "Paid Media Performance",
      title: "Google Ads Analytics",
      subtitle: "How your ad spend converts — from campaigns down to individual keywords and creatives",
      dateRange: "Latest sync",
      lastUpdated: "Updated"
    },
    notConfigured: {
      title: "Google Ads Analytics not configured",
      description: "Add Google Ads Airtable table IDs to .env.local. See .env.example for required keys."
    },
    loadError: "Unable to load Google Ads Analytics data.",
    tabs: {
      campaigns: "Campaigns",
      adGroups: "Ad Groups",
      creatives: "Creatives",
      keywords: "Keywords"
    },
    metrics: {
      totalSpend: {
        label: "Total Spend",
        tooltip: "Total amount spent on Google Ads across all synced campaigns in this period.",
        description: "Ad spend across all campaigns"
      },
      totalClicks: {
        label: "Total Clicks",
        tooltip: "Total clicks your ads received. Each click is a visitor sent to your site.",
        description: "Clicks on your ads"
      },
      overallRoas: {
        label: "Overall ROAS",
        tooltip: "Return on Ad Spend — how much revenue you earned for every dollar spent. Above 1x means profitable.",
        description: "Revenue per dollar spent"
      },
      totalConversions: {
        label: "Conversions",
        tooltip: "Total conversion actions tracked (purchases, sign-ups, etc.) from your ads.",
        description: "Tracked conversion actions"
      }
    },
    campaigns: {
      topSpend: {
        title: "Spend by campaign",
        subtitle: "Which campaigns are using the most budget"
      },
      channelType: {
        title: "Campaign types",
        subtitle: "How spend is split across Search, Performance Max, and Demand Gen"
      },
      impressionShare: {
        title: "Search impression share",
        subtitle: "How much of the available search market your ads are capturing"
      },
      topRoas: {
        title: "Best ROAS campaigns",
        subtitle: "Campaigns generating the most revenue per dollar spent"
      },
      performanceTable: {
        title: "All campaigns",
        subtitle: "Full campaign-level performance breakdown"
      }
    },
    adGroups: {
      topSpend: {
        title: "Spend by ad group",
        subtitle: "Ad groups driving the most spend within their campaigns"
      },
      performanceTable: {
        title: "Ad group performance",
        subtitle: "Detailed metrics for every ad group"
      }
    },
    creatives: {
      adType: {
        title: "Ad format mix",
        subtitle: "Performance split by ad type (Responsive Search, Display, etc.)"
      },
      topPerformers: {
        title: "Top performing ads",
        subtitle: "Individual ads driving the most clicks and conversions"
      },
      performanceTable: {
        title: "All ad creatives",
        subtitle: "Full creative-level performance data"
      }
    },
    keywords: {
      matchType: {
        title: "Match type breakdown",
        subtitle: "How spend is distributed across Exact, Phrase, and Broad match keywords"
      },
      topKeywords: {
        title: "Top keywords by spend",
        subtitle: "Keywords consuming the most budget"
      },
      topRoas: {
        title: "Highest ROAS keywords",
        subtitle: "Keywords delivering the best return on spend"
      },
      performanceTable: {
        title: "All keywords",
        subtitle: "Full keyword-level performance data"
      }
    },
    empty: {
      campaigns: "No campaign data synced yet.",
      adGroups: "No ad group data synced yet.",
      creatives: "No creative data synced yet.",
      keywords: "No keyword data synced yet."
    }
  }
} as const;

/** Rewrites upstream phrasing for brand-facing UI without changing backend logic. */
export function sanitizeOverviewText(text: string): string {
  return text
    .replace(/Re-run Cairrot/gi, "Re-run the analysis")
    .replace(/Cairrot/gi, "the analytics engine")
    .replace(/visibility run/gi, "AI visibility scan")
    .replace(/\bLLM\b/g, "AI")
    .replace(/\bLLMs\b/g, "AI engines");
}
