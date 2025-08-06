<script lang="ts">
  import { onMount } from "svelte";
  
  import { 
    featureFlags, 
    userFeaturePreferences, 
    updateFeatureFlag, 
    resetFeatureFlag,
    type FeatureFlags,
    type UserFeaturePreferences
  } from "$lib/store";
  
  import { Button } from "$lib/components/shadcn/button/index.ts";
  import * as Table from "$lib/components/shadcn/Table/index.ts";
  import * as Card from "$lib/components/shadcn/card/index.ts";
  import * as Tabs from "$lib/components/shadcn/tabs/index.ts";
  import * as Switch from "$lib/components/shadcn/switch/index.ts";
  import { Badge } from "$lib/components/shadcn/badge/index.ts";
  
  import Settings from "lucide-svelte/icons/settings";
  import Users from "lucide-svelte/icons/users";
  import BarChart3 from "lucide-svelte/icons/chart-no-axes-column";
  import RotateCcw from "lucide-svelte/icons/rotate-ccw";
  import Eye from "lucide-svelte/icons/eye";
  import EyeOff from "lucide-svelte/icons/eye-off";
  import Search from "lucide-svelte/icons/search";
  
  export let data;
  
  let flags: FeatureFlags = {};
  let userPrefs: UserFeaturePreferences = {};
  let searchTerm = "";
  let selectedCategory = "all";
  let showOnlyOverridden = false;
  let loading = false;
  let saveStatus = "";
  
  // Categories for filtering
  const categories = [
    { value: "all", label: "All Features" },
    { value: "widget", label: "Widgets" },
    { value: "action", label: "Actions" },
    { value: "news", label: "News Sources" },
    { value: "component", label: "Components" }
  ];
  
  // Analytics data (mock for now)
  let analytics = {
    totalFeatures: 0,
    enabledFeatures: 0,
    userOverrides: 0,
    mostUsedFeatures: []
  };
  
  onMount(() => {
    // Subscribe to stores
    const unsubscribeFlags = featureFlags.subscribe(value => {
      flags = value;
      updateAnalytics();
    });
    
    const unsubscribePrefs = userFeaturePreferences.subscribe(value => {
      userPrefs = value;
      updateAnalytics();
    });
    
    return () => {
      unsubscribeFlags();
      unsubscribePrefs();
    };
  });
  
  function updateAnalytics() {
    const flagEntries = Object.entries(flags);
    analytics.totalFeatures = flagEntries.length;
    analytics.enabledFeatures = flagEntries.filter(([_, flag]) => flag.enabled).length;
    analytics.userOverrides = flagEntries.filter(([_, flag]) => flag.userOverride !== undefined).length;
  }
  
  function getFilteredFlags() {
    let filtered = Object.entries(flags);
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(([_, flag]) => 
        flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(([_, flag]) => flag.category === selectedCategory);
    }
    
    // Filter by overridden
    if (showOnlyOverridden) {
      filtered = filtered.filter(([_, flag]) => flag.userOverride !== undefined);
    }
    
    return filtered;
  }
  
  async function handleToggleFlag(flagName: string, enabled: boolean, isUserOverride = false) {
    loading = true;
    try {
      updateFeatureFlag(flagName, enabled, isUserOverride);
      saveStatus = "Feature updated successfully";
      setTimeout(() => saveStatus = "", 3000);
    } catch (error) {
      saveStatus = "Error updating feature";
      console.error("Error updating feature flag:", error);
    } finally {
      loading = false;
    }
  }
  
  async function handleResetFlag(flagName: string) {
    loading = true;
    try {
      resetFeatureFlag(flagName);
      saveStatus = "Feature reset to default";
      setTimeout(() => saveStatus = "", 3000);
    } catch (error) {
      saveStatus = "Error resetting feature";
      console.error("Error resetting feature flag:", error);
    } finally {
      loading = false;
    }
  }
  
  async function handleBulkToggle(enabled: boolean) {
    loading = true;
    try {
      const filteredFlags = getFilteredFlags();
      for (const [flagName, _] of filteredFlags) {
        updateFeatureFlag(flagName, enabled, false);
      }
      saveStatus = `Bulk ${enabled ? 'enabled' : 'disabled'} ${filteredFlags.length} features`;
      setTimeout(() => saveStatus = "", 3000);
    } catch (error) {
      saveStatus = "Error in bulk operation";
      console.error("Error in bulk operation:", error);
    } finally {
      loading = false;
    }
  }
  
  function getCategoryColor(category: string) {
    switch (category) {
      case "widget": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "action": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "news": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "component": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  }
</script>

<svelte:head>
  <title>Admin - Feature Management | StockNear</title>
  <meta name="description" content="Admin interface for managing feature flags and user preferences" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-4">
      <Settings class="w-8 h-8 text-primary" />
      <h1 class="text-3xl font-bold">Feature Management</h1>
    </div>
    <p class="text-muted-foreground">
      Manage feature flags, user preferences, and monitor feature usage analytics.
    </p>
  </div>

  <!-- Analytics Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <Card.Root>
      <Card.Header class="pb-2">
        <Card.Title class="text-sm font-medium">Total Features</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{analytics.totalFeatures}</div>
      </Card.Content>
    </Card.Root>
    
    <Card.Root>
      <Card.Header class="pb-2">
        <Card.Title class="text-sm font-medium">Enabled Features</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold text-green-600">{analytics.enabledFeatures}</div>
      </Card.Content>
    </Card.Root>
    
    <Card.Root>
      <Card.Header class="pb-2">
        <Card.Title class="text-sm font-medium">User Overrides</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold text-blue-600">{analytics.userOverrides}</div>
      </Card.Content>
    </Card.Root>
    
    <Card.Root>
      <Card.Header class="pb-2">
        <Card.Title class="text-sm font-medium">Enable Rate</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">
          {analytics.totalFeatures > 0 ? Math.round((analytics.enabledFeatures / analytics.totalFeatures) * 100) : 0}%
        </div>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Main Content -->
  <Tabs.Root value="features" class="w-full">
    <Tabs.List class="grid w-full grid-cols-3">
      <Tabs.Trigger value="features" class="flex items-center gap-2">
        <Settings class="w-4 h-4" />
        Features
      </Tabs.Trigger>
      <Tabs.Trigger value="users" class="flex items-center gap-2">
        <Users class="w-4 h-4" />
        User Preferences
      </Tabs.Trigger>
      <Tabs.Trigger value="analytics" class="flex items-center gap-2">
        <BarChart3 class="w-4 h-4" />
        Analytics
      </Tabs.Trigger>
    </Tabs.List>

    <!-- Features Tab -->
    <Tabs.Content value="features" class="mt-6">
      <Card.Root>
        <Card.Header>
          <Card.Title>Feature Flags</Card.Title>
          <Card.Description>
            Manage feature flags and their default states. User overrides are shown with a different indicator.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-4 mb-6">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search features..."
                bind:value={searchTerm}
                class="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
              />
            </div>
            
            <select
              bind:value={selectedCategory}
              class="px-3 py-2 border rounded-md bg-background"
            >
              {#each categories as category}
                <option value={category.value}>{category.label}</option>
              {/each}
            </select>
            
            <label class="flex items-center gap-2">
              <Switch.Root
                bind:checked={showOnlyOverridden}
                class="w-6 h-6"
              />
              <span class="text-sm">Show overridden only</span>
            </label>
          </div>

          <!-- Bulk Actions -->
          <div class="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              on:click={() => handleBulkToggle(true)}
              disabled={loading}
            >
              <Eye class="w-4 h-4 mr-2" />
              Enable All
            </Button>
            <Button
              variant="outline"
              size="sm"
              on:click={() => handleBulkToggle(false)}
              disabled={loading}
            >
              <EyeOff class="w-4 h-4 mr-2" />
              Disable All
            </Button>
          </div>

          <!-- Status Message -->
          {#if saveStatus}
            <div class="mb-4 p-3 bg-green-100 text-green-800 rounded-md dark:bg-green-900 dark:text-green-200">
              {saveStatus}
            </div>
          {/if}

          <!-- Features Table -->
          <div class="border rounded-lg">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Feature</Table.Head>
                  <Table.Head>Category</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Default</Table.Head>
                  <Table.Head class="text-right">Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {#each getFilteredFlags() as [flagName, flag]}
                  <Table.Row>
                    <Table.Cell>
                      <div>
                        <div class="font-medium">{flag.name}</div>
                        {#if flag.description}
                          <div class="text-sm text-muted-foreground">{flag.description}</div>
                        {/if}
                      </div>
                    </Table.Cell>
                                         <Table.Cell>
                       <Badge class={getCategoryColor(flag.category)}>
                         {flag.category}
                       </Badge>
                     </Table.Cell>
                    <Table.Cell>
                      <div class="flex items-center gap-2">
                        <Switch.Root
                          checked={flag.enabled}
                          onCheckedChange={(checked) => handleToggleFlag(flagName, checked)}
                          disabled={loading}
                        />
                                                 {#if flag.userOverride !== undefined}
                           <Badge variant="secondary" class="text-xs">
                             Override
                           </Badge>
                         {/if}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div class="flex items-center gap-2">
                        <Switch.Root
                          checked={flag.defaultValue}
                          disabled
                        />
                        <span class="text-sm text-muted-foreground">Default</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell class="text-right">
                      <div class="flex gap-2 justify-end">
                        {#if flag.userOverride !== undefined}
                          <Button
                            variant="outline"
                            size="sm"
                            on:click={() => handleResetFlag(flagName)}
                            disabled={loading}
                          >
                            <RotateCcw class="w-4 h-4" />
                          </Button>
                        {/if}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                {/each}
              </Table.Body>
            </Table.Root>
          </div>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- User Preferences Tab -->
    <Tabs.Content value="users" class="mt-6">
      <Card.Root>
        <Card.Header>
          <Card.Title>User Preferences</Card.Title>
          <Card.Description>
            View and manage user-specific feature overrides.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {#if Object.keys(userPrefs).length === 0}
            <div class="text-center py-8 text-muted-foreground">
              No user preferences found
            </div>
          {:else}
            <div class="border rounded-lg">
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Feature</Table.Head>
                    <Table.Head>User Preference</Table.Head>
                    <Table.Head>Default</Table.Head>
                    <Table.Head class="text-right">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {#each Object.entries(userPrefs) as [flagName, userPref]}
                    {@const flag = flags[flagName]}
                    {#if flag}
                      <Table.Row>
                        <Table.Cell>
                          <div>
                            <div class="font-medium">{flag.name}</div>
                            {#if flag.description}
                              <div class="text-sm text-muted-foreground">{flag.description}</div>
                            {/if}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div class="flex items-center gap-2">
                            <Switch.Root
                              checked={userPref}
                              onCheckedChange={(checked) => handleToggleFlag(flagName, checked, true)}
                              disabled={loading}
                            />
                                                       <Badge variant="secondary" class="text-xs">
                             Override
                           </Badge>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div class="flex items-center gap-2">
                            <Switch.Root
                              checked={flag.defaultValue}
                              disabled
                            />
                            <span class="text-sm text-muted-foreground">Default</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell class="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            on:click={() => handleResetFlag(flagName)}
                            disabled={loading}
                          >
                            <RotateCcw class="w-4 h-4" />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    {/if}
                  {/each}
                </Table.Body>
              </Table.Root>
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Analytics Tab -->
    <Tabs.Content value="analytics" class="mt-6">
      <Card.Root>
        <Card.Header>
          <Card.Title>Feature Analytics</Card.Title>
          <Card.Description>
            Monitor feature usage and performance metrics.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Category Breakdown -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Feature Categories</h3>
              <div class="space-y-3">
                {#each categories.filter(c => c.value !== "all") as category}
                  {@const categoryFlags = Object.values(flags).filter(f => f.category === category.value)}
                  {@const enabledCount = categoryFlags.filter(f => f.enabled).length}
                  {@const totalCount = categoryFlags.length}
                  {#if totalCount > 0}
                    <div class="flex justify-between items-center">
                      <span class="text-sm">{category.label}</span>
                      <span class="text-sm font-medium">
                        {enabledCount}/{totalCount} ({Math.round((enabledCount / totalCount) * 100)}%)
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        class="bg-blue-600 h-2 rounded-full" 
                        style="width: {(enabledCount / totalCount) * 100}%"
                      ></div>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>

            <!-- Recent Activity -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
              <div class="space-y-3">
                <div class="text-sm text-muted-foreground">
                  Feature analytics dashboard coming soon...
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>
</div> 