<script lang="ts">
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { onMount, onDestroy } from "svelte";
  import { abbreviateNumber, buildOptionSymbol } from "$lib/utils";
  import { setCache, getCache, screenWidth } from "$lib/store";
  import { Combobox } from "bits-ui";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import Link from "lucide-svelte/icons/square-arrow-out-up-right";
  import Trash from "lucide-svelte/icons/trash";
  import { toast } from "svelte-sonner";

  import { mode } from "mode-watcher";
  import highcharts from "$lib/highcharts.ts";

  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let selectedPlotCategory = "Stock Price";
  let tickerList = [];

  // Search variables
  let searchBarData = [];
  let timeoutId: ReturnType<typeof setTimeout>;
  let inputValue = "";
  let touchedInput = false;

  function addTicker(data) {
    const ticker = data?.symbol?.trim()?.toUpperCase();

    // 2) Guard clause: check for duplicates
    if (tickerList?.includes(ticker)) {
      // You could also make this message more specific, e.g.:
      // `Ticker "${ticker}" is already in your watchlist!`
      toast?.error("Ticker is already included");
      return;
    }

    tickerList.push(ticker);
    tickerList = [...tickerList];

    handleSave();
    setTimeout(() => {
      inputValue = "";
    }, 0);
  }
  function removeTicker(symbol) {
    const ticker = symbol?.trim()?.toUpperCase();

    // Guard clause: ensure the ticker exists
    if (!tickerList?.includes(ticker)) {
      toast?.error(`Ticker "${ticker}" not found in your watchlist`);
      return;
    }

    // Remove the ticker
    tickerList = [...tickerList?.filter((item) => item !== ticker)];

    // Persist the change
    handleSave();
  }

  async function search() {
    clearTimeout(timeoutId); // Clear any existing timeout

    if (!inputValue.trim()) {
      // Skip if query is empty or just whitespace
      searchBarData = []; // Clear previous results
      return;
    }

    timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/searchbar?query=${encodeURIComponent(inputValue)}&limit=10`,
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        searchBarData = await response.json();
      } catch (error) {
        console.error("Error during search:", error);
        searchBarData = [];
      }
    }, 50); // delay
  }

  function handleSave() {
    try {
      // Create filtered strategies without strikeList and dateList

      // Save the filtered version
      localStorage?.setItem(
        "compare-stocks",
        JSON?.stringify({
          tickerList: tickerList,
          selectedPlotCategory: selectedPlotCategory,
        }),
      );
    } catch (e) {
      console.log("Failed saving compare stocks data: ", e);
    }
  }

  onMount(async () => {
    try {
      const savedData = localStorage?.getItem("compare-stocks");

      if (savedData) {
        const parsedData = JSON.parse(savedData);
        tickerList = parsedData?.tickerList;
        selectedPlotCategory = parsedData?.selectedPlotCategory;
      }
    } catch (e) {
      console.log(e);
    }
  });
</script>

<SEO
  title="Stock Comparison Tool"
  description="Compare Stocks side by side, including charts, performance, statistics, financials, and more."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
      <li class="text-muted dark:text-gray-300">Compare</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="mb-6 border-[#2C6288] dark:border-white border-b-[2px]">
            <h1 class="mb-1 text-2xl sm:text-3xl font-bold">Compare Stocks</h1>
          </div>

          <div class="mt-4">
            <div
              class="{$screenWidth < 640 && $screenWidth
                ? 'grid grid-cols-1'
                : 'flex flex-row'} items-center w-full mt-3 mb-3"
            >
              <Combobox.Root
                items={searchBarData}
                bind:inputValue
                bind:touchedInput
              >
                <div class="relative w-full">
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <svg
                      class="h-4 w-4 text-icon xs:h-5 xs:w-5"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      stroke="currentcolor"
                      viewBox="0 0 24 24"
                      style="max-width: 40px"
                      aria-hidden="true"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>

                  <div
                    class="shadow-sm flex flex-wrap items-center gap-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none"
                  >
                    {#each tickerList as t (t)}
                      <span
                        class="gap-x-2 mr-1 inline-flex items-center border-l-[4px] border-[2px] px-1 border-[#1080FE] text-xs font-semibold py-1 rounded"
                      >
                        {t}
                        <button
                          type="button"
                          on:click={() => removeTicker(t)}
                          class="-ml-1"
                          aria-label="Remove {t}"
                        >
                          <svg
                            class=" h-4 w-4 cursor-pointer"
                            viewBox="0 -0.5 25 25"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
                              id="SVGRepo_tracerCarrier"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></g><g id="SVGRepo_iconCarrier">
                              <path
                                d="M6.96967 16.4697C6.67678 16.7626 6.67678 17.2374 6.96967 17.5303C7.26256 17.8232 7.73744 17.8232 8.03033 17.5303L6.96967 16.4697ZM13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697L13.0303 12.5303ZM11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303L11.9697 11.4697ZM18.0303 7.53033C18.3232 7.23744 18.3232 6.76256 18.0303 6.46967C17.7374 6.17678 17.2626 6.17678 16.9697 6.46967L18.0303 7.53033ZM13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303L13.0303 11.4697ZM16.9697 17.5303C17.2626 17.8232 17.7374 17.8232 18.0303 17.5303C18.3232 17.2374 18.3232 16.7626 18.0303 16.4697L16.9697 17.5303ZM11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697L11.9697 12.5303ZM8.03033 6.46967C7.73744 6.17678 7.26256 6.17678 6.96967 6.46967C6.67678 6.76256 6.67678 7.23744 6.96967 7.53033L8.03033 6.46967ZM8.03033 17.5303L13.0303 12.5303L11.9697 11.4697L6.96967 16.4697L8.03033 17.5303ZM13.0303 12.5303L18.0303 7.53033L16.9697 6.46967L11.9697 11.4697L13.0303 12.5303ZM11.9697 12.5303L16.9697 17.5303L18.0303 16.4697L13.0303 11.4697L11.9697 12.5303ZM13.0303 11.4697L8.03033 6.46967L6.96967 7.53033L11.9697 12.5303L13.0303 11.4697Z"
                                fill="currentColor"
                              ></path>
                            </g></svg
                          >
                        </button>
                      </span>
                    {/each}

                    <Combobox.Input
                      on:input={search}
                      class="flex-grow min-w-[8ch]  text-sm focus:outline-none placeholder-gray-500 dark:placeholder-gray-300 px-2 py-1"
                      placeholder={tickerList.length > 0
                        ? ""
                        : "Add new stock…"}
                      aria-label={tickerList.length > 0 ? "" : "Add new stock…"}
                    />
                  </div>
                </div>

                <Combobox.Content
                  class="z-10 w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-default px-1 py-2 shadow-sm outline-hidden"
                  sideOffset={8}
                >
                  {#if inputValue?.length !== 0}
                    {#each searchBarData as searchItem}
                      <Combobox.Item
                        class="py-2.5 cursor-pointer border-b border-gray-300 dark:border-gray-500 last:border-none flex h-fit w-auto select-none items-center rounded-button  px-2  text-sm capitalize outline-hidden transition-all duration-75 data-highlighted:bg-gray-200 dark:data-highlighted:bg-primary"
                        value={searchItem?.symbol}
                        label={searchItem?.symbol}
                        on:click={(e) => addTicker(searchItem)}
                      >
                        <div
                          class="flex flex-col sm:flex-row items-start sm:items-center"
                        >
                          <span class="text-sm text-blue-700 dark:text-blue-400"
                            >{searchItem?.symbol}</span
                          >
                          <span
                            class="ml-0 sm:ml-2 text-xs sm:text-sm text-muted dark:text-white"
                            >{searchItem?.name}</span
                          >
                        </div>
                      </Combobox.Item>
                    {:else}
                      <span
                        class="block px-5 py-2 text-sm text-muted dark:text-white"
                      >
                        No results found
                      </span>
                    {/each}
                  {:else}
                    <Combobox.Item
                      class="cursor-pointer border-b border-gray-300 dark:border-gray-600 last:border-none flex h-fit w-auto select-none items-center rounded-button py-1.5 pl-5 pr-1.5 text-sm capitalize outline-hidden"
                    >
                      <span class=" text-sm text-muted dark:text-white">
                        {inputValue?.length > 0
                          ? "No results found"
                          : "Start searching..."}
                      </span>
                    </Combobox.Item>
                  {/if}
                </Combobox.Content>
              </Combobox.Root>

              <div
                class="order-last relative inline-block text-left cursor-pointer mt-3 sm:mt-0 sm:ml-3 shadow-sm"
              >
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild let:builder>
                    <Button
                      builders={[builder]}
                      class="w-full border-gray-300 font-semibold dark:font-normal dark:border-gray-600 border bg-white dark:bg-default sm:hover:bg-gray-100 dark:sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2  rounded truncate"
                    >
                      <span class="truncate">{selectedPlotCategory}</span>
                      <svg
                        class="-mr-1 ml-3 h-5 w-5 xs:ml-2 inline-block"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style="max-width:40px"
                        aria-hidden="true"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    class="w-56 h-fit max-h-72 overflow-y-auto scroller"
                  >
                    <DropdownMenu.Label
                      class="text-muted dark:text-gray-400 font-normal"
                    >
                      Select Strategy
                    </DropdownMenu.Label>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Group>
                      {#each prebuiltStrategy as strategy}
                        <DropdownMenu.Item
                          on:click={() => changeCategory(strategy)}
                          class="cursor-pointer sm:hover:bg-gray-300 dark:sm:hover:bg-primary"
                        >
                          {strategy.name}
                        </DropdownMenu.Item>
                      {/each}
                    </DropdownMenu.Group>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
