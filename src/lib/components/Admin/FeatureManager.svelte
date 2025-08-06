<script lang="ts">
  import { 
    featureFlags, 
    updateFeatureFlag, 
    resetFeatureFlag,
    type FeatureFlags
  } from "$lib/store";
  
  import { Button } from "$lib/components/shadcn/button/index.ts";
  import * as Table from "$lib/components/shadcn/Table/index.ts";
  import * as Card from "$lib/components/shadcn/card/index.ts";
  import * as Switch from "$lib/components/shadcn/switch/index.ts";
  import { Badge } from "$lib/components/shadcn/badge/index.ts";
  
  import Settings from "lucide-svelte/icons/settings";
  import RotateCcw from "lucide-svelte/icons/rotate-ccw";
  import Eye from "lucide-svelte/icons/eye";
  import EyeOff from "lucide-svelte/icons/eye-off";
  import Search from "lucide-svelte/icons/search";
  
  export let title = "Feature Management";
  export let description = "Manage feature flags and their states";
  export let showUserPreferences = true;
  export let showAnalytics = false;
  export let compact = false;
  
  let flags: FeatureFlags = {};
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
  
  // Analytics data
  let analytics = {
    totalFeatures: 0,
    enabledFeatures: 0,
    userOverrides: 0
  };
  
  // Subscribe to stores
  featureFlags.subscribe(value => {
    flags = value;
    updateAnalytics();
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

<Card.Root>
  <Card.Header>
    <Card.Title class="flex items-center gap-2">
      <Settings class="w-5 h-5" />
      {title}
    </Card.Title>
    <Card.Description>
      {description}
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
                  {#if flag.description && !compact}
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