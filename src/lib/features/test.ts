import { 
  featureConfig, 
  updateFeatureConfiguration, 
  validateConfiguration,
  isFeatureRolledOut,
  setAdminOverride,
  exportConfiguration,
  importConfiguration
} from './config';

import { 
  validateFeatureFlag,
  generateValidationReport,
  findCircularDependencies
} from './validation';

import {
  trackFeatureView,
  trackFeatureInteraction,
  trackFeatureError,
  trackPerformanceMetric,
  getAnalyticsSummary,
  flushAnalytics
} from './analytics';

import {
  openManagement,
  closeManagement,
  toggleFeature,
  featureStatistics,
  validationSummary
} from './management';

// Test data
const testFeature: any = {
  name: 'Test Feature',
  enabled: true,
  category: 'widget',
  defaultValue: true,
  description: 'A test feature for validation',
  version: '1.0.0',
  lastModified: new Date(),
  createdBy: 'test-user',
  rollout: {
    percentage: 50,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    targetUsers: ['user1', 'user2'],
    gradualRollout: true
  },
  admin: {
    adminOverride: false,
    adminUserId: 'admin-user',
    adminPermissions: ['read', 'write'],
    auditLog: true
  },
  dependencies: {
    requiredFeatures: ['base-feature'],
    optionalFeatures: ['optional-feature'],
    conflicts: ['conflicting-feature'],
    priority: 'medium'
  },
  analytics: {
    trackUsage: true,
    trackPerformance: true,
    trackErrors: true,
    customMetrics: ['load_time', 'error_rate']
  },
  environment: {
    development: true,
    production: false,
    staging: true,
    testing: true
  }
};

// Test suite
export const runFeatureConfigurationTests = async () => {
  console.log('🧪 Running Feature Configuration System Tests...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: [] as Array<{ name: string; passed: boolean; error?: string }>
  };

  const test = (name: string, testFn: () => boolean | Promise<boolean>) => {
    return async () => {
      try {
        const result = await testFn();
        results.tests.push({ name, passed: result });
        if (result) results.passed++;
        else results.failed++;
        console.log(result ? '✅' : '❌', name);
      } catch (error) {
        results.tests.push({ name, passed: false, error: error as string });
        results.failed++;
        console.log('❌', name, '-', error);
      }
    };
  };

  // Configuration tests
  await test('Feature configuration store initialization', () => {
    return featureConfig !== undefined;
  })();

  await test('Update feature configuration', () => {
    updateFeatureConfiguration('test-feature', testFeature);
    let config: any = {};
    featureConfig.subscribe(c => config = c)();
    return config['test-feature']?.name === 'Test Feature';
  })();

  await test('Feature validation', () => {
    const validation = validateFeatureFlag(testFeature);
    return validation.isValid;
  })();

  await test('Configuration validation', () => {
    const config = { 'test-feature': testFeature };
    const validation = validateConfiguration(config);
    return validation.isValid;
  })();

  await test('Circular dependency detection', () => {
    const config = {
      'feature-a': { ...testFeature, dependencies: { requiredFeatures: ['feature-b'], priority: 'medium' } },
      'feature-b': { ...testFeature, dependencies: { requiredFeatures: ['feature-a'], priority: 'medium' } }
    };
    const circular = findCircularDependencies(config);
    return circular.length > 0;
  })();

  // Analytics tests
  await test('Track feature view', () => {
    trackFeatureView('test-feature', 'test-user');
    return true; // No error thrown
  })();

  await test('Track feature interaction', () => {
    trackFeatureInteraction('test-feature', 'click', 'test-user');
    return true; // No error thrown
  })();

  await test('Track feature error', () => {
    trackFeatureError('test-feature', new Error('Test error'), 'test-user');
    return true; // No error thrown
  })();

  await test('Track performance metric', () => {
    trackPerformanceMetric('test-feature', {
      loadTime: 100,
      renderTime: 50,
      memoryUsage: 1024,
      errorCount: 0
    });
    return true; // No error thrown
  })();

  // Management tests
  await test('Management store operations', () => {
    openManagement();
    let state: any = {};
    const { managementStore } = await import('./management');
    managementStore.subscribe(s => state = s)();
    const isOpen = state.isOpen;
    closeManagement();
    return isOpen === true;
  })();

  await test('Toggle feature', () => {
    toggleFeature('test-feature', false);
    let config: any = {};
    featureConfig.subscribe(c => config = c)();
    return config['test-feature']?.enabled === false;
  })();

  await test('Feature statistics calculation', () => {
    const stats = featureStatistics.get();
    return stats.total > 0;
  })();

  // Rollout tests
  await test('Feature rollout calculation', () => {
    const isRolledOut = isFeatureRolledOut('test-feature', 'user1');
    return typeof isRolledOut === 'boolean';
  })();

  await test('Admin override', () => {
    setAdminOverride('test-feature', true, 'admin-user');
    let config: any = {};
    featureConfig.subscribe(c => config = c)();
    return config['test-feature']?.admin?.adminOverride === true;
  })();

  // Export/Import tests
  await test('Configuration export', () => {
    try {
      exportConfiguration();
      return true; // No error thrown
    } catch (error) {
      return false;
    }
  })();

  // Validation report tests
  await test('Generate validation report', () => {
    const report = generateValidationReport({
      isValid: true,
      errors: [],
      warnings: []
    });
    return report.includes('Configuration is valid');
  })();

  // Analytics summary tests
  await test('Analytics summary calculation', () => {
    const summary = getAnalyticsSummary.get();
    return summary !== undefined;
  })();

  // Environment tests
  await test('Environment detection', () => {
    const { getEnvironment } = await import('./config');
    const env = getEnvironment();
    return typeof env === 'string' && env.length > 0;
  })();

  // Performance monitoring tests
  await test('Performance monitoring', () => {
    const { startPerformanceMonitoring } = await import('./analytics');
    const monitor = startPerformanceMonitoring('test-feature');
    monitor.end();
    return true; // No error thrown
  })();

  // Error boundary tests
  await test('Error boundary', () => {
    const { createErrorBoundary } = await import('./analytics');
    const boundary = createErrorBoundary('test-feature');
    boundary.catch(new Error('Test error'));
    return true; // No error thrown
  })();

  // Print results
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`  - ${test.name}${test.error ? `: ${test.error}` : ''}`);
    });
  }

  return results;
};

// Integration test
export const runIntegrationTest = async () => {
  console.log('\n🔗 Running Integration Test...\n');

  try {
    // Initialize the feature configuration system
    const { initializeFeatureConfiguration } = await import('./index');
    await initializeFeatureConfiguration();

    // Test the complete workflow
    const testWorkflow = async () => {
      // 1. Create a feature
      updateFeatureConfiguration('integration-test', {
        ...testFeature,
        name: 'Integration Test Feature'
      });

      // 2. Validate the feature
      const validation = validateFeatureFlag(testFeature);
      if (!validation.isValid) {
        throw new Error('Feature validation failed');
      }

      // 3. Track analytics
      trackFeatureView('integration-test', 'test-user');
      trackFeatureInteraction('integration-test', 'click', 'test-user');

      // 4. Check rollout
      const isRolledOut = isFeatureRolledOut('integration-test', 'test-user');
      console.log('Rollout status:', isRolledOut);

      // 5. Get statistics
      const stats = featureStatistics.get();
      console.log('Feature statistics:', stats);

      // 6. Generate report
      const report = generateValidationReport(validation);
      console.log('Validation report generated successfully');

      return true;
    };

    const result = await testWorkflow();
    console.log('✅ Integration test completed successfully');
    return result;

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return false;
  }
};

// Performance test
export const runPerformanceTest = async () => {
  console.log('\n⚡ Running Performance Test...\n');

  const startTime = performance.now();

  // Test bulk operations
  for (let i = 0; i < 100; i++) {
    updateFeatureConfiguration(`perf-test-${i}`, {
      ...testFeature,
      name: `Performance Test Feature ${i}`
    });
  }

  // Test analytics tracking
  for (let i = 0; i < 1000; i++) {
    trackFeatureView(`perf-test-${i % 10}`, 'test-user');
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log(`⏱️  Performance test completed in ${duration.toFixed(2)}ms`);
  console.log(`📊 Average time per operation: ${(duration / 1100).toFixed(2)}ms`);

  return duration < 5000; // Should complete within 5 seconds
};

// Run all tests
export const runAllTests = async () => {
  console.log('🚀 Starting Feature Configuration System Test Suite\n');

  const unitTests = await runFeatureConfigurationTests();
  const integrationTest = await runIntegrationTest();
  const performanceTest = await runPerformanceTest();

  const totalTests = unitTests.passed + unitTests.failed + 2; // +2 for integration and performance tests
  const totalPassed = unitTests.passed + (integrationTest ? 1 : 0) + (performanceTest ? 1 : 0);

  console.log('\n🎯 Final Results:');
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Total Passed: ${totalPassed}`);
  console.log(`❌ Total Failed: ${totalTests - totalPassed}`);
  console.log(`📈 Overall Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

  return {
    unitTests,
    integrationTest,
    performanceTest,
    totalTests,
    totalPassed,
    successRate: (totalPassed / totalTests) * 100
  };
}; 