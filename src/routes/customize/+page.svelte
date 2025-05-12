<script>
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";

  export let data;
  // Mock team member data with gradient avatar colors
  const initialAvailableWidgets = [
    {
      id: "1",
      name: "Market Movers",
      role: "Top Gainers and Losers",
      color: "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500",
    },
    {
      id: "2",
      name: "Stock & Market News",
      role: "Understand why priced moved in realtime",
      color: "bg-gradient-to-br from-yellow-500 via-green-500 to-green-400",
    },
    {
      id: "3",
      name: "Analyst Insight Report",
      role: "Latest Analyst report summarized to get the most valueable insights.",
      color: "bg-gradient-to-br from-red-500 via-yellow-500 to-green-500",
    },
    {
      id: "4",
      name: "Upcoming Earnings",
      role: "The latest upcoming earnings for today.",
      color: "bg-gradient-to-br from-green-500 via-teal-500 to-blue-500",
    },
    {
      id: "5",
      name: "Recent Earnings",
      role: "The latest recent earnings for today.",
      color: "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500",
    },
    {
      id: "6",
      name: "Economic Calendar",
      role: "Latest Economic Events for the US.",
      color: "bg-gradient-to-br from-red-500 via-yellow-500 to-green-500",
    },
    {
      id: "7",
      name: "Options Flow Order",
      role: "Realtime Unusual Options Flow Orders from big whales.",
      color: "bg-gradient-to-br from-red-500 via-yellow-500 to-green-500",
    },
    {
      id: "8",
      name: "Dark Pool Order",
      role: "Realtime Unusual Dark Pool Orders from big whales.",
      color: "bg-gradient-to-br from-red-500 via-yellow-500 to-green-500",
    },
  ];

  let defaultWidgets = [
    "Market Movers",
    "Stock & Market News",
    "Analyst Insight Report",
    "Upcoming Earnings",
    "Recent Earnings",
  ];

  let selectedWidgets = [];
  const defaultWidgetSet = new Set(defaultWidgets);

  let availableWidgets = initialAvailableWidgets?.filter((item) => {
    if (defaultWidgetSet?.has(item.name)) {
      selectedWidgets?.push(item);
      return false; // remove from availableWidgets
    }
    return true; // keep in availableWidgets
  });

  const flipDurationMs = 300;
  const groupType = "members";

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
              Customize Stocknear
            </h1>
          </div>

          <div class="">
            <div class="flex flex-col sm:flex-row items-start gap-8">
              <!-- Available Members -->
              <div class="flex-1 rounded shadow-sm">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-xl font-bold">Available Widgets</h2>
                  <span
                    class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >{availableWidgets?.length}</span
                  >
                </div>

                <div
                  use:dndzone={{
                    items: availableWidgets,
                    flipDurationMs,
                    type: groupType,
                  }}
                  on:consider={(e) => handleDndConsider(e, "available")}
                  on:finalize={(e) => handleDndFinalize(e, "available")}
                  class="space-y-4"
                >
                  {#each availableWidgets as member (member.id)}
                    <div
                      animate:flip={{ duration: flipDurationMs }}
                      class="border border-gray-200 dark:border-gray-800 rounded p-4 shadow-sm"
                    >
                      <div class="flex items-center space-x-4">
                        <div class="relative">
                          <div
                            class="{member.color} w-8 h-8 rounded-full flex items-center justify-center"
                          ></div>
                        </div>
                        <div>
                          <h3 class="font-medium">{member.name}</h3>
                          <p class="text-gray-500 dark:text-gray-300 text-sm">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>

              <!-- Selected Members -->
              <div class="flex-1 rounded shadow-sm">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-xl font-bold">Selected Widgets</h2>
                  <span
                    class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >{selectedWidgets.length}</span
                  >
                </div>

                <div
                  use:dndzone={{
                    items: selectedWidgets,
                    flipDurationMs,
                    type: groupType,
                  }}
                  on:consider={(e) => handleDndConsider(e, "selected")}
                  on:finalize={(e) => handleDndFinalize(e, "selected")}
                  class="space-y-4 min-h-[10rem] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded p-4"
                  class:flex={selectedWidgets.length === 0}
                  class:items-center={selectedWidgets.length === 0}
                  class:justify-center={selectedWidgets.length === 0}
                >
                  {#if selectedWidgets.length === 0}
                    <p class="text-gray-400">Drop team members here</p>
                  {:else}
                    {#each selectedWidgets as member (member.id)}
                      <div
                        animate:flip={{ duration: flipDurationMs }}
                        class="border border-gray-200 dark:border-gray-800 rounded p-4 shadow-sm"
                      >
                        <div class="flex items-center space-x-4">
                          <div class="relative">
                            <div
                              class="{member.color} w-8 h-8 rounded-full flex items-center justify-center"
                            ></div>
                          </div>
                          <div>
                            <h3 class="font-medium">{member.name}</h3>
                            <p class="text-gray-500 dark:text-gray-300 text-sm">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    {/each}
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
