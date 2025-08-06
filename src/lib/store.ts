import { writable } from "svelte/store";

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000;

// TypeScript interfaces for feature flag management
export interface FeatureFlag {
  enabled: boolean;
  name: string;
  description?: string;
  category: 'dashboard' | 'widget' | 'action' | 'news' | 'component';
  defaultValue: boolean;
  userOverride?: boolean;
}

export interface FeatureFlags {
  [key: string]: FeatureFlag;
}

export interface UserFeaturePreferences {
  [key: string]: boolean;
}

// Feature flag validation functions
export const validateFeatureFlag = (flag: FeatureFlag): boolean => {
  return (
    typeof flag.enabled === 'boolean' &&
    typeof flag.name === 'string' &&
    typeof flag.category === 'string' &&
    typeof flag.defaultValue === 'boolean'
  );
};

export const isFeatureEnabled = (flagName: string, flags: FeatureFlags): boolean => {
  const flag = flags[flagName];
  if (!flag) return false;
  
  // Check for user override first
  if (flag.userOverride !== undefined) {
    return flag.userOverride;
  }
  
  return flag.enabled;
};

// Feature flag change detection
export const hasFeatureFlagChanged = (oldFlags: FeatureFlags, newFlags: FeatureFlags): boolean => {
  const oldKeys = Object.keys(oldFlags);
  const newKeys = Object.keys(newFlags);
  
  if (oldKeys.length !== newKeys.length) return true;
  
  return oldKeys.some(key => {
    const oldFlag = oldFlags[key];
    const newFlag = newFlags[key];
    return !newFlag || oldFlag.enabled !== newFlag.enabled || oldFlag.userOverride !== newFlag.userOverride;
  });
};

export const clientSideCache = writable<Record<string, Record<string, { data: any; timestamp: number }>>>({});

// Function to set cache data for a specific key
export const setCache = (key: string, data: any, name: string) => {
  const timestamp = Date.now();
  clientSideCache.update((cache) => {
    return {
      ...cache,
      [key]: {
        ...cache[key],
        [name]: { data, timestamp },
      },
    };
  });
};

// Function to get cache data for a specific key
export const getCache = (key: string, name: string) => {
  let cacheData: any;
  clientSideCache.subscribe((cache) => {
    const entry = cache[key]?.[name];
    if (entry) {
      const { data, timestamp } = entry;
      // Check if the cache has expired
      if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
        cacheData = data;
      } else {
        // Cache has expired, so return undefined to fetch new data
        cacheData = undefined;
      }
    }
  });
  return cacheData;
};

// Function to clear the entire cache
export const clearCache = () => {
  clientSideCache.set({});
};

// Feature flag management stores
export const featureFlags = writable<FeatureFlags>({
  // Dashboard widgets
  fundamentalAnalysisWidget: {
    enabled: true,
    name: 'Fundamental Analysis Widget',
    description: 'Shows fundamental analysis data',
    category: 'widget',
    defaultValue: true
  },
  priceAnalysisWidget: {
    enabled: true,
    name: 'Price Analysis Widget',
    description: 'Displays price analysis charts',
    category: 'widget',
    defaultValue: true
  },
  revenueSegmentationWidget: {
    enabled: true,
    name: 'Revenue Segmentation Widget',
    description: 'Shows revenue breakdown by segment',
    category: 'widget',
    defaultValue: true
  },
  trendAnalysisWidget: {
    enabled: true,
    name: 'Trend Analysis Widget',
    description: 'Displays trend analysis data',
    category: 'widget',
    defaultValue: true
  },
  shareStatisticsWidget: {
    enabled: true,
    name: 'Share Statistics Widget',
    description: 'Shows share statistics',
    category: 'widget',
    defaultValue: true
  },
  shareholderWidget: {
    enabled: true,
    name: 'Shareholder Widget',
    description: 'Displays shareholder information',
    category: 'widget',
    defaultValue: true
  },
  retailVolumeWidget: {
    enabled: true,
    name: 'Retail Volume Widget',
    description: 'Shows retail volume data',
    category: 'widget',
    defaultValue: true
  },
  darkPoolWidget: {
    enabled: true,
    name: 'Dark Pool Widget',
    description: 'Displays dark pool flow data',
    category: 'widget',
    defaultValue: true
  },
  enterpriseWidget: {
    enabled: true,
    name: 'Enterprise Widget',
    description: 'Shows enterprise value data',
    category: 'widget',
    defaultValue: true
  },
  varWidget: {
    enabled: true,
    name: 'VaR Widget',
    description: 'Displays Value at Risk data',
    category: 'widget',
    defaultValue: true
  },
  sentimentWidget: {
    enabled: true,
    name: 'Sentiment Widget',
    description: 'Shows sentiment analysis',
    category: 'widget',
    defaultValue: true
  },
  analystEstimateWidget: {
    enabled: true,
    name: 'Analyst Estimate Widget',
    description: 'Displays analyst estimates',
    category: 'widget',
    defaultValue: true
  },
  marketMakerWidget: {
    enabled: true,
    name: 'Market Maker Widget',
    description: 'Shows market maker data',
    category: 'widget',
    defaultValue: true
  },
  optionWidget: {
    enabled: true,
    name: 'Options Widget',
    description: 'Displays options data',
    category: 'widget',
    defaultValue: true
  },
  clinicalTrialWidget: {
    enabled: true,
    name: 'Clinical Trial Widget',
    description: 'Shows clinical trial information',
    category: 'widget',
    defaultValue: true
  },
  failToDeliverWidget: {
    enabled: true,
    name: 'Fail to Deliver Widget',
    description: 'Displays fail to deliver data',
    category: 'widget',
    defaultValue: true
  },
  borrowedShareWidget: {
    enabled: true,
    name: 'Borrowed Share Widget',
    description: 'Shows borrowed share data',
    category: 'widget',
    defaultValue: true
  },
  impliedVolatilityWidget: {
    enabled: true,
    name: 'Implied Volatility Widget',
    description: 'Displays implied volatility data',
    category: 'widget',
    defaultValue: true
  },
  optionsNetFlowWidget: {
    enabled: true,
    name: 'Options Net Flow Widget',
    description: 'Shows options net flow data',
    category: 'widget',
    defaultValue: true
  },
  governmentContractWidget: {
    enabled: true,
    name: 'Government Contract Widget',
    description: 'Displays government contract data',
    category: 'widget',
    defaultValue: true
  },
  analystInsightWidget: {
    enabled: true,
    name: 'Analyst Insight Widget',
    description: 'Shows analyst insights',
    category: 'widget',
    defaultValue: true
  },
  swapWidget: {
    enabled: true,
    name: 'Swap Widget',
    description: 'Displays swap data',
    category: 'widget',
    defaultValue: true
  },
  taRatingWidget: {
    enabled: true,
    name: 'Technical Analysis Rating Widget',
    description: 'Shows technical analysis ratings',
    category: 'widget',
    defaultValue: true
  },
  dcfWidget: {
    enabled: true,
    name: 'DCF Widget',
    description: 'Displays discounted cash flow data',
    category: 'widget',
    defaultValue: true
  },
  correlationWidget: {
    enabled: true,
    name: 'Correlation Widget',
    description: 'Shows correlation data',
    category: 'widget',
    defaultValue: true
  },
  corporateLobbyingWidget: {
    enabled: true,
    name: 'Corporate Lobbying Widget',
    description: 'Displays corporate lobbying data',
    category: 'widget',
    defaultValue: true
  },
  fomcImpactWidget: {
    enabled: true,
    name: 'FOMC Impact Widget',
    description: 'Shows FOMC impact data',
    category: 'widget',
    defaultValue: true
  },
  scoreWidget: {
    enabled: true,
    name: 'Score Widget',
    description: 'Displays scoring data',
    category: 'widget',
    defaultValue: true
  },
  
  // Action cards
  addToWatchlistAction: {
    enabled: true,
    name: 'Add to Watchlist Action',
    description: 'Allows adding stocks to watchlist',
    category: 'action',
    defaultValue: true
  },
  priceAlertAction: {
    enabled: true,
    name: 'Price Alert Action',
    description: 'Allows setting price alerts',
    category: 'action',
    defaultValue: true
  },
  shareAction: {
    enabled: true,
    name: 'Share Action',
    description: 'Allows sharing stock data',
    category: 'action',
    defaultValue: true
  },
  
  // News sources
  marketNewsSource: {
    enabled: true,
    name: 'Market News Source',
    description: 'Enables market news feed',
    category: 'news',
    defaultValue: true
  },
  analystNewsSource: {
    enabled: true,
    name: 'Analyst News Source',
    description: 'Enables analyst news feed',
    category: 'news',
    defaultValue: true
  },
  socialNewsSource: {
    enabled: true,
    name: 'Social News Source',
    description: 'Enables social media news feed',
    category: 'news',
    defaultValue: true
  },
  
  // Dashboard widgets
  marketMoverWidget: {
    enabled: true,
    name: 'Market Mover Widget',
    description: 'Displays market movers and gainers/losers',
    category: 'widget',
    defaultValue: true
  },
  wiimWidget: {
    enabled: true,
    name: 'WIIM Widget',
    description: 'Displays WIIM (What Is It Moving) data',
    category: 'widget',
    defaultValue: true
  },
  analystReportWidget: {
    enabled: true,
    name: 'Analyst Report Widget',
    description: 'Displays analyst reports and insights',
    category: 'widget',
    defaultValue: true
  },
  upcomingEarningsWidget: {
    enabled: true,
    name: 'Upcoming Earnings Widget',
    description: 'Displays upcoming earnings calendar',
    category: 'widget',
    defaultValue: true
  },
  optionsFlowWidget: {
    enabled: true,
    name: 'Options Flow Widget',
    description: 'Displays options flow data',
    category: 'widget',
    defaultValue: true
  },
  aiAgentWidget: {
    enabled: false,
    name: 'AI Agent Widget',
    description: 'Displays AI-powered stock analysis and recommendations',
    category: 'widget',
    defaultValue: false
  }
});

// User feature preferences store for user-specific overrides
export const userFeaturePreferences = writable<UserFeaturePreferences>({});

// Feature flag caching functions
export const setFeatureFlagCache = (flagName: string, flagData: FeatureFlag) => {
  setCache('featureFlags', flagData, flagName);
};

export const getFeatureFlagCache = (flagName: string): FeatureFlag | undefined => {
  return getCache('featureFlags', flagName);
};

// Function to update feature flag with user preference
export const updateFeatureFlag = (flagName: string, enabled: boolean, isUserOverride: boolean = false) => {
  featureFlags.update(flags => {
    if (flags[flagName]) {
      flags[flagName] = {
        ...flags[flagName],
        enabled,
        ...(isUserOverride && { userOverride: enabled })
      };
      
      // Cache the updated flag
      setFeatureFlagCache(flagName, flags[flagName]);
    }
    return flags;
  });
  
  // Update user preferences if it's a user override
  if (isUserOverride) {
    userFeaturePreferences.update(prefs => ({
      ...prefs,
      [flagName]: enabled
    }));
  }
};

// Function to reset feature flag to default
export const resetFeatureFlag = (flagName: string) => {
  featureFlags.update(flags => {
    if (flags[flagName]) {
      flags[flagName] = {
        ...flags[flagName],
        enabled: flags[flagName].defaultValue,
        userOverride: undefined
      };
      
      // Cache the reset flag
      setFeatureFlagCache(flagName, flags[flagName]);
    }
    return flags;
  });
  
  // Remove from user preferences
  userFeaturePreferences.update(prefs => {
    const newPrefs = { ...prefs };
    delete newPrefs[flagName];
    return newPrefs;
  });
};

// Function to check if a feature is enabled (with caching)
export const isFeatureEnabledCached = (flagName: string): boolean => {
  const cachedFlag = getFeatureFlagCache(flagName);
  if (cachedFlag) {
    return isFeatureEnabled(flagName, { [flagName]: cachedFlag });
  }
  
  let result = false;
  featureFlags.subscribe(flags => {
    result = isFeatureEnabled(flagName, flags);
  })();
  return result;
};

export const activePopupParameter = writable<string | null>(null);

export const showCookieConsent = writable(<boolean>false);
export const shouldUpdatePriceChart = writable(<boolean>false);
export const selectedTimePeriod =  writable(<string>"");
export const coolMode = writable(<boolean>false);

export const timeFrame =writable(<string>"10Y");

export const closedPWA = writable(<boolean>false);

export const executiveClicked = writable(<boolean>false);
export const secFilingsClicked = writable(<boolean>false);

export const displayTitle = writable(<string>"");
export const displayDate = writable(<string>"");

export const displayCompanyName = writable(<string>"");
export const currentPrice = writable(<number>0);
export const currentPortfolioPrice = writable(<number>0);
export const realtimePrice = writable(<number>0);
export const wsBidPrice = writable(null);
export const wsAskPrice = writable(null);

export const priceIncrease = writable(<boolean>false);
export const isCrosshairMoveActive = writable(<boolean>true);


export const screenWidth = writable(<Number>0);

export const globalForm = writable(<Array<any>>[]);

export const trendingList = writable(<Array<any>>[]);

//export const userRegion = writable(<string>"");

export const loginData = writable({});

export const replyCommentClicked = writable({});
export const editCommentClicked = writable({});
export const priceChartData = writable({});

// Legacy component flags - maintained for backward compatibility
export const fundamentalAnalysisComponent = writable(<boolean>false);
export const priceAnalysisComponent = writable(<boolean>false);
export const revenueSegmentationComponent = writable(<boolean>false);
export const trendAnalysisComponent = writable(<boolean>false);
export const shareStatisticsComponent = writable(<boolean>false);
export const shareholderComponent = writable(<boolean>false);
export const retailVolumeComponent = writable(<boolean>false);
export const darkPoolComponent = writable(<boolean>false);
export const enterpriseComponent = writable(<boolean>false);
export const varComponent = writable(<boolean>false);
export const sentimentComponent = writable(<boolean>false);
export const analystEstimateComponent = writable(<boolean>false);
export const marketMakerComponent = writable(<boolean>false);
export const optionComponent = writable(<boolean>false);
export const clinicalTrialComponent = writable(<boolean>false);
export const failToDeliverComponent = writable(<boolean>false);
export const borrowedShareComponent = writable(<boolean>false);
export const impliedVolatilityComponent = writable(<boolean>false);
export const optionsNetFlowComponent = writable(<boolean>false);
export const governmentContractComponent = writable(<boolean>false);
export const analystInsightComponent = writable(<boolean>false);
export const swapComponent = writable(<boolean>false);
export const taRatingComponent = writable(<boolean>false);
export const dcfComponent = writable(<boolean>false);
export const correlationComponent = writable(<boolean>false);
export const corporateLobbyingComponent = writable(<boolean>false);
export const fomcImpactComponent = writable(<boolean>false);
export const scoreComponent = writable(<boolean>false);

export const goBackToPostId = writable(<string>"");
export const strategyId = writable(<string>"");

export const traded = writable(<boolean>false);

export const previousPage = writable(<string>"");

export const oauthState = writable(<string>"");
export const oauthVerifier = writable(<string>"");
export const oauthProvider = writable(<string>"");


export const newPriceAlertData = writable(<Array<any>>{});

export const cachedPosts = writable(<Array<any>>{});
export const currentPagePosition = writable(<Number>0);
export const postVote = writable(<Array<any>>{});

export const similarTickerClicked = writable(<boolean>false);

export const isScrollingUp = writable(<boolean>true);
export const isWeekend = writable(<boolean>false);
export const isBeforeMarketOpen = writable(<boolean>false);
export const isAfterMarketClose = writable(<boolean>false);
export const isOpen = writable(<boolean>false);

export const commentIdDeleted = writable(<string>"");
export const postIdDeleted = writable(<string>"");
export const commentAdded = writable(<string>"");
export const commentUpdated = writable(<string>"");
export const scrollToComment = writable(<string>"");

export const searchBarData = writable([]);

export const stockTicker = writable(<string>"");
export const etfTicker = writable(<string>"");
export const indexTicker = writable(<string>"");

export const cryptoTicker = writable(<string>"");
export const assetType = writable(<string>"");

export const hedgeFundsCIK = writable(<string>"");

export const linkTitle = writable(<string>"");

export const numberOfUnreadNotification = writable(<number>0);

export const openPriceAlert = writable(<boolean>false);

export const sidebarOpen = writable(<boolean>false);
export const sidebarExpanded = writable(<boolean>true);
export const sidebarOpenField = writable(<boolean>false);

export const tagList = writable([
  {
    name: "Meme",
    color: "#105488",
  },
  {
    name: "News",
    color: "#c78900",
  },
  {
    name: "Discussion",
    color: "#800080",
  },
  {
    name: "Gain",
    color: "#19c41d",
  },
  {
    name: "Loss",
    color: "#FF0000",
  },
  {
    name: "Chart",
    color: "#FF4500",
  },
  {
    name: "DD",
    color: "#365B8C",
  },
  {
    name: "YOLO",
    color: "#56B6DF",
  },
]);
