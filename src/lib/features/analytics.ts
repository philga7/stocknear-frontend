import { writable, derived } from 'svelte/store';
import type { ExtendedFeatureFlag } from './config';

// Analytics event types
export interface AnalyticsEvent {
  id: string;
  featureName: string;
  eventType: 'feature_view' | 'feature_interaction' | 'feature_error' | 'performance_metric' | 'ab_test';
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  metadata: Record<string, any>;
  environment: string;
  version: string;
  variant?: string; // For A/B testing
}

// Performance metrics
export interface PerformanceMetric {
  featureName: string;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  errorCount: number;
  timestamp: Date;
}

// User engagement metrics
export interface EngagementMetric {
  featureName: string;
  userId?: string;
  sessionDuration: number;
  interactionCount: number;
  lastInteraction: Date;
  featureEnabled: boolean;
}

// Feature usage statistics
export interface UsageStatistics {
  featureName: string;
  totalViews: number;
  totalInteractions: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  errorRate: number;
  performanceScore: number;
  lastUpdated: Date;
  variants?: Record<string, number>; // A/B testing variants
  healthScore?: number; // Feature health score
}

// Analytics configuration
export interface AnalyticsConfig {
  enabled: boolean;
  trackPageViews: boolean;
  trackInteractions: boolean;
  trackPerformance: boolean;
  trackErrors: boolean;
  trackUserEngagement: boolean;
  trackABTesting: boolean;
  trackHealthMetrics: boolean;
  batchSize: number;
  flushInterval: number;
  endpoint: string;
  apiKey?: string;
}

// Analytics store
export const analyticsStore = writable<{
  events: AnalyticsEvent[];
  performance: PerformanceMetric[];
  engagement: EngagementMetric[];
  statistics: UsageStatistics[];
  config: AnalyticsConfig;
}>({
  events: [],
  performance: [],
  engagement: [],
  statistics: [],
  config: {
    enabled: true,
    trackPageViews: true,
    trackInteractions: true,
    trackPerformance: true,
    trackErrors: true,
    trackUserEngagement: true,
    trackABTesting: true,
    trackHealthMetrics: true,
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
    endpoint: '/api/analytics'
  }
});

// Generate unique event ID
const generateEventId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get session ID
const getSessionId = (): string => {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = generateEventId();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
  return 'server-session';
};

// Track feature view
export const trackFeatureView = (
  featureName: string,
  userId?: string,
  metadata: Record<string, any> = {}
) => {
  analyticsStore.update(store => {
    const event: AnalyticsEvent = {
      id: generateEventId(),
      featureName,
      eventType: 'feature_view',
      timestamp: new Date(),
      userId,
      sessionId: getSessionId(),
      metadata,
      environment: typeof window !== 'undefined' ? window.location.hostname : 'server',
      version: '1.0.0'
    };

    return {
      ...store,
      events: [...store.events, event]
    };
  });
};

// Track feature interaction
export const trackFeatureInteraction = (
  featureName: string,
  interactionType: string,
  userId?: string,
  metadata: Record<string, any> = {}
) => {
  analyticsStore.update(store => {
    const event: AnalyticsEvent = {
      id: generateEventId(),
      featureName,
      eventType: 'feature_interaction',
      timestamp: new Date(),
      userId,
      sessionId: getSessionId(),
      metadata: {
        interactionType,
        ...metadata
      },
      environment: typeof window !== 'undefined' ? window.location.hostname : 'server',
      version: '1.0.0'
    };

    return {
      ...store,
      events: [...store.events, event]
    };
  });
};

// Track feature error
export const trackFeatureError = (
  featureName: string,
  error: Error,
  userId?: string,
  metadata: Record<string, any> = {}
) => {
  analyticsStore.update(store => {
    const event: AnalyticsEvent = {
      id: generateEventId(),
      featureName,
      eventType: 'feature_error',
      timestamp: new Date(),
      userId,
      sessionId: getSessionId(),
      metadata: {
        errorMessage: error.message,
        errorStack: error.stack,
        ...metadata
      },
      environment: typeof window !== 'undefined' ? window.location.hostname : 'server',
      version: '1.0.0'
    };

    return {
      ...store,
      events: [...store.events, event]
    };
  });
};

// Track performance metric
export const trackPerformanceMetric = (
  featureName: string,
  metric: Omit<PerformanceMetric, 'featureName' | 'timestamp'>
) => {
  analyticsStore.update(store => {
    const performanceMetric: PerformanceMetric = {
      featureName,
      ...metric,
      timestamp: new Date()
    };

    return {
      ...store,
      performance: [...store.performance, performanceMetric]
    };
  });
};

// Track user engagement
export const trackUserEngagement = (
  featureName: string,
  engagement: Omit<EngagementMetric, 'featureName' | 'lastInteraction'>
) => {
  analyticsStore.update(store => {
    const engagementMetric: EngagementMetric = {
      featureName,
      ...engagement,
      lastInteraction: new Date()
    };

    return {
      ...store,
      engagement: [...store.engagement, engagementMetric]
    };
  });
};

// A/B Testing functions
export const trackABTestEvent = (
  featureName: string,
  variant: string,
  eventType: string,
  userId?: string,
  metadata: Record<string, any> = {}
) => {
  analyticsStore.update(store => {
    const event: AnalyticsEvent = {
      id: generateEventId(),
      featureName,
      eventType: 'ab_test',
      timestamp: new Date(),
      userId,
      sessionId: getSessionId(),
      metadata: {
        variant,
        eventType,
        ...metadata
      },
      environment: typeof window !== 'undefined' ? window.location.hostname : 'server',
      version: '1.0.0',
      variant
    };

    return {
      ...store,
      events: [...store.events, event]
    };
  });
};

// Health monitoring
export const trackFeatureHealth = (
  featureName: string,
  healthMetrics: {
    loadTime: number;
    errorCount: number;
    successRate: number;
    userSatisfaction?: number;
  }
) => {
  const healthScore = calculateHealthScore(healthMetrics);
  
  analyticsStore.update(store => {
    const event: AnalyticsEvent = {
      id: generateEventId(),
      featureName,
      eventType: 'performance_metric',
      timestamp: new Date(),
      metadata: {
        ...healthMetrics,
        healthScore,
        type: 'health_check'
      },
      environment: typeof window !== 'undefined' ? window.location.hostname : 'server',
      version: '1.0.0'
    };

    return {
      ...store,
      events: [...store.events, event]
    };
  });
};

// Calculate health score based on metrics
const calculateHealthScore = (metrics: {
  loadTime: number;
  errorCount: number;
  successRate: number;
  userSatisfaction?: number;
}): number => {
  const { loadTime, errorCount, successRate, userSatisfaction } = metrics;
  
  // Load time score (0-100, penalize slow loads)
  const loadTimeScore = Math.max(0, 100 - (loadTime / 1000) * 20);
  
  // Error score (0-100, penalize errors)
  const errorScore = Math.max(0, 100 - (errorCount * 10));
  
  // Success rate score (0-100)
  const successScore = successRate * 100;
  
  // User satisfaction score (0-100, optional)
  const satisfactionScore = userSatisfaction || 100;
  
  // Weighted average
  return (loadTimeScore * 0.3 + errorScore * 0.3 + successScore * 0.3 + satisfactionScore * 0.1);
};

// Calculate usage statistics
export const calculateUsageStatistics = derived(
  [analyticsStore],
  ([$analyticsStore]) => {
    const statistics: UsageStatistics[] = [];
    const featureGroups = new Map<string, {
      views: AnalyticsEvent[];
      interactions: AnalyticsEvent[];
      errors: AnalyticsEvent[];
      performance: PerformanceMetric[];
      engagement: EngagementMetric[];
    }>();

    // Group events by feature
    $analyticsStore.events.forEach(event => {
      if (!featureGroups.has(event.featureName)) {
        featureGroups.set(event.featureName, {
          views: [],
          interactions: [],
          errors: [],
          performance: [],
          engagement: []
        });
      }

      const group = featureGroups.get(event.featureName)!;
      if (event.eventType === 'feature_view') {
        group.views.push(event);
      } else if (event.eventType === 'feature_interaction') {
        group.interactions.push(event);
      } else if (event.eventType === 'feature_error') {
        group.errors.push(event);
      }
    });

    // Group performance metrics by feature
    $analyticsStore.performance.forEach(metric => {
      if (!featureGroups.has(metric.featureName)) {
        featureGroups.set(metric.featureName, {
          views: [],
          interactions: [],
          errors: [],
          performance: [],
          engagement: []
        });
      }
      featureGroups.get(metric.featureName)!.performance.push(metric);
    });

    // Group engagement metrics by feature
    $analyticsStore.engagement.forEach(metric => {
      if (!featureGroups.has(metric.featureName)) {
        featureGroups.set(metric.featureName, {
          views: [],
          interactions: [],
          errors: [],
          performance: [],
          engagement: []
        });
      }
      featureGroups.get(metric.featureName)!.engagement.push(metric);
    });

    // Calculate statistics for each feature
    featureGroups.forEach((group, featureName) => {
      const totalViews = group.views.length;
      const totalInteractions = group.interactions.length;
      const uniqueUsers = new Set([
        ...group.views.map(v => v.userId).filter(Boolean),
        ...group.interactions.map(i => i.userId).filter(Boolean)
      ]).size;

      const averageSessionDuration = group.engagement.length > 0
        ? group.engagement.reduce((sum, e) => sum + e.sessionDuration, 0) / group.engagement.length
        : 0;

      const errorRate = totalViews > 0 ? (group.errors.length / totalViews) * 100 : 0;

      const performanceScore = group.performance.length > 0
        ? group.performance.reduce((sum, p) => {
            // Calculate performance score based on load time and error count
            const loadScore = Math.max(0, 100 - (p.loadTime / 1000)); // Penalize load times over 1s
            const errorScore = Math.max(0, 100 - (p.errorCount * 10)); // Penalize errors
            return sum + (loadScore + errorScore) / 2;
          }, 0) / group.performance.length
        : 100;

      // Calculate A/B testing variants
      const variants: Record<string, number> = {};
      group.views.forEach(event => {
        if (event.variant) {
          variants[event.variant] = (variants[event.variant] || 0) + 1;
        }
      });

      // Calculate health score
      const healthScore = group.performance.length > 0
        ? group.performance.reduce((sum, p) => {
            const loadTimeScore = Math.max(0, 100 - (p.loadTime / 1000) * 20);
            const errorScore = Math.max(0, 100 - (p.errorCount * 10));
            const successScore = (1 - (p.errorCount / Math.max(totalViews, 1))) * 100;
            return sum + (loadTimeScore * 0.4 + errorScore * 0.4 + successScore * 0.2);
          }, 0) / group.performance.length
        : 100;

      statistics.push({
        featureName,
        totalViews,
        totalInteractions,
        uniqueUsers,
        averageSessionDuration,
        errorRate,
        performanceScore,
        variants: Object.keys(variants).length > 0 ? variants : undefined,
        healthScore,
        lastUpdated: new Date()
      });
    });

    return statistics;
  }
);

// Flush analytics data to server
export const flushAnalytics = async (): Promise<void> => {
  let store: any;
  analyticsStore.subscribe(s => store = s)();

  if (store.events.length === 0 && store.performance.length === 0) {
    return;
  }

  try {
    const response = await fetch(store.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(store.config.apiKey && { 'Authorization': `Bearer ${store.config.apiKey}` })
      },
      body: JSON.stringify({
        events: store.events,
        performance: store.performance,
        engagement: store.engagement,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      // Clear sent data
      analyticsStore.update(s => ({
        ...s,
        events: [],
        performance: []
      }));
    } else {
      console.error('Failed to flush analytics:', response.statusText);
    }
  } catch (error) {
    console.error('Error flushing analytics:', error);
  }
};

// Auto-flush analytics data
let flushInterval: NodeJS.Timeout | null = null;

export const startAutoFlush = () => {
  if (flushInterval) {
    clearInterval(flushInterval);
  }

  analyticsStore.subscribe(store => {
    if (store.config.enabled && store.config.flushInterval > 0) {
      flushInterval = setInterval(flushAnalytics, store.config.flushInterval);
    }
  })();
};

export const stopAutoFlush = () => {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
};

// Performance monitoring
export const startPerformanceMonitoring = (featureName: string) => {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

  return {
    end: () => {
      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const loadTime = endTime - startTime;
      const memoryUsage = endMemory - startMemory;

      trackPerformanceMetric(featureName, {
        loadTime,
        renderTime: loadTime,
        memoryUsage,
        errorCount: 0
      });
    }
  };
};

// Error boundary for feature components
export const createErrorBoundary = (featureName: string) => {
  return {
    catch: (error: Error) => {
      trackFeatureError(featureName, error);
      console.error(`Feature error in ${featureName}:`, error);
    }
  };
};

// Analytics configuration management
export const updateAnalyticsConfig = (config: Partial<AnalyticsConfig>) => {
  analyticsStore.update(store => ({
    ...store,
    config: { ...store.config, ...config }
  }));
};

// Get analytics summary
export const getAnalyticsSummary = derived(
  [analyticsStore, calculateUsageStatistics],
  ([$analyticsStore, $statistics]) => {
    const totalEvents = $analyticsStore.events.length;
    const totalPerformanceMetrics = $analyticsStore.performance.length;
    const totalEngagementMetrics = $analyticsStore.engagement.length;
    const averagePerformanceScore = $statistics.length > 0
      ? $statistics.reduce((sum, s) => sum + s.performanceScore, 0) / $statistics.length
      : 0;

    return {
      totalEvents,
      totalPerformanceMetrics,
      totalEngagementMetrics,
      averagePerformanceScore,
      featuresTracked: $statistics.length,
      lastUpdated: new Date()
    };
  }
);

// Export analytics data
export const exportAnalyticsData = () => {
  let store: any;
  analyticsStore.subscribe(s => store = s)();

  return {
    events: store.events,
    performance: store.performance,
    engagement: store.engagement,
    statistics: calculateUsageStatistics.get(),
    config: store.config,
    exportedAt: new Date().toISOString()
  };
};

// Initialize analytics
export const initializeAnalytics = (config?: Partial<AnalyticsConfig>) => {
  if (config) {
    updateAnalyticsConfig(config);
  }

  if (typeof window !== 'undefined') {
    startAutoFlush();
    
    // Track page unload to flush remaining data
    window.addEventListener('beforeunload', () => {
      flushAnalytics();
    });
  }
}; 