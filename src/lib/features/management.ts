import { writable, derived } from 'svelte/store';
import type { ExtendedFeatureFlag, ConfigValidation } from './config';
import { validateConfiguration, generateValidationReport } from './validation';
import { analyticsStore, getAnalyticsSummary } from './analytics';

// Management interface state
export interface ManagementState {
  isOpen: boolean;
  activeTab: 'overview' | 'configuration' | 'analytics' | 'validation' | 'rollout';
  selectedFeature: string | null;
  searchQuery: string;
  filterCategory: string | null;
  sortBy: 'name' | 'category' | 'enabled' | 'lastModified';
  sortDirection: 'asc' | 'desc';
}

// Management store
export const managementStore = writable<ManagementState>({
  isOpen: false,
  activeTab: 'overview',
  selectedFeature: null,
  searchQuery: '',
  filterCategory: null,
  sortBy: 'name',
  sortDirection: 'asc'
});

// Feature management actions
export const openManagement = () => {
  managementStore.update(state => ({ ...state, isOpen: true }));
};

export const closeManagement = () => {
  managementStore.update(state => ({ ...state, isOpen: false }));
};

export const setActiveTab = (tab: ManagementState['activeTab']) => {
  managementStore.update(state => ({ ...state, activeTab: tab }));
};

export const selectFeature = (featureName: string | null) => {
  managementStore.update(state => ({ ...state, selectedFeature: featureName }));
};

export const setSearchQuery = (query: string) => {
  managementStore.update(state => ({ ...state, searchQuery: query }));
};

export const setFilterCategory = (category: string | null) => {
  managementStore.update(state => ({ ...state, filterCategory: category }));
};

export const setSortBy = (sortBy: ManagementState['sortBy']) => {
  managementStore.update(state => ({ ...state, sortBy }));
};

export const toggleSortDirection = () => {
  managementStore.update(state => ({
    ...state,
    sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc'
  }));
};

// Import the feature configuration from the main config module
import { featureConfig, configValidation, updateFeatureConfiguration } from './config';

// Filtered and sorted features
export const filteredFeatures = derived(
  [featureConfig, managementStore],
  ([$featureConfig, $managementStore]) => {
    let features = Object.entries($featureConfig);

    // Apply search filter
    if ($managementStore.searchQuery) {
      const query = $managementStore.searchQuery.toLowerCase();
      features = features.filter(([key, feature]) =>
        feature.name.toLowerCase().includes(query) ||
        feature.description?.toLowerCase().includes(query) ||
        key.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if ($managementStore.filterCategory) {
      features = features.filter(([_, feature]) =>
        feature.category === $managementStore.filterCategory
      );
    }

    // Apply sorting
    features.sort(([keyA, featureA], [keyB, featureB]) => {
      let a: any, b: any;

      switch ($managementStore.sortBy) {
        case 'name':
          a = featureA.name;
          b = featureB.name;
          break;
        case 'category':
          a = featureA.category;
          b = featureB.category;
          break;
        case 'enabled':
          a = featureA.enabled;
          b = featureB.enabled;
          break;
        case 'lastModified':
          a = featureA.lastModified;
          b = featureB.lastModified;
          break;
        default:
          a = keyA;
          b = keyB;
      }

      if (a < b) return $managementStore.sortDirection === 'asc' ? -1 : 1;
      if (a > b) return $managementStore.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return features;
  }
);

// Feature statistics
export const featureStatistics = derived(
  [featureConfig],
  ([$featureConfig]) => {
    const features = Object.values($featureConfig);
    const total = features.length;
    const enabled = features.filter(f => f.enabled).length;
    const disabled = total - enabled;
    
    const byCategory = features.reduce((acc, feature) => {
      acc[feature.category] = (acc[feature.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const withRollout = features.filter(f => f.rollout).length;
    const withAnalytics = features.filter(f => f.analytics?.trackUsage).length;
    const withDependencies = features.filter(f => f.dependencies?.requiredFeatures.length > 0).length;

    return {
      total,
      enabled,
      disabled,
      byCategory,
      withRollout,
      withAnalytics,
      withDependencies,
      enabledPercentage: total > 0 ? (enabled / total) * 100 : 0
    };
  }
);

// Validation summary
export const validationSummary = derived(
  [configValidation],
  ([$configValidation]) => {
    return {
      isValid: $configValidation.isValid,
      errorCount: $configValidation.errors.length,
      warningCount: $configValidation.warnings.length,
      criticalErrors: $configValidation.errors.filter(e => e.severity === 'critical').length
    };
  }
);

// Analytics summary
export const analyticsSummary = derived(
  [getAnalyticsSummary],
  ([$analyticsSummary]) => {
    return $analyticsSummary;
  }
);

// Feature management functions
export const toggleFeature = (featureName: string, enabled: boolean) => {
  updateFeatureConfiguration(featureName, { enabled });
};

export const updateFeatureDescription = (featureName: string, description: string) => {
  updateFeatureConfiguration(featureName, { description });
};

export const updateFeatureCategory = (featureName: string, category: ExtendedFeatureFlag['category']) => {
  updateFeatureConfiguration(featureName, { category });
};

export const setFeatureRollout = (
  featureName: string,
  rollout: ExtendedFeatureFlag['rollout']
) => {
  updateFeatureConfiguration(featureName, { rollout });
};

export const setFeatureAnalytics = (
  featureName: string,
  analytics: ExtendedFeatureFlag['analytics']
) => {
  updateFeatureConfiguration(featureName, { analytics });
};

export const setFeatureDependencies = (
  featureName: string,
  dependencies: ExtendedFeatureFlag['dependencies']
) => {
  updateFeatureConfiguration(featureName, { dependencies });
};

export const setFeatureEnvironment = (
  featureName: string,
  environment: ExtendedFeatureFlag['environment']
) => {
  updateFeatureConfiguration(featureName, { environment });
};

// Bulk operations
export const enableAllFeatures = () => {
  featureConfig.update(configs => {
    Object.keys(configs).forEach(key => {
      configs[key].enabled = true;
    });
    return configs;
  });
};

export const disableAllFeatures = () => {
  featureConfig.update(configs => {
    Object.keys(configs).forEach(key => {
      configs[key].enabled = false;
    });
    return configs;
  });
};

export const resetAllFeatures = () => {
  featureConfig.update(configs => {
    Object.keys(configs).forEach(key => {
      configs[key].enabled = configs[key].defaultValue;
      configs[key].userOverride = undefined;
    });
    return configs;
  });
};

// Configuration export/import
export const exportConfiguration = () => {
  let config: Record<string, ExtendedFeatureFlag> = {};
  featureConfig.subscribe(configs => {
    config = configs;
  })();

  const dataStr = JSON.stringify(config, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `feature-config-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};

export const importConfiguration = async (file: File): Promise<void> => {
  try {
    const text = await file.text();
    const config = JSON.parse(text);
    
    // Validate imported configuration
    const validation = validateConfiguration(config);
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
    
    // Import the configuration
    featureConfig.set(config);
    
    console.log('Configuration imported successfully');
  } catch (error) {
    console.error('Failed to import configuration:', error);
    throw error;
  }
};

// Validation report generation
export const generateValidationReportForManagement = () => {
  let config: Record<string, ExtendedFeatureFlag> = {};
  let validation: ConfigValidation = { isValid: true, errors: [], warnings: [] };
  
  featureConfig.subscribe(configs => {
    config = configs;
  })();
  
  configValidation.subscribe(val => {
    validation = val;
  })();
  
  return generateValidationReport(validation);
};

// Analytics data export
export const exportAnalyticsData = () => {
  const { exportAnalyticsData: exportData } = require('./analytics');
  const data = exportData();
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `analytics-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};

// Rollout management
export const getRolloutStatus = (featureName: string) => {
  let config: Record<string, ExtendedFeatureFlag> = {};
  featureConfig.subscribe(configs => {
    config = configs;
  })();
  
  const feature = config[featureName];
  if (!feature?.rollout) return null;
  
  const now = new Date();
  const start = feature.rollout.startDate;
  const end = feature.rollout.endDate || new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000));
  
  if (now < start) {
    return { status: 'pending', message: 'Rollout not started yet' };
  } else if (now > end) {
    return { status: 'completed', message: 'Rollout completed' };
  } else {
    const progress = ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;
    return { 
      status: 'active', 
      message: `Rollout in progress (${Math.round(progress)}%)`,
      progress 
    };
  }
};

// Performance monitoring
export const getFeaturePerformance = (featureName: string) => {
  let analytics: any = {};
  analyticsStore.subscribe(store => {
    analytics = store;
  })();
  
  const performanceMetrics = analytics.performance.filter(
    (p: any) => p.featureName === featureName
  );
  
  if (performanceMetrics.length === 0) {
    return null;
  }
  
  const avgLoadTime = performanceMetrics.reduce((sum: number, p: any) => sum + p.loadTime, 0) / performanceMetrics.length;
  const avgMemoryUsage = performanceMetrics.reduce((sum: number, p: any) => sum + p.memoryUsage, 0) / performanceMetrics.length;
  const totalErrors = performanceMetrics.reduce((sum: number, p: any) => sum + p.errorCount, 0);
  
  return {
    avgLoadTime,
    avgMemoryUsage,
    totalErrors,
    metricCount: performanceMetrics.length,
    lastUpdated: performanceMetrics[performanceMetrics.length - 1]?.timestamp
  };
}; 