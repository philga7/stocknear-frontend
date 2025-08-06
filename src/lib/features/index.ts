// Main configuration exports
export * from './config';
export * from './validation';
export * from './analytics';
export * from './management';

// Re-export types for convenience
export type {
  ExtendedFeatureFlag,
  EnvironmentConfig,
  RolloutConfig,
  AdminConfig,
  DependencyConfig,
  AnalyticsConfig,
  ConfigValidation
} from './config';

export type {
  ValidationSchema,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from './validation';

export type {
  AnalyticsEvent,
  PerformanceMetric,
  EngagementMetric,
  UsageStatistics,
  AnalyticsConfig as AnalyticsConfigType
} from './analytics';

export type {
  ManagementState
} from './management';

// Default configuration loader
export const initializeFeatureConfiguration = async () => {
  const { loadEnvironmentFeatures, initializeAnalytics } = await import('./config');
  const { initializeAnalytics: initAnalytics } = await import('./analytics');
  
  // Load environment-specific features
  await loadEnvironmentFeatures();
  
  // Initialize analytics
  initAnalytics();
  
  console.log('Feature configuration system initialized');
}; 