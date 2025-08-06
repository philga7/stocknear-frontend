<script lang="ts">
  import { onMount } from 'svelte';
  import FeatureDashboard from '$lib/components/Analytics/FeatureDashboard.svelte';
  import { initializeAnalytics } from '$lib/features/analytics';
  import SEO from '$lib/components/SEO.svelte';

  export let data;

  let isAuthorized = false;
  let loading = true;

  onMount(async () => {
    // Check if user is admin
    if (data?.user?.role === 'admin' || data?.user?.tier === 'Pro') {
      isAuthorized = true;
      
      // Initialize analytics with admin configuration
      initializeAnalytics({
        enabled: true,
        trackPageViews: true,
        trackInteractions: true,
        trackPerformance: true,
        trackErrors: true,
        trackUserEngagement: true,
        batchSize: 20,
        flushInterval: 15000, // 15 seconds for admin
        endpoint: '/api/analytics'
      });
    }
    
    loading = false;
  });
</script>

<svelte:head>
  <title>Feature Analytics Dashboard - StockNear</title>
  <meta name="description" content="Comprehensive analytics and monitoring for feature flags" />
</svelte:head>

<SEO 
  title="Feature Analytics Dashboard"
  description="Monitor feature usage, performance, and user engagement with comprehensive analytics"
/>

<div class="analytics-page">
  {#if loading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading analytics dashboard...</p>
    </div>
  {:else if !isAuthorized}
    <div class="unauthorized-container">
      <h1>Access Denied</h1>
      <p>You need administrator privileges to access the analytics dashboard.</p>
      <a href="/" class="back-link">Return to Home</a>
    </div>
  {:else}
    <div class="dashboard-container">
      <div class="page-header">
        <div class="breadcrumb">
          <a href="/admin">Admin</a>
          <span class="separator">/</span>
          <span>Analytics</span>
        </div>
      </div>
      
      <FeatureDashboard />
    </div>
  {/if}
</div>

<style>
  .analytics-page {
    min-height: 100vh;
    background: #f8fafc;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    gap: 1rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .unauthorized-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    text-align: center;
    gap: 1rem;
  }

  .unauthorized-container h1 {
    color: #ef4444;
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
  }

  .unauthorized-container p {
    color: #6b7280;
    margin: 0;
    font-size: 1.125rem;
  }

  .back-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    text-decoration: none;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .back-link:hover {
    background: #2563eb;
  }

  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
  }

  .page-header {
    margin-bottom: 2rem;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .breadcrumb a {
    color: #3b82f6;
    text-decoration: none;
    transition: color 0.2s;
  }

  .breadcrumb a:hover {
    color: #2563eb;
  }

  .separator {
    color: #d1d5db;
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 0.5rem;
    }
    
    .unauthorized-container h1 {
      font-size: 1.5rem;
    }
    
    .unauthorized-container p {
      font-size: 1rem;
    }
  }
</style> 