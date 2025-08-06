<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    calculateUsageStatistics, 
    getAnalyticsSummary,
    trackFeatureView,
    trackFeatureInteraction,
    exportAnalyticsData 
  } from '$lib/features/analytics';
  import { featureFlags } from '$lib/store';

  let currentTab = 'overview';
  let dateRange = '7d';
  let isLoading = false;
  let exportData: any = null;

  // Reactive stores
  $: statistics = $calculateUsageStatistics;
  $: summary = $getAnalyticsSummary;
  $: flags = $featureFlags;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'engagement', label: 'Engagement', icon: '👥' },
    { id: 'errors', label: 'Errors', icon: '⚠️' },
    { id: 'abtesting', label: 'A/B Testing', icon: '🧪' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'features', label: 'Features', icon: '🎛️' }
  ];

  const dateRanges = [
    { value: '1d', label: 'Last 24h' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' }
  ];

  onMount(() => {
    // Track dashboard view
    trackFeatureView('analytics_dashboard');
  });

  function handleTabChange(tabId: string) {
    currentTab = tabId;
    trackFeatureInteraction('analytics_dashboard', 'tab_change', undefined, { tab: tabId });
  }

  function handleDateRangeChange(range: string) {
    dateRange = range;
    trackFeatureInteraction('analytics_dashboard', 'date_range_change', undefined, { range });
  }

  function handleExport() {
    isLoading = true;
    try {
      exportData = exportAnalyticsData();
      trackFeatureInteraction('analytics_dashboard', 'export_data');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      isLoading = false;
    }
  }

  function downloadExport() {
    if (!exportData) return;
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Filter statistics by date range
  $: filteredStatistics = statistics.filter(stat => {
    const daysAgo = parseInt(dateRange.replace('d', ''));
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    return stat.lastUpdated >= cutoffDate;
  });

  // Calculate top performing features
  $: topFeatures = filteredStatistics
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 5);

  // Calculate most used features
  $: mostUsedFeatures = filteredStatistics
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 5);

  // Calculate error-prone features
  $: errorProneFeatures = filteredStatistics
    .filter(stat => stat.errorRate > 0)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5);

  // Calculate A/B testing features
  $: abTestingFeatures = filteredStatistics
    .filter(stat => stat.variants && Object.keys(stat.variants).length > 0)
    .sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0));

  // Calculate health scores
  $: healthFeatures = filteredStatistics
    .filter(stat => stat.healthScore !== undefined)
    .sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));
</script>

<div class="analytics-dashboard">
  <div class="dashboard-header">
    <h1>Feature Analytics Dashboard</h1>
    <div class="header-actions">
      <select 
        bind:value={dateRange} 
        on:change={() => handleDateRangeChange(dateRange)}
        class="date-range-select"
      >
        {#each dateRanges as range}
          <option value={range.value}>{range.label}</option>
        {/each}
      </select>
      
      <button 
        on:click={handleExport}
        disabled={isLoading}
        class="export-btn"
      >
        {isLoading ? 'Exporting...' : 'Export Data'}
      </button>
    </div>
  </div>

  {#if exportData}
    <div class="export-success">
      <p>Export ready! 
        <button on:click={downloadExport} class="download-btn">Download</button>
        <button on:click={() => exportData = null} class="close-btn">Close</button>
      </p>
    </div>
  {/if}

  <div class="summary-cards">
    <div class="summary-card">
      <h3>Total Events</h3>
      <p class="number">{summary.totalEvents.toLocaleString()}</p>
    </div>
    <div class="summary-card">
      <h3>Features Tracked</h3>
      <p class="number">{summary.featuresTracked}</p>
    </div>
    <div class="summary-card">
      <h3>Avg Performance Score</h3>
      <p class="number">{summary.averagePerformanceScore.toFixed(1)}%</p>
    </div>
    <div class="summary-card">
      <h3>Active Features</h3>
      <p class="number">{Object.values(flags).filter(f => f.enabled).length}</p>
    </div>
  </div>

  <div class="tab-navigation">
    {#each tabs as tab}
      <button 
        class="tab-btn {currentTab === tab.id ? 'active' : ''}"
        on:click={() => handleTabChange(tab.id)}
      >
        <span class="tab-icon">{tab.icon}</span>
        {tab.label}
      </button>
    {/each}
  </div>

  <div class="tab-content">
    {#if currentTab === 'overview'}
      <div class="overview-content">
        <div class="chart-section">
          <h3>Top Performing Features</h3>
          <div class="feature-list">
            {#each topFeatures as feature}
              <div class="feature-item">
                <span class="feature-name">{feature.featureName}</span>
                <span class="feature-score">{feature.performanceScore.toFixed(1)}%</span>
              </div>
            {/each}
          </div>
        </div>

        <div class="chart-section">
          <h3>Most Used Features</h3>
          <div class="feature-list">
            {#each mostUsedFeatures as feature}
              <div class="feature-item">
                <span class="feature-name">{feature.featureName}</span>
                <span class="feature-views">{feature.totalViews.toLocaleString()} views</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:else if currentTab === 'performance'}
      <div class="performance-content">
        <h3>Performance Metrics</h3>
        <div class="metrics-grid">
          {#each filteredStatistics as stat}
            <div class="metric-card">
              <h4>{stat.featureName}</h4>
              <div class="metric-details">
                <p>Load Time: {stat.performanceScore.toFixed(1)}ms</p>
                <p>Error Rate: {stat.errorRate.toFixed(2)}%</p>
                <p>Performance Score: {stat.performanceScore.toFixed(1)}%</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if currentTab === 'engagement'}
      <div class="engagement-content">
        <h3>User Engagement</h3>
        <div class="engagement-stats">
          {#each filteredStatistics as stat}
            <div class="engagement-card">
              <h4>{stat.featureName}</h4>
              <div class="engagement-details">
                <p>Unique Users: {stat.uniqueUsers}</p>
                <p>Avg Session: {stat.averageSessionDuration.toFixed(1)}s</p>
                <p>Interactions: {stat.totalInteractions}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if currentTab === 'errors'}
      <div class="errors-content">
        <h3>Error Analysis</h3>
        <div class="error-stats">
          {#each errorProneFeatures as feature}
            <div class="error-card">
              <h4>{feature.featureName}</h4>
              <div class="error-details">
                <p>Error Rate: {feature.errorRate.toFixed(2)}%</p>
                <p>Total Views: {feature.totalViews}</p>
                <p>Performance Score: {feature.performanceScore.toFixed(1)}%</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if currentTab === 'abtesting'}
      <div class="abtesting-content">
        <h3>A/B Testing Results</h3>
        <div class="abtesting-stats">
          {#each abTestingFeatures as feature}
            <div class="abtesting-card">
              <h4>{feature.featureName}</h4>
              <div class="variant-details">
                {#each Object.entries(feature.variants || {}) as [variant, count]}
                  <div class="variant-item">
                    <span class="variant-name">{variant}</span>
                    <span class="variant-count">{count} views</span>
                    <span class="variant-percentage">
                      {((count / feature.totalViews) * 100).toFixed(1)}%
                    </span>
                  </div>
                {/each}
              </div>
              <div class="abtesting-summary">
                <p>Total Views: {feature.totalViews}</p>
                <p>Variants: {Object.keys(feature.variants || {}).length}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if currentTab === 'health'}
      <div class="health-content">
        <h3>Feature Health Monitoring</h3>
        <div class="health-stats">
          {#each healthFeatures as feature}
            <div class="health-card">
              <h4>{feature.featureName}</h4>
              <div class="health-details">
                <div class="health-score">
                  <span class="score-label">Health Score:</span>
                  <span class="score-value {(feature.healthScore || 0) >= 80 ? 'good' : (feature.healthScore || 0) >= 60 ? 'warning' : 'critical'}">
                    {(feature.healthScore || 0).toFixed(1)}%
                  </span>
                </div>
                <div class="health-metrics">
                  <p>Performance Score: {feature.performanceScore.toFixed(1)}%</p>
                  <p>Error Rate: {feature.errorRate.toFixed(2)}%</p>
                  <p>Total Views: {feature.totalViews}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if currentTab === 'features'}
      <div class="features-content">
        <h3>Feature Status</h3>
        <div class="feature-status-grid">
          {#each Object.entries(flags) as [name, flag]}
            <div class="feature-status-card {flag.enabled ? 'enabled' : 'disabled'}">
              <h4>{name}</h4>
              <p class="description">{flag.description || 'No description'}</p>
              <div class="status-details">
                <span class="status-badge {flag.enabled ? 'enabled' : 'disabled'}">
                  {flag.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <span class="category-badge">{flag.category}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .analytics-dashboard {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .dashboard-header h1 {
    margin: 0;
    color: #1f2937;
    font-size: 1.875rem;
    font-weight: 700;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .date-range-select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: white;
    font-size: 0.875rem;
  }

  .export-btn {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .export-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .export-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .export-success {
    background: #dcfce7;
    border: 1px solid #22c55e;
    border-radius: 0.375rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .download-btn, .close-btn {
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .download-btn {
    background: #22c55e;
    color: white;
  }

  .close-btn {
    background: #6b7280;
    color: white;
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .summary-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    text-align: center;
  }

  .summary-card h3 {
    margin: 0 0 0.5rem 0;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .summary-card .number {
    margin: 0;
    color: #1f2937;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .tab-navigation {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6b7280;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    color: #374151;
  }

  .tab-btn.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }

  .tab-icon {
    font-size: 1rem;
  }

  .tab-content {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 2rem;
  }

  .overview-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .chart-section h3 {
    margin: 0 0 1rem 0;
    color: #1f2937;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .feature-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.375rem;
  }

  .feature-name {
    font-weight: 500;
    color: #374151;
  }

  .feature-score, .feature-views {
    font-weight: 600;
    color: #059669;
  }

  .metrics-grid, .engagement-stats, .error-stats, .feature-status-grid, .abtesting-stats, .health-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .metric-card, .engagement-card, .error-card, .feature-status-card, .abtesting-card, .health-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    padding: 1rem;
  }

  .metric-card h4, .engagement-card h4, .error-card h4, .feature-status-card h4, .abtesting-card h4, .health-card h4 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
  }

  .metric-details p, .engagement-details p, .error-details p {
    margin: 0.25rem 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  /* A/B Testing Styles */
  .variant-details {
    margin: 0.5rem 0;
  }

  .variant-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: white;
    border-radius: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .variant-name {
    font-weight: 500;
    color: #374151;
  }

  .variant-count {
    color: #059669;
    font-weight: 600;
  }

  .variant-percentage {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .abtesting-summary {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .abtesting-summary p {
    margin: 0.25rem 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  /* Health Monitoring Styles */
  .health-details {
    margin: 0.5rem 0;
  }

  .health-score {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: white;
    border-radius: 0.25rem;
  }

  .score-label {
    font-weight: 500;
    color: #374151;
  }

  .score-value {
    font-weight: 700;
    font-size: 1.125rem;
  }

  .score-value.good {
    color: #059669;
  }

  .score-value.warning {
    color: #d97706;
  }

  .score-value.critical {
    color: #dc2626;
  }

  .health-metrics {
    margin-top: 0.5rem;
  }

  .health-metrics p {
    margin: 0.25rem 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .feature-status-card.enabled {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  .feature-status-card.disabled {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .description {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0.5rem 0;
  }

  .status-details {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .status-badge, .category-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-badge.enabled {
    background: #dcfce7;
    color: #166534;
  }

  .status-badge.disabled {
    background: #fee2e2;
    color: #991b1b;
  }

  .category-badge {
    background: #dbeafe;
    color: #1e40af;
  }

  @media (max-width: 768px) {
    .dashboard-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .header-actions {
      width: 100%;
      justify-content: space-between;
    }

    .summary-cards {
      grid-template-columns: 1fr;
    }

    .tab-navigation {
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .overview-content {
      grid-template-columns: 1fr;
    }
  }
</style> 