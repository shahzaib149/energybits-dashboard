export const COPY = {
  auth: {
    login: {
      emailLabel: "Email",
      passwordLabel: "Password",
      emailPlaceholder: "you@company.com",
      passwordPlaceholder: "Your password",
      helperText:
        "Enter the email and password from your invite. If you received a magic link, open it first to set your password, then sign in here.",
      submitLabel: "Sign in to dashboard",
      welcomeTitle: "Welcome back",
      welcomeSubtitle: "Enter your email and password to continue.",
      authCallbackError: "Sign-in failed. Try again or use the link from your invite email.",
      forgotPasswordLink: "Forgot password?",
      backToSignIn: "Back to sign in"
    },
    forgotPassword: {
      title: "Reset your password",
      subtitle: "Enter your email and we will send you a link to choose a new password.",
      emailLabel: "Email",
      submitLabel: "Send reset link",
      success: "Check your email for a password reset link. It may take a minute to arrive.",
      submitFailed: "Could not send reset email. Try again or contact your administrator.",
      linkExpired: "That reset link expired or is invalid. Enter your email to request a new one."
    },
    resetPassword: {
      title: "Choose a new password",
      subtitle: "Enter a new password for your account.",
      passwordLabel: "New password",
      confirmLabel: "Confirm password",
      submitLabel: "Update password",
      submitFailed: "Could not update password. Try again or request a new reset link.",
      success: "Password updated. You can sign in with your new password.",
      mismatch: "Passwords do not match.",
      tooShort: "Password must be at least 8 characters.",
      missingSession: "This reset link is invalid or expired. Request a new one.",
      requestNewLink: "Request a new reset link"
    },
    notProvisioned: {
      title: "Account not provisioned",
      description:
        "Your sign-in worked, but this dashboard account has not been set up yet. Contact your administrator to get access.",
      signOutLabel: "Sign out",
      adminHint: "Need help?",
      contactAdmin: "Contact admin"
    },
    auditLog: {
      metaTitle: "Audit Log · ENERGYbits",
      eyebrow: "Admin",
      title: "Audit Log",
      description:
        "Activity log of all user actions on this dashboard. Visible to admins only.",
      loadError: "Unable to load audit log.",
      empty: "No audit events yet.",
      viewMeta: "View details",
      hideMeta: "Hide",
      filters: {
        action: "Action",
        user: "User",
        from: "From",
        to: "To",
        all: "All",
        apply: "Apply",
        reset: "Reset"
      },
      columns: {
        when: "When",
        who: "Who",
        action: "Action",
        resource: "Resource",
        metadata: "Details"
      }
    }
  },
  hub: {
    meta: {
      title: "Dashboard Overview · ENERGYbits",
      description: "Cross-channel summary of AI visibility, site readiness, SEO, and Google Ads performance."
    },
    intelligenceGaps: {
      title: "Intelligence Gaps",
      subtitle: "Cross-pillar opportunities from SEO, AEO, and GEO data — ready for AI-driven recommendations.",
      critical: "Critical",
      high: "High",
      medium: "Medium",
      downloadButton: "Download Full Report",
      downloading: "Generating report…",
      downloadError: "Failed to generate intelligence report. Try again.",
      triggerButton: "Trigger AI",
      triggerError: "Unable to generate recommendations. Try again.",
      triggerNotConfigured: "Recommendation automation is not configured.",
      triggerTooltip: "Send the combined intelligence report to generate keyword and blog recommendations",
      notConfigured: "Connect SEO Analytics and Cairrot to generate combined intelligence reports.",
      triggerAI: {
        button: "Trigger AI",
        loading: "Generating recommendations…",
        success:
          "Recommendations generating. Check Keywords and AEO Prompts pages in 2–3 minutes.",
        error: "Failed to trigger recommendations. Please try again.",
        networkError:
          "Could not reach Make.com. Check your connection or VPN, wait a moment, and try again.",
        cooldown: "Please wait before triggering again."
      }
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
    topActions: {
      title: "🎯 This week's top actions",
      subtitle: "The highest-priority items across your channels right now",
      emptyState: "No critical actions this week. Your dashboard is healthy across all channels.",
      markHandled: "Mark as handled",
      markHandledTooltip: "Hide this action once you've addressed it. SEO items are marked Done in Airtable.",
      viewDetails: "View details",
      panelTooltip:
        "These are the highest-impact items to address this week, surfaced automatically from your SEO, traffic, and ad data."
    },
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
      description: "Add AIRTABLE_API_KEY to .env.local. See .env.example."
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
    },
    actionStatus: {
      label: "Action Status",
      tooltip: "Track where you are on fixing each opportunity. Updates are saved automatically.",
      filters: {
        all: "All",
        notStarted: "Not Started",
        inProgress: "In Progress",
        done: "Done",
        ignored: "Ignored"
      }
    }
  },
  blogPipeline: {
    meta: {
      title: "Blog Pipeline · ENERGYbits",
      description: "Track where each blog topic is in the production process."
    },
    title: "Blog pipeline",
    subtitle: "Where each blog topic is in the production process",
    statusCounts: "Creating ({creating}) · Ready ({ready}) · Drafting ({drafting}) · Review ({review}) · Published ({published})",
    empty: "No blog topics in the pipeline yet.",
    refresh: "Refresh",
    refreshing: "Refreshing…",
    creatingHint: "Blog is being created…",
    editTopic: "Edit topic",
    editTooltip: "Edit this topic before AI starts drafting it.",
    deleteTopic: "Delete topic",
    deleteTooltip: "Remove this topic from the queue. Only works before drafting starts.",
    deleteConfirm: "Delete \"{title}\"? This cannot be undone.",
    cannotEdit: "Can only edit topics that haven't started drafting yet.",
    saveTopic: "Save changes",
    cancel: "Cancel",
    topicUpdated: "Topic updated",
    topicDeleted: "Topic deleted",
    publish: {
      button: "Publish",
      publishing: "Publishing…",
      published: "Publish triggered",
      tooltip: "Send this blog to Make.com for publishing.",
      confirm: "Publish \"{title}\"? This will trigger the publishing workflow.",
      success: "Publish workflow triggered.",
      failed: "Could not trigger publish. Please try again."
    },
    previewEdit: {
      hint: "Click the title, description, or article body to edit. Changes save automatically (title & description) or when you click Save on the body.",
      clickBody: "Click to edit article content",
      editingBody: "Edit article content",
      saveBody: "Save content",
      saving: "Saving…",
      saved: "Saved",
      saveFailed: "Save failed",
      bodySavedAsHuman: "Content saved to Human Edited Draft",
      addBody: "Click to add article content",
      noBody: "No draft content available for this record."
    },
    loadError: "Unable to load blog pipeline.",
    columns: {
      title: "Blog Title",
      status: "Status",
      submittedBy: "Submitted by",
      submittedAt: "Submitted",
      updatedAt: "Last updated",
      actions: "Actions"
    },
    filters: {
      all: "All statuses"
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
      description: "Add AIRTABLE_API_KEY to .env.local. See .env.example."
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
  },
  criteoAds: {
    meta: {
      title: "Criteo Ads Analytics · ENERGYbits",
      description: "Retargeting and display performance across Criteo campaigns, ads, and daily metrics."
    },
    header: {
      eyebrow: "Retargeting Performance",
      title: "Criteo Ads Analytics",
      subtitle: "Campaign, ad, and cost-performance metrics from your Criteo advertising data",
      lastUpdated: "Latest day"
    },
    notConfigured: {
      title: "Criteo Ads Analytics not configured",
      description: "Add AIRTABLE_API_KEY to .env.local. See .env.example."
    },
    loadError: "Unable to load Criteo Ads Analytics data.",
    tabs: {
      overview: "Overview",
      campaigns: "Campaigns",
      ads: "Ads",
      daily: "Daily"
    },
    metrics: {
      totalSpend: {
        label: "Advertiser Cost",
        tooltip: "Total amount spent on Criteo ads in the selected date range.",
        description: "Ad spend across all campaigns"
      },
      totalClicks: {
        label: "Total Clicks",
        tooltip: "Total clicks your Criteo ads received.",
        description: "Clicks on your ads"
      },
      totalDisplays: {
        label: "Total Displays",
        tooltip: "Total ad impressions (displays) served.",
        description: "Impressions served"
      },
      overallRoas: {
        label: "Overall ROAS",
        tooltip: "Return on Ad Spend — revenue generated per dollar spent.",
        description: "Revenue per dollar spent"
      },
      totalRevenue: {
        label: "Revenue Generated",
        tooltip: "Total revenue attributed to Criteo campaigns.",
        description: "Attributed revenue"
      }
    },
    overview: {
      summary: {
        title: "All-time summary",
        subtitle: "Overall performance from Criteo Overall Analytics",
        empty: "No overall summary synced yet.",
        reach: "Reach",
        frequency: "Frequency",
        ctr: "CTR",
        cpc: "CPC",
        ecpm: "eCPM",
        sales: "Sales",
        revenue: "Revenue",
        roas: "ROAS",
        totals: "Lifetime totals"
      },
      spendTrend: {
        title: "Daily spend trend",
        subtitle: "Advertiser cost over time in the selected range"
      },
      topCampaigns: {
        title: "Top campaigns by spend",
        subtitle: "Campaigns using the most budget"
      },
      campaignBreakdown: {
        title: "Spend by campaign",
        subtitle: "How budget is distributed across campaigns"
      }
    },
    campaigns: {
      performanceTable: {
        title: "Campaign performance",
        subtitle: "Aggregated metrics by campaign for the selected date range"
      },
      topRoas: {
        title: "Best ROAS campaigns",
        subtitle: "Campaigns generating the most revenue per dollar spent",
        empty: "Not enough spend data to rank campaigns by ROAS yet."
      }
    },
    ads: {
      topSpend: {
        title: "Top ads by spend",
        subtitle: "Individual ads driving the most budget"
      },
      performanceTable: {
        title: "Ad performance",
        subtitle: "Aggregated metrics by ad for the selected date range"
      },
      topRoas: {
        title: "Highest ROAS ads",
        subtitle: "Ads delivering the best return on spend",
        empty: "Not enough spend data to rank ads by ROAS yet."
      }
    },
    daily: {
      performanceTable: {
        title: "Daily analytics",
        subtitle: "Granular daily campaign and ad performance"
      }
    }
  },
  vibeAds: {
    meta: {
      title: "Vibe.co Analytics · ENERGYbits",
      description: "Connected TV and streaming campaign performance from Vibe.co."
    },
    header: {
      eyebrow: "Connected TV Performance",
      title: "Vibe.co Analytics",
      subtitle: "Campaign, channel, and creative performance across screens and regions",
      lastUpdated: "Latest date"
    },
    notConfigured: {
      title: "Vibe.co Analytics not configured",
      description: "Add AIRTABLE_API_KEY to .env.local. See .env.example."
    },
    loadError: "Unable to load Vibe.co Analytics data.",
    tabs: {
      overview: "Overview",
      campaigns: "Campaigns",
      channels: "Channels",
      creatives: "Creatives",
      detail: "Detail"
    },
    metrics: {
      spend: { label: "Total Spend", tooltip: "Total ad spend in the selected range.", description: "Media spend" },
      impressions: { label: "Impressions", tooltip: "Total ad impressions served.", description: "Ads served" },
      completedViews: { label: "Completed Views", tooltip: "Views watched to completion.", description: "Full ad views" },
      households: { label: "Households", tooltip: "Unique households reached.", description: "Reach (households)" },
      roas: { label: "Avg ROAS", tooltip: "Average return on ad spend.", description: "Return on spend" }
    },
    overview: {
      spendTrend: { title: "Daily spend trend", subtitle: "Spend over time in the selected range" },
      topCampaigns: { title: "Top campaigns by spend", subtitle: "Campaigns using the most budget" },
      channelBreakdown: { title: "Spend by channel", subtitle: "Budget split across channels" }
    },
    campaigns: { table: { title: "Campaign performance", subtitle: "Aggregated by campaign" } },
    channels: { table: { title: "Channel performance", subtitle: "Aggregated by channel" } },
    creatives: { table: { title: "Creative performance", subtitle: "Aggregated by creative" } },
    detail: { table: { title: "Row-level analytics", subtitle: "All impression rows for the selected range" } },
    topRoas: { title: "Best ROAS", subtitle: "Top performers by return on spend" }
  },
  metaAnalytics: {
    meta: {
      title: "Meta Analytics · ENERGYbits",
      description: "Facebook and Instagram advertising performance from Meta Ads."
    },
    header: {
      eyebrow: "Paid Social Performance",
      title: "Meta Analytics",
      subtitle: "Campaign and ad-level performance across Facebook and Instagram advertising",
      lastUpdated: "Latest date"
    },
    notConfigured: {
      title: "Meta Analytics not configured",
      description: "Add AIRTABLE_API_KEY to .env.local. See .env.example."
    },
    loadError: "Unable to load Meta Analytics data.",
    tabs: {
      overview: "Overview",
      campaigns: "Campaigns",
      ads: "Ads",
      detail: "Ad Insights"
    },
    metrics: {
      totalSpend: {
        label: "Total Spend",
        tooltip: "Total Meta ad spend in the selected date range.",
        description: "Campaign spend"
      },
      impressions: {
        label: "Impressions",
        tooltip: "Total ad impressions served.",
        description: "Ads served"
      },
      clicks: {
        label: "Clicks",
        tooltip: "Total clicks on your Meta ads.",
        description: "Ad clicks"
      },
      reach: {
        label: "Reach",
        tooltip: "Unique people who saw your ads.",
        description: "Unique reach"
      },
      ctr: {
        label: "Avg CTR",
        tooltip: "Click-through rate weighted by impressions.",
        description: "Engagement rate"
      },
      cpc: {
        label: "Avg CPC",
        tooltip: "Average cost per click across campaigns.",
        description: "Cost per click"
      }
    },
    overview: {
      spendTrend: {
        title: "Daily spend trend",
        subtitle: "Campaign spend over time in the selected range"
      },
      topCampaigns: {
        title: "Top campaigns by spend",
        subtitle: "Campaigns using the most budget"
      },
      spendBreakdown: {
        title: "Spend distribution",
        subtitle: "Share of budget across top campaigns"
      }
    },
    campaigns: {
      table: {
        title: "Campaign performance",
        subtitle: "Aggregated metrics by campaign for the selected date range"
      }
    },
    ads: {
      table: {
        title: "Ad performance",
        subtitle: "Aggregated metrics by individual ad"
      }
    },
    detail: {
      table: {
        title: "Ad insights detail",
        subtitle: "Granular ad-level rows from Facebook Ads API metrics"
      }
    }
  },
  klaviyo: {
    meta: {
      title: "Klaviyo Analytics · ENERGYbits",
      description: "Email marketing campaign engagement and revenue metrics from Klaviyo."
    },
    header: {
      eyebrow: "Email Marketing Performance",
      title: "Klaviyo Analytics",
      subtitle: "Track email engagement, orders, and revenue across Klaviyo campaign metrics",
      lastUpdated: "Latest date"
    },
    notConfigured: {
      title: "Klaviyo Analytics not configured",
      description: "Add AIRTABLE_API_KEY to .env.local. See .env.example."
    },
    loadError: "Unable to load Klaviyo Analytics data.",
    tabs: {
      overview: "Overview",
      metrics: "Metrics",
      records: "Records"
    },
    metrics: {
      totalEvents: {
        label: "Total Events",
        tooltip: "Sum of all event counts in the selected range.",
        description: "All tracked events"
      },
      uniqueContacts: {
        label: "Unique Contacts",
        tooltip: "Sum of unique contact counts across metrics and dates.",
        description: "Reach (aggregated)"
      },
      orderRevenue: {
        label: "Order Revenue",
        tooltip: "Total order value attributed to Klaviyo metrics.",
        description: "Revenue from orders"
      },
      metricTypes: {
        label: "Metric Types",
        tooltip: "Number of distinct Klaviyo metric types in the range.",
        description: "Distinct metrics"
      }
    },
    overview: {
      eventsTrend: { title: "Daily event trend", subtitle: "Total events and unique contacts over time" },
      topMetrics: { title: "Top metrics by events", subtitle: "Highest-volume Klaviyo metrics in the range" },
      metricBreakdown: { title: "Events by metric", subtitle: "Share of total events across metric types" },
      revenueTrend: { title: "Daily order revenue", subtitle: "Order value over time" }
    },
    metricsTab: { table: { title: "Metric performance", subtitle: "Aggregated totals by metric name" } },
    records: { table: { title: "Row-level metrics", subtitle: "All Klaviyo analytics rows for the selected range" } }
  },
  dateRange: {
    label: "Date range",
    tooltip:
      "Choose the time period to analyze. Default is the last 28 days, matching Google Analytics standard.",
    presets: {
      "7d": "Last 7 days",
      "28d": "Last 28 days",
      "90d": "Last 90 days",
      "12m": "Last 12 months",
      custom: "Custom range..."
    },
    customPickerTitle: "Select date range",
    apply: "Apply",
    cancel: "Cancel",
    invalidRange: "Invalid date range. Showing last 28 days.",
    farRangeWarning: "Data older than 16 months may be incomplete.",
    farRangeWarningTooltip:
      "Data older than 16 months may not be complete due to Google Search Console retention limits.",
    emptyForRange: "No data for this date range. Try a wider window."
  },
  csvExport: {
    button: "Export CSV",
    exporting: "Exporting...",
    tooltip: "Download this table as a CSV file. Works in Excel, Google Sheets, or any spreadsheet tool.",
    noData: "No data to export.",
    largeWarning: "Export {count} rows? Large exports may take a moment.",
    blocked: "Too many rows. Filter the table first.",
    success: "Export downloaded.",
    failed: "Export failed. Please try again."
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
