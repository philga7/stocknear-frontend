<script>
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";
  import { toast } from "svelte-sonner";
  import { mode } from "mode-watcher";
  import ArrowUp from "lucide-svelte/icons/trending-up";
  import ArrowDown from "lucide-svelte/icons/trending-down";
  import News from "lucide-svelte/icons/newspaper";
  import AnalystReport from "lucide-svelte/icons/file-chart-column-increasing";
  import UpcomingEarnings from "lucide-svelte/icons/send-horizontal";
  import RecentEarnings from "lucide-svelte/icons/chart-no-axes-combined";
  import EconomicCalendar from "lucide-svelte/icons/loader";
  import OptionsFlow from "lucide-svelte/icons/waves";
  import DarkPool from "lucide-svelte/icons/venetian-mask";
  import Settings from "lucide-svelte/icons/settings";
  import Search from "lucide-svelte/icons/search";
  import Filter from "lucide-svelte/icons/filter";

  export let data;
  
  // Tab management
  let activeTab = "widgets";
  
  // Mock team item data with gradient avatar colors
  const initialAvailableWidgets = [
    {
      id: "gainers",
      name: "Top Gainers",
      key: "gainers",
      description: "Stocks with the highest % Change for today",
      category: "Dashboard"
    },
    {
      id: "losers",
      name: "Top Losers",
      description: "Stocks with the lowest % Change for today",
      category: "Dashboard"
    },
    {
      id: "wiim",
      name: "Stock & Market News",
      description: "Understand why priced moved in realtime",
      category: "News"
    },
    {
      id: "analystReport",
      name: "Analyst Insight Report",
      description:
        "Latest Analyst report summarized to get the most valueable insights.",
      category: "Dashboard"
    },
    {
      id: "upcomingEarnings",
      name: "Upcoming Earnings",
      description: "The latest upcoming earnings for today.",
      category: "Dashboard"
    },
    {
      id: "recentEarnings",
      name: "Recent Earnings",
      description: "The latest recent earnings for today.",
      category: "Dashboard"
    },
    {
      id: "economicCalendar",
      name: "Economic Calendar",
      description: "Latest Economic Events for the US.",
      category: "News"
    },
    {
      id: "optionsFlow",
      name: "Options Flow Order",
      description: "Realtime Unusual Options Flow Orders from big whales.",
      category: "Actions"
    },
    {
      id: "darkpool",
      name: "Dark Pool Order",
      description: "Realtime Unusual Dark Pool Orders from big whales.",
      category: "Actions"
    },
  ];

  // Feature flags data
  const initialAvailableFeatures = [
    {
      id: "realTimeAlerts",
      name: "Real-time Price Alerts",
      description: "Get instant notifications for price movements",
      category: "Actions",
      enabled: true
    },
    {
      id: "advancedCharts",
      name: "Advanced Charting",
      description: "Access to professional charting tools",
      category: "Dashboard",
      enabled: true
    },
    {
      id: "socialSentiment",
      name: "Social Sentiment Analysis",
      description: "Track social media sentiment for stocks",
      category: "News",
      enabled: false
    },
    {
      id: "insiderTrading",
      name: "Insider Trading Alerts",
      description: "Monitor insider trading activities",
      category: "Actions",
      enabled: false
    },
    {
      id: "aiPredictions",
      name: "AI Price Predictions",
      description: "AI-powered stock price predictions",
      category: "Dashboard",
      enabled: true
    },
    {
      id: "optionsCalculator",
      name: "Options Calculator",
      description: "Advanced options pricing calculator",
      category: "Actions",
      enabled: false
    },
    {
      id: "portfolioTracking",
      name: "Portfolio Tracking",
      description: "Track your investment portfolio",
      category: "Dashboard",
      enabled: true
    },
    {
      id: "earningsCalendar",
      name: "Earnings Calendar",
      description: "Comprehensive earnings calendar",
      category: "News",
      enabled: false
    }
  ];

  let defaultWidgets = [
    "gainers",
    "losers",
    "wiim",
    "analystReport",
    "upcomingEarnings",
    "recentEarnings",
  ];

  // Fix applied here: If data?.getCustomSettings is null, undefined, or an empty array,
  // selectedWidgets will be initialized with the widgets corresponding to the ids in defaultWidgets.
  // Otherwise, it will use the value from data?.getCustomSettings.
  let selectedWidgets =
    data?.getCustomSettings && data.getCustomSettings.length > 0
      ? data.getCustomSettings
      : initialAvailableWidgets?.filter((item) =>
          defaultWidgets.includes(item.id),
        );

  // Feature management
  let selectedFeatures = data?.getFeatureSettings || initialAvailableFeatures.filter(f => f.enabled);
  let availableFeatures = initialAvailableFeatures.filter(f => !selectedFeatures.some(sf => sf.id === f.id));

  // Search and filter functionality
  let searchTerm = "";
  let selectedCategory = "all";

  // Create a Set of widget names that are selected or default
  // This part of the logic is now simplified as selectedWidgets is correctly initialized
  const selectedWidgetIds = new Set(selectedWidgets?.map((w) => w?.id));

  // Filter available widgets
  // Available widgets are those from initialAvailableWidgets whose ids are NOT in selectedWidgetIds
  let availableWidgets = initialAvailableWidgets?.filter((item) => {
    return !selectedWidgetIds?.has(item?.id);
  });

  // Filter functions for search and category
  $: filteredAvailableWidgets = availableWidgets?.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  $: filteredAvailableFeatures = availableFeatures?.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Note: The original code also attempted to push items into selectedWidgets within the filter loop.
  // With the corrected initialization of selectedWidgets, this is no longer necessary
  // and has been removed for clarity and correctness.
  async function handleSaveSettings() {
    if (activeTab === "widgets") {
      if (selectedWidgets?.length < 2) {
        toast.error("At least two widget is required!");
        return;
      }
      if (selectedWidgets?.length > 10) {
        toast.error("You can select up to 8 widgets only.");
        return;
      }
      const postData = {
        selectedWidgets,
      };
      // build the promise that does the work
      const savePromise = fetch("/api/custom-dashboard-widget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      }).then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      });

      // show toast while promise is pending
      toast.promise(
        savePromise,
        {
          loading: "Saving Custom Settings...",
          success: () => {
            // you can trigger any additional UI feedback here,
            // or just return an empty string if you don't want a second toast
            return "Settings Saved!";
          },
          error: "Something went wrong. Please try again later!",
        },
        {
          style: {
            borderRadius: "5px",
            background: "#fff",
            color: "#000",
            borderColor: $mode === "light" ? "#F9FAFB" : "#4B5563",
            fontSize: "15px",
          },
        },
      );
    } else {
      // Save feature settings
      const postData = {
        selectedFeatures,
      };
      const savePromise = fetch("/api/custom-feature-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      }).then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      });

      toast.promise(
        savePromise,
        {
          loading: "Saving Feature Settings...",
          success: () => {
            return "Feature Settings Saved!";
          },
          error: "Something went wrong. Please try again later!",
        },
        {
          style: {
            borderRadius: "5px",
            background: "#fff",
            color: "#000",
            borderColor: $mode === "light" ? "#F9FAFB" : "#4B5563",
            fontSize: "15px",
          },
        },
      );
    }
  }

  function handleDefaultSettings() {
    if (activeTab === "widgets") {
      defaultWidgets = [
        "gainers",
        "losers",
        "wiim",
        "analystReport",
        "upcomingEarnings",
        "recentEarnings",
      ];

      selectedWidgets = [];
      const defaultWidgetSet = new Set(defaultWidgets);

      availableWidgets = initialAvailableWidgets?.filter((item) => {
        if (defaultWidgetSet?.has(item.id)) {
          selectedWidgets?.push(item);
          return false; // remove from availableWidgets
        }
        return true; // keep in availableWidgets
      });
    } else {
      // Reset feature settings to default
      selectedFeatures = initialAvailableFeatures.filter(f => f.enabled);
      availableFeatures = initialAvailableFeatures.filter(f => !f.enabled);
    }
  }

  function toggleFeature(feature) {
    if (selectedFeatures.some(sf => sf.id === feature.id)) {
      // Remove from selected
      selectedFeatures = selectedFeatures.filter(sf => sf.id !== feature.id);
      availableFeatures = [...availableFeatures, { ...feature, enabled: false }];
    } else {
      // Add to selected
      availableFeatures = availableFeatures.filter(af => af.id !== feature.id);
      selectedFeatures = [...selectedFeatures, { ...feature, enabled: true }];
    }
  }

  const flipDurationMs = 300;
  const groupType = "items";

  function handleDndConsider(e, target) {
    const { items, info } = e.detail;

    // Cross-zone drag: move item between arrays
    if (info.trigger === "drop" && info.destination !== info.source) {
      const moved = items.find(
        (i) =>
          !(target === "available"
            ? selectedWidgets.some((s) => s.id === i.id)
            : availableWidgets.some((a) => a.id === i.id)),
      );

      if (moved) {
        // **NEW GUARD**: don't allow removing the last widget
        if (target === "available" && selectedWidgets.length <= 1) {
          toast.error("At least one widget is needed");
          return; // abort the drop
        }

        if (target === "selected") {
          availableWidgets = availableWidgets.filter((m) => m.id !== moved.id);
          selectedWidgets = [...selectedWidgets, moved];
        } else {
          selectedWidgets = selectedWidgets.filter((m) => m.id !== moved.id);
          availableWidgets = [...availableWidgets, moved];
        }
        return;
      }
    }

    // Same-zone reorder
    if (target === "available") availableWidgets = items;
    else selectedWidgets = items;
  }

  function handleDndFinalize(e, target) {
    handleDndConsider(e, target);
  }
</script>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
      <li class="text-muted dark:text-gray-300">Customization</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="mb-6 border-[#2C6288] dark:border-white border-b-[2px]">
            <h1 class="mb-1 text-2xl sm:text-3xl font-bold">
              Custom Dashboard
            </h1>
          </div>

          <!-- Tab Navigation -->
          <div class="mb-6">
            <div class="border-b border-gray-200 dark:border-gray-700">
              <nav class="-mb-px flex space-x-8">
                <button
                  class="py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 {activeTab === 'widgets' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
                  on:click={() => activeTab = 'widgets'}
                >
                  Widgets
                </button>
                <button
                  class="py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 {activeTab === 'features' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
                  on:click={() => activeTab = 'features'}
                >
                  <Settings class="w-4 h-4 inline mr-1" />
                  Features
                </button>
              </nav>
            </div>
          </div>

          <div
            class="w-full flex flex-row items-center justify-center sm:justify-end"
          >
            <button
              type="button"
              on:click={handleSaveSettings}
              class="w-full sm:w-fit cursor-pointer sm:ml-auto align-middle inline-flex items-center gap-x-1.5 rounded px-2.5 py-2 text-sm font-semibold shadow-xs border-gray-300 dark:border-gray-600 border sm:hover:bg-gray-200 dark:sm:hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-none transition duration-150 ease-in-out whitespace-nowrap"
            >
              <svg
                class="w-3.5 h-3.5 inline-block cursor-pointer shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                ><path
                  fill="currentColor"
                  d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327l4.898.696c.441.062.612.636.282.95l-3.522 3.356l.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
                /></svg
              >
              Save {activeTab === 'widgets' ? 'Custom' : 'Features'}
            </button>

            <button
              type="button"
              on:click={handleDefaultSettings}
              class="w-full sm:w-fit cursor-pointer ml-3 align-middle inline-flex items-center gap-x-1.5 rounded px-2.5 py-2 text-sm font-semibold shadow-xs border-gray-300 dark:border-gray-600 border sm:hover:bg-gray-200 dark:sm:hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-none transition duration-150 ease-in-out whitespace-nowrap"
            >
              <svg
                class="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 21 21"
                ><g
                  fill="none"
                  fill-rule="evenodd"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><path d="M3.578 6.487A8 8 0 1 1 2.5 10.5" /><path
                    d="M7.5 6.5h-4v-4"
                  /></g
                ></svg>
              >
              Default Settings
            </button>
          </div>

          <!-- Search and Filter -->
          <div class="mb-6 flex flex-col sm:flex-row gap-4">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                bind:value={searchTerm}
                placeholder="Search {activeTab === 'widgets' ? 'widgets' : 'features'}..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div class="relative">
              <Filter class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                bind:value={selectedCategory}
                class="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="Dashboard">Dashboard</option>
                <option value="Actions">Actions</option>
                <option value="News">News</option>
              </select>
            </div>
          </div>

          <div class="mt-5">
            {#if activeTab === 'widgets'}
              <!-- Widgets Tab -->
              <div class="flex flex-col sm:flex-row items-start gap-8">
                <!-- Available Widgets -->
                <div class="flex-1 rounded shadow-xs">
                  <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">Available Widgets</h2>
                    <div class="relative flex-shrink-0">
                      <span
                        class="bg-blue-100 dark:bg-[#2A2E39] dark:text-white text-blue-800 w-6 h-6 flex items-center justify-center rounded-full text-sm"
                      >
                        {filteredAvailableWidgets?.length}
                      </span>
                    </div>
                  </div>

                  <div
                    use:dndzone={{
                      items: filteredAvailableWidgets,
                      flipDurationMs,
                      type: groupType,
                    }}
                    on:consider={(e) => handleDndConsider(e, "available")}
                    on:finalize={(e) => handleDndFinalize(e, "available")}
                    class="space-y-4 min-h-[10rem] max-h-[500px] sm:max-h-[700px] overflow-y-auto border border-gray-300 dark:border-gray-800 rounded p-4"
                    class:flex={filteredAvailableWidgets?.length === 0}
                    class:items-center={filteredAvailableWidgets?.length === 0}
                    class:justify-center={filteredAvailableWidgets?.length === 0}
                  >
                    {#if filteredAvailableWidgets.length === 0}
                      <p class="text-gray-700 dark:text-gray-400">
                        Drop Dashboard Widgets here
                      </p>
                    {/if}
                    {#each filteredAvailableWidgets as item (item.id)}
                      <div
                        animate:flip={{ duration: flipDurationMs }}
                        class="border border-gray-200 dark:border-gray-800 rounded p-4 shadow-xs"
                      >
                        <div class="flex items-center space-x-4">
                          <div
                            class="relative border border-gray-300 dark:border-gray-600 rounded-full h-8 w-8 flex items-center justify-center"
                          >
                            {#if item?.id === "gainers"}
                              <ArrowUp class="w-5 h-5" />
                            {:else if item?.id === "losers"}
                              <ArrowDown class="w-5 h-5" />
                            {:else if item?.id === "wiim"}
                              <News class="w-5 h-5" />
                            {:else if item?.id === "analystReport"}
                              <AnalystReport class="w-5 h-5" />
                            {:else if item?.id === "upcomingEarnings"}
                              <UpcomingEarnings class="w-5 h-5" />
                            {:else if item?.id === "recentEarnings"}
                              <RecentEarnings class="w-5 h-5" />
                            {:else if item?.id === "economicCalendar"}
                              <EconomicCalendar class="w-5 h-5" />
                            {:else if item?.id === "optionsFlow"}
                              <OptionsFlow class="w-5 h-5" />
                            {:else if item?.id === "darkpool"}
                              <DarkPool class="w-5 h-5" />
                            {/if}
                          </div>

                          <div class="flex-1">
                            <h3 class="font-medium">{item.name}</h3>
                            <p class="text-gray-600 dark:text-gray-300 text-sm">
                              {item.description}
                            </p>
                            <span class="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>

                <!-- Selected items -->
                <div class="flex-1 rounded shadow-xs">
                  <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">Selected Widgets</h2>
                    <div class="relative flex-shrink-0">
                      <span
                        class="bg-blue-100 dark:bg-[#2A2E39] dark:text-white text-blue-800 w-6 h-6 flex items-center justify-center rounded-full text-sm"
                      >
                        {selectedWidgets?.length}
                      </span>
                    </div>
                  </div>

                  <div
                    use:dndzone={{
                      items: selectedWidgets,
                      flipDurationMs,
                      type: groupType,
                    }}
                    on:consider={(e) => handleDndConsider(e, "selected")}
                    on:finalize={(e) => handleDndFinalize(e, "selected")}
                    class="space-y-4 min-h-[10rem] border-2 border-dashed border-gray-300 dark:border-gray-800 rounded p-4"
                    class:flex={selectedWidgets.length === 0}
                    class:items-center={selectedWidgets.length === 0}
                    class:justify-center={selectedWidgets.length === 0}
                  >
                    {#if selectedWidgets.length === 0}
                      <p class="text-gray-700 dark:text-gray-400">
                        Drop Dashboard Widgets here
                      </p>
                    {:else}
                      {#each selectedWidgets as item (item.id)}
                        <div
                          animate:flip={{ duration: flipDurationMs }}
                          class="border border-gray-200 dark:border-gray-800 rounded p-4 shadow-xs"
                        >
                          <div class="flex items-center space-x-4">
                            <div
                              class="relative border border-gray-300 dark:border-gray-600 rounded-full h-8 w-8 flex items-center justify-center"
                            >
                              {#if item?.id === "gainers"}
                                <ArrowUp class="w-5 h-5" />
                              {:else if item?.id === "losers"}
                                <ArrowDown class="w-5 h-5" />
                              {:else if item?.id === "wiim"}
                                <News class="w-5 h-5" />
                              {:else if item?.id === "analystReport"}
                                <AnalystReport class="w-5 h-5" />
                              {:else if item?.id === "upcomingEarnings"}
                                <UpcomingEarnings class="w-5 h-5" />
                              {:else if item?.id === "recentEarnings"}
                                <RecentEarnings class="w-5 h-5" />
                              {:else if item?.id === "economicCalendar"}
                                <EconomicCalendar class="w-5 h-5" />
                              {:else if item?.id === "optionsFlow"}
                                <OptionsFlow class="w-5 h-5" />
                              {:else if item?.id === "darkpool"}
                                <DarkPool class="w-5 h-5" />
                              {/if}
                            </div>
                            <div class="flex-1">
                              <h3 class="font-medium">{item.name}</h3>
                              <p class="text-gray-600 dark:text-gray-300 text-sm">
                                {item.description}
                              </p>
                              <span class="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                {item.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      {/each}
                    {/if}
                  </div>
                </div>
              </div>
            {:else}
              <!-- Features Tab -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Available Features -->
                <div class="rounded shadow-xs">
                  <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">Available Features</h2>
                    <div class="relative flex-shrink-0">
                      <span
                        class="bg-blue-100 dark:bg-[#2A2E39] dark:text-white text-blue-800 w-6 h-6 flex items-center justify-center rounded-full text-sm"
                      >
                        {filteredAvailableFeatures?.length}
                      </span>
                    </div>
                  </div>

                  <div class="space-y-4 max-h-[600px] overflow-y-auto border border-gray-300 dark:border-gray-800 rounded p-4">
                    {#if filteredAvailableFeatures.length === 0}
                      <p class="text-gray-700 dark:text-gray-400 text-center py-8">
                        No available features match your search
                      </p>
                    {:else}
                      {#each filteredAvailableFeatures as feature (feature.id)}
                        <div class="border border-gray-200 dark:border-gray-800 rounded p-4 shadow-xs">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                              <div class="relative border border-gray-300 dark:border-gray-600 rounded-full h-8 w-8 flex items-center justify-center">
                                <Settings class="w-5 h-5" />
                              </div>
                              <div class="flex-1">
                                <h3 class="font-medium">{feature.name}</h3>
                                <p class="text-gray-600 dark:text-gray-300 text-sm">
                                  {feature.description}
                                </p>
                                <span class="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                  {feature.category}
                                </span>
                              </div>
                            </div>
                            <button
                              on:click={() => toggleFeature(feature)}
                              class="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-200"
                            >
                              Enable
                            </button>
                          </div>
                        </div>
                      {/each}
                    {/if}
                  </div>
                </div>

                <!-- Enabled Features -->
                <div class="rounded shadow-xs">
                  <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">Enabled Features</h2>
                    <div class="relative flex-shrink-0">
                      <span
                        class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 w-6 h-6 flex items-center justify-center rounded-full text-sm"
                      >
                        {selectedFeatures?.length}
                      </span>
                    </div>
                  </div>

                  <div class="space-y-4 max-h-[600px] overflow-y-auto border-2 border-dashed border-green-300 dark:border-green-700 rounded p-4">
                    {#if selectedFeatures.length === 0}
                      <p class="text-gray-700 dark:text-gray-400 text-center py-8">
                        No features enabled
                      </p>
                    {:else}
                      {#each selectedFeatures as feature (feature.id)}
                        <div class="border border-green-200 dark:border-green-800 rounded p-4 shadow-xs bg-green-50 dark:bg-green-900/20">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                              <div class="relative border border-green-300 dark:border-green-600 rounded-full h-8 w-8 flex items-center justify-center bg-green-100 dark:bg-green-800">
                                <Settings class="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div class="flex-1">
                                <h3 class="font-medium">{feature.name}</h3>
                                <p class="text-gray-600 dark:text-gray-300 text-sm">
                                  {feature.description}
                                </p>
                                <span class="inline-block mt-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 rounded">
                                  {feature.category}
                                </span>
                              </div>
                            </div>
                            <button
                              on:click={() => toggleFeature(feature)}
                              class="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                            >
                              Disable
                            </button>
                          </div>
                        </div>
                      {/each}
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
