<script lang="ts">
  import { featureFlags, isFeatureEnabled } from '$lib/store';
  import { onMount } from 'svelte';
  import { trackFeatureView, trackFeatureError } from '$lib/features/analytics';



  // Component props
  export let featureName: string;
  export let fallbackContent: string | null = null;
  export let showLoadingState = true;
  export let loadingText = 'Loading feature...';
  export let disabledText = 'This feature is currently disabled';
  export let errorText = 'An error occurred while loading this feature';
  export let className = '';
  export let disabledClassName = 'opacity-50 pointer-events-none';
  export let loadingClassName = 'animate-pulse';
  export let errorClassName = 'text-red-600 dark:text-red-400';

  // Internal state
  let isEnabled = false;
  let isLoading = true;
  let hasError = false;
  let error: Error | null = null;

  // Reactive statement to check feature flag status
  $: {
    try {
      isEnabled = isFeatureEnabled(featureName, $featureFlags);
      isLoading = false;
      hasError = false;
      error = null;
    } catch (err) {
      hasError = true;
      error = err instanceof Error ? err : new Error('Unknown error');
      isLoading = false;
    }
  }

  // Lifecycle
  onMount(() => {
    // Track feature view when component mounts
    if (isEnabled) {
      trackFeatureView(featureName);
    }

    // Subscribe to feature flags changes
    const unsubscribe = featureFlags.subscribe(() => {
      try {
        const wasEnabled = isEnabled;
        isEnabled = isFeatureEnabled(featureName, $featureFlags);
        isLoading = false;
        hasError = false;
        error = null;

        // Track feature state changes
        if (isEnabled && !wasEnabled) {
          trackFeatureView(featureName);
        }
      } catch (err) {
        hasError = true;
        error = err instanceof Error ? err : new Error('Unknown error');
        isLoading = false;
        
        // Track feature errors
        trackFeatureError(featureName, error);
      }
    });

    return unsubscribe;
  });



  // Computed classes
  $: wrapperClasses = [
    className,
    !isEnabled && !isLoading && !hasError ? disabledClassName : '',
    isLoading ? loadingClassName : '',
    hasError ? errorClassName : ''
  ].filter(Boolean).join(' ');

  // Accessibility attributes
  $: ariaAttributes = {
    'aria-hidden': !isEnabled && !isLoading && !hasError,
    'aria-busy': isLoading,
    'aria-live': 'polite' as const,
    'role': 'region',
    'aria-label': `Feature: ${featureName}`
  };
</script>

<div 
  class={wrapperClasses}
  {...ariaAttributes}
>
  {#if isLoading && showLoadingState}
    <div class="flex items-center justify-center p-4 text-muted dark:text-gray-400">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      <span>{loadingText}</span>
    </div>
  {:else if hasError}
    <div class="p-4 border border-red-200 dark:border-red-800 rounded-md bg-red-50 dark:bg-red-900/20">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <span class="text-sm font-medium">{errorText}</span>
      </div>
      {#if error}
        <details class="mt-2 text-xs text-red-600 dark:text-red-400">
          <summary class="cursor-pointer">Show error details</summary>
          <pre class="mt-1 p-2 bg-red-100 dark:bg-red-900/40 rounded text-xs overflow-auto">{error.message}</pre>
        </details>
      {/if}
    </div>
  {:else if isEnabled}
    <!-- Feature is enabled, render the content -->
    <slot />
  {:else}
    <!-- Feature is disabled, show fallback or disabled message -->
    {#if fallbackContent}
      <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-sm text-gray-600 dark:text-gray-400">{fallbackContent}</span>
        </div>
      </div>
    {:else}
      <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-sm text-gray-600 dark:text-gray-400">{disabledText}</span>
        </div>
      </div>
    {/if}
  {/if}
</div> 