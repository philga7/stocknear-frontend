import { writable, derived } from 'svelte/store';
import type { FeatureFlag, FeatureFlags } from '$lib/store';

// Environment-based configuration
export interface EnvironmentConfig {
  development: boolean;
  production: boolean;
  staging: boolean;
  testing: boolean;
}

// Feature rollout configuration
export interface RolloutConfig {
  percentage: number; // 0-100
  startDate: Date;
  endDate?: Date;
  targetUsers: string[]; // User IDs or segments
  gradualRollout: boolean;
}

// Admin control configuration
export interface AdminConfig {
  adminOverride: boolean;
  adminUserId?: string;
  adminPermissions: string[];
  auditLog: boolean;
}

// Feature dependency configuration
export interface DependencyConfig {
  requiredFeatures: string[];
  optionalFeatures: string[];
  conflicts: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Analytics configuration
export interface AnalyticsConfig {
  trackUsage: boolean;
  trackPerformance: boolean;
  trackErrors: boolean;
  customMetrics: string[];
}

// Extended feature flag interface
export interface ExtendedFeatureFlag extends FeatureFlag {
  rollout?: RolloutConfig;
  admin?: AdminConfig;
  dependencies?: DependencyConfig;
  analytics?: AnalyticsConfig;
  environment?: EnvironmentConfig;
  lastModified: Date;
  createdBy: string;
  version: string;
}

// Configuration validation interface
export interface ConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Environment detection
export const getEnvironment = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' ? 'development' : 'production';
  }
  return process.env.NODE_ENV || 'development';
};

// Environment configuration store
export const environmentConfig = writable<EnvironmentConfig>({
  development: getEnvironment() === 'development',
  production: getEnvironment() === 'production',
  staging: getEnvironment() === 'staging',
  testing: getEnvironment() === 'testing'
});

// Feature configuration store
export const featureConfig = writable<Record<string, ExtendedFeatureFlag>>({});

// Configuration validation store
export const configValidation = writable<ConfigValidation>({
  isValid: true,
  errors: [],
  warnings: []
});

// Environment-based feature filtering
export const getEnvironmentFeatures = derived(
  [featureConfig, environmentConfig],
  ([$featureConfig, $environmentConfig]) => {
    const env = getEnvironment();
    const filteredFeatures: Record<string, ExtendedFeatureFlag> = {};
    
    Object.entries($featureConfig).forEach(([key, flag]) => {
      if (!flag.environment || flag.environment[env as keyof EnvironmentConfig]) {
        filteredFeatures[key] = flag;
      }
    });
    
    return filteredFeatures;
  }
);

// Rollout percentage calculation
export const calculateRolloutPercentage = (rollout: RolloutConfig): number => {
  if (!rollout.gradualRollout) {
    return rollout.percentage;
  }
  
  const now = new Date();
  const start = rollout.startDate;
  const end = rollout.endDate || new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000)); // Default 1 week
  
  if (now < start) return 0;
  if (now > end) return rollout.percentage;
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const progress = elapsed / totalDuration;
  
  return Math.min(rollout.percentage, Math.round(rollout.percentage * progress));
};

// Feature dependency validation
export const validateDependencies = (
  featureName: string,
  dependencies: DependencyConfig,
  allFeatures: Record<string, ExtendedFeatureFlag>
): string[] => {
  const errors: string[] = [];
  
  // Check required features
  dependencies.requiredFeatures.forEach(required => {
    if (!allFeatures[required] || !allFeatures[required].enabled) {
      errors.push(`Required feature "${required}" is not available or disabled`);
    }
  });
  
  // Check conflicts
  dependencies.conflicts.forEach(conflict => {
    if (allFeatures[conflict] && allFeatures[conflict].enabled) {
      errors.push(`Feature conflicts with "${conflict}"`);
    }
  });
  
  return errors;
};

// Configuration validation
export const validateConfiguration = (
  config: Record<string, ExtendedFeatureFlag>
): ConfigValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  Object.entries(config).forEach(([key, flag]) => {
    // Basic validation
    if (!flag.name) {
      errors.push(`Feature "${key}" missing name`);
    }
    
    if (flag.rollout) {
      if (flag.rollout.percentage < 0 || flag.rollout.percentage > 100) {
        errors.push(`Feature "${key}" has invalid rollout percentage`);
      }
      
      if (flag.rollout.startDate > (flag.rollout.endDate || new Date())) {
        errors.push(`Feature "${key}" has invalid rollout date range`);
      }
    }
    
    // Dependency validation
    if (flag.dependencies) {
      const depErrors = validateDependencies(key, flag.dependencies, config);
      errors.push(...depErrors);
    }
    
    // Analytics validation
    if (flag.analytics?.trackUsage && !flag.analytics.customMetrics) {
      warnings.push(`Feature "${key}" has usage tracking but no custom metrics defined`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Configuration management functions
export const updateFeatureConfiguration = (
  featureName: string,
  config: Partial<ExtendedFeatureFlag>
) => {
  featureConfig.update(configs => {
    const existing = configs[featureName];
    const updated: ExtendedFeatureFlag = {
      ...existing,
      ...config,
      lastModified: new Date(),
      version: existing ? incrementVersion(existing.version) : '1.0.0'
    };
    
    return {
      ...configs,
      [featureName]: updated
    };
  });
  
  // Revalidate configuration
  featureConfig.update(configs => {
    const validation = validateConfiguration(configs);
    configValidation.set(validation);
    return configs;
  });
};

// Version management
const incrementVersion = (version: string): string => {
  const parts = version.split('.');
  const patch = parseInt(parts[2] || '0') + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
};

// Environment-specific feature loading
export const loadEnvironmentFeatures = async (): Promise<void> => {
  const env = getEnvironment();
  
  try {
    // In a real implementation, this would load from an API or config file
    const response = await fetch(`/api/features?environment=${env}`);
    const features = await response.json();
    
    featureConfig.set(features);
    
    // Validate the loaded configuration
    const validation = validateConfiguration(features);
    configValidation.set(validation);
    
    if (!validation.isValid) {
      console.error('Feature configuration validation failed:', validation.errors);
    }
  } catch (error) {
    console.error('Failed to load feature configuration:', error);
    // Fall back to default configuration
    featureConfig.set({});
  }
};

// Feature rollout management
export const isFeatureRolledOut = (
  featureName: string,
  userId?: string
): boolean => {
  let result = false;
  
  featureConfig.subscribe(configs => {
    const feature = configs[featureName];
    if (!feature || !feature.rollout) {
      result = false;
      return;
    }
    
    const rollout = feature.rollout;
    const percentage = calculateRolloutPercentage(rollout);
    
    // Check if user is in target list
    if (rollout.targetUsers.length > 0 && userId) {
      result = rollout.targetUsers.includes(userId);
    } else {
      // Random rollout based on percentage
      result = Math.random() * 100 < percentage;
    }
  })();
  
  return result;
};

// Admin override management
export const setAdminOverride = (
  featureName: string,
  enabled: boolean,
  adminUserId: string
) => {
  featureConfig.update(configs => {
    const feature = configs[featureName];
    if (!feature) return configs;
    
    return {
      ...configs,
      [featureName]: {
        ...feature,
        admin: {
          ...feature.admin,
          adminOverride: enabled,
          adminUserId
        }
      }
    };
  });
};

// Export configuration for external use
export const exportConfiguration = (): Record<string, ExtendedFeatureFlag> => {
  let config: Record<string, ExtendedFeatureFlag> = {};
  
  featureConfig.subscribe(configs => {
    config = configs;
  })();
  
  return config;
};

// Import configuration from external source
export const importConfiguration = (config: Record<string, ExtendedFeatureFlag>) => {
  const validation = validateConfiguration(config);
  
  if (validation.isValid) {
    featureConfig.set(config);
    configValidation.set(validation);
  } else {
    throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
  }
}; 