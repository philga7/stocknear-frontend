<script lang="ts">
  import {
    indexTicker,
    displayCompanyName,
  } from "$lib/store";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import { goto } from "$app/navigation";
  import ArrowLogo from "lucide-svelte/icons/move-up-right";
  import SEO from "$lib/components/SEO.svelte";

  import { onMount } from "svelte";

  export let data;
  let isLoaded = false;
  let timePeriod = "Daily";
  let rawData = data?.getData || [];
  let originalData = [];

  let stockList = [];
  function prepareDataset(data, timePeriod = "Daily") {
    if (
      timePeriod === "Weekly" ||
      timePeriod === "Monthly" ||
      timePeriod === "Quarterly" ||
      timePeriod === "Annual"
    ) {
      // Group data by week, month, quarter, or year
      const aggregatedData = [];
      let currentPeriod = null;

      data.forEach((entry) => {
        const date = new Date(entry.time);
        let periodStart;
        let periodKey;

        if (timePeriod === "Weekly") {
          // Calculate the start of the week (Monday)
          const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
          periodStart = new Date(
            date.setDate(date.getDate() - ((dayOfWeek + 6) % 7)), // Adjust to get Monday
          );
          periodKey = periodStart.getTime();
        } else if (timePeriod === "Monthly") {
          // Use year and month as the period key
          periodKey = `${date.getFullYear()}-${date.getMonth()}`;
          // Get the last day of the month
          periodStart = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        } else if (timePeriod === "Quarterly") {
          // Calculate quarter (0-3)
          const quarter = Math.floor(date.getMonth() / 3);
          periodKey = `${date.getFullYear()}-Q${quarter}`;
          // Get the last day of the quarter
          const lastMonthOfQuarter = (quarter + 1) * 3 - 1;
          periodStart = new Date(date.getFullYear(), lastMonthOfQuarter + 1, 0);
        } else {
          // Annual
          periodKey = date.getFullYear().toString();
          // Get the last day of the year (December 31st)
          periodStart = new Date(date.getFullYear(), 11, 31);
        }

        if (!currentPeriod || currentPeriod.periodKey !== periodKey) {
          // Start a new period
          currentPeriod = {
            periodStart,
            periodKey,
            open: entry.open,
            high: entry.high,
            low: entry.low,
            close: entry.close,
            volume: entry.volume,
          };
          aggregatedData.push(currentPeriod);
        } else {
          // Update the current period's values
          currentPeriod.high = Math.max(currentPeriod.high, entry.high);
          currentPeriod.low = Math.min(currentPeriod.low, entry.low);
          currentPeriod.close = entry.close; // Update the close to the most recent in the period
          currentPeriod.volume += entry.volume;
        }
      });

      // Replace Daily data with aggregated data
      data = aggregatedData.map((period) => ({
        time: period.periodStart.toISOString().split("T")[0],
        open: period.open,
        high: period.high,
        low: period.low,
        close: period.close,
        volume: period.volume,
      }));
    }

    // Process the data to add change and changesPercentage
    const modifiedData = data?.map((entry, index, arr) => {
      if (index === 0) {
        return { ...entry, change: null, changesPercentage: null };
      }
      const previousClose = arr[index - 1]?.close;
      const currentClose = entry?.close;
      const change = (currentClose - previousClose)?.toFixed(2);
      const changesPercentage =
        previousClose !== 0
          ? (((currentClose - previousClose) / previousClose) * 100)?.toFixed(2)
          : null;
      return { ...entry, change, changesPercentage };
    });

    // Sort the data by "time" from latest to earliest
    return modifiedData?.sort((a, b) => new Date(b?.time) - new Date(a?.time));
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;

    if (isBottom && stockList?.length !== originalData?.length) {
      const nextIndex = stockList?.length;
      const filteredNewResults = originalData?.slice(nextIndex, nextIndex + 50);
      stockList = [...stockList, ...filteredNewResults];
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: columns = [
    { key: "time", label: "Date", align: "left" },
    { key: "open", label: "Open", align: "right" },
    { key: "high", label: "High", align: "right" },
    { key: "low", label: "Low", align: "right" },
    { key: "close", label: "Close", align: "right" },
    { key: "change", label: "Change", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "volume", label: "Volume", align: "right" },
  ];

  $: sortOrders = {
    time: { order: "none", type: "date" },
    open: { order: "none", type: "number" },
    high: { order: "none", type: "number" },
    low: { order: "none", type: "number" },
    close: { order: "none", type: "number" },
    change: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    volume: { order: "none", type: "number" },
  };

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...rawData]; // Reset originalData to rawData
      stockList = originalData?.slice(0, 50); // Reset displayed data
      return;
    }

    // Define a generic comparison function
    const compareValues = (a, b) => {
      const { type } = sortOrders[key];
      let valueA, valueB;

      switch (type) {
        case "date":
          valueA = new Date(a[key]);
          valueB = new Date(b[key]);
          break;
        case "string":
          valueA = a[key].toUpperCase();
          valueB = b[key].toUpperCase();
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    };

    // Sort using the generic comparison function
    stockList = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  async function exportData() {
    if (data?.user?.tier === "Pro") {
      let exportList = rawData?.map(
        ({
          time,
          open,
          high,
          low,
          close,
          change,
          changesPercentage,
          volume,
        }) => ({
          time,
          open,
          high,
          low,
          close,
          change,
          changesPercentage,
          volume,
        }),
      );

      const csvRows = [];

      // Add headers row
      csvRows.push("time,open,high,low,close,change,changesPercentage,volume");

      // Add data rows
      for (const row of exportList) {
        const csvRow = `${row.time},${row.open},${row.high},${row.low},${row.close},${row.change},${row.changesPercentage},${row.volume}`;
        csvRows.push(csvRow);
      }

      // Create CSV blob and trigger download
      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", `${$indexTicker}_price_history.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      goto("/pricing");
    }
  }

  $: {
    if (timePeriod && typeof window !== "undefined") {
      isLoaded = false;
      rawData = prepareDataset(data?.getData, timePeriod);
      originalData = rawData;
      stockList = rawData?.slice(0, 50);
      isLoaded = true;
    }
  }
</script>


<SEO title={`${$displayCompanyName} (${$indexTicker}) Historical Stock Price Data`} description={`Get a complete stock price history for ${$displayCompanyName} (${$indexTicker}), starting from its first trading day. Includes open, high, low, close and volume.`} />



<section
  class="bg-default overflow-hidden text-white h-full min-h-screen mb-20 sm:mb-0 w-full mt-2 sm:mt-0"
>
  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full lg:w-3/4">
          <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto">
            <div
              class="flex flex-col sm:flex-row items-start w-full sm:justify-between md:space-x-4 md:border-0 w-full mb-5"
            >
              <h1 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-0">
                {$indexTicker} Stock Price History
              </h1>
              <div
                class="flex flex-row items-center ml-auto w-fit mt-2 sm:mt-0"
              >
                <div class="relative inline-block text-left ml-auto">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                      <Button
                        builders={[builder]}
                        class="w-fit sm:w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                      >
                        <span class="truncate text-white px-1"
                          >{timePeriod}</span
                        >
                        <svg
                          class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
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
                      <DropdownMenu.Label class="text-gray-400">
                        Select time frame
                      </DropdownMenu.Label>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Group>
                        <DropdownMenu.Item
                          on:click={() => (timePeriod = "Daily")}
                          class="cursor-pointer hover:bg-primary"
                        >
                          Daily
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          on:click={() => (timePeriod = "Weekly")}
                          class="cursor-pointer hover:bg-primary"
                        >
                          Weekly
                        </DropdownMenu.Item>
                        {#if data?.user?.tier !== "Pro"}
                          {#each ["Monthly", "Quarterly", "Annual"] as entry}
                            <DropdownMenu.Item
                              on:click={() => goto("/pricing")}
                              class="cursor-pointer hover:bg-primary"
                            >
                              {entry}
                              <svg
                                class="ml-auto -mt-0.5 w-4 h-4 inline-block"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                ><path
                                  fill="#A3A3A3"
                                  d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                                /></svg
                              >
                            </DropdownMenu.Item>
                          {/each}
                        {:else}
                          <DropdownMenu.Item
                            on:click={() => (timePeriod = "Monthly")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            Monthly
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => (timePeriod = "Quarterly")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            Quarterly
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            on:click={() => (timePeriod = "Annual")}
                            class="cursor-pointer hover:bg-primary"
                          >
                            Annual
                          </DropdownMenu.Item>
                        {/if}
                      </DropdownMenu.Group>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>

                <Button
                  on:click={() => exportData()}
                  class="ml-2 w-fit border-gray-600 border bg-default sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                >
                  <span class="truncate text-white">Download</span>
                  <svg
                    class="{data?.user?.tier === 'Pro'
                      ? 'hidden'
                      : ''} ml-1 -mt-0.5 w-3.5 h-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    ><path
                      fill="#A3A3A3"
                      d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                    /></svg
                  >
                </Button>
              </div>
            </div>
            {#if isLoaded}
              {#if rawData?.length !== 0}
                <div class="w-full m-auto mt-2">
                  <div
                    class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-scroll"
                  >
                    <table
                      class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto"
                    >
                      <thead>
                        <TableHeader {columns} {sortOrders} {sortData} />
                      </thead>

                      <tbody>
                        {#each stockList as item, index}
                          <tr
                            class="sm:hover:bg-[#245073] border-b border-gray-800 sm:hover:bg-opacity-[0.2] odd:bg-odd {index +
                              1 ===
                              rawData?.length && data?.user?.tier !== 'Pro'
                              ? 'opacity-[0.1]'
                              : ''}"
                          >
                            <td
                              class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white"
                            >
                              {#if timePeriod === "Weekly"}
                                Week of {new Date(item?.time).toLocaleString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    daySuffix: "2-digit",
                                  },
                                )}
                              {:else}
                                {new Date(item?.time).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  daySuffix: "2-digit",
                                })}
                              {/if}
                            </td>
                            <td
                              class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                            >
                              {item?.open?.toFixed(2)}
                            </td>
                            <td
                              class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                            >
                              {item?.high?.toFixed(2)}
                            </td>
                            <td
                              class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                            >
                              {item?.low?.toFixed(2)}
                            </td>
                            <td
                              class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                            >
                              {item?.close?.toFixed(2)}
                            </td>
                            <td
                              class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                            >
                              {item?.change !== null ? item?.change : "n/a"}
                            </td>
                            <td
                              class="text-sm sm:text-[1rem] {item?.changesPercentage >=
                                0 && item?.changesPercentage !== null
                                ? "text-[#00FC50] before:content-['+'] "
                                : item?.changesPercentage < 0 &&
                                    item?.changesPercentage !== null
                                  ? 'text-[#FF2F1F]'
                                  : 'text-white'} text-end"
                            >
                              {item?.changesPercentage !== null
                                ? item?.changesPercentage + "%"
                                : "n/a"}
                            </td>
                            <td
                              class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                            >
                              {item?.volume?.toLocaleString("en-US")}
                            </td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                </div>
              {:else}
                <Infobox
                  text={`No price history are available for ${$displayCompanyName}.`}
                />
              {/if}
            {:else}
              <div class="flex justify-center items-center h-80">
                <div class="relative">
                  <label
                    class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <span
                      class="loading loading-spinner loading-md text-gray-400"
                    ></span>
                  </label>
                </div>
              </div>
            {/if}
          </div>
        </main>
        <aside class="hidden lg:block relative fixed w-1/4 ml-4">
          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/stock-screener"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Stock Screener
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Filter, sort and analyze all stocks to find your next
                investment.
              </span>
            </a>
          </div>

          <div
            class="w-full text-white border border-gray-600 rounded-md h-fit pb-4 mt-4 cursor-pointer bg-inherit sm:hover:bg-secondary transition ease-out duration-100"
          >
            <a
              href="/watchlist/stocks"
              class="w-auto lg:w-full p-1 flex flex-col m-auto px-2 sm:px-0"
            >
              <div class="w-full flex justify-between items-center p-3 mt-3">
                <h2 class="text-start text-xl font-semibold text-white ml-3">
                  Watchlist
                </h2>
                <ArrowLogo class="w-8 h-8 mr-3 flex-shrink-0" />
              </div>
              <span class="text-white p-3 ml-3 mr-3">
                Keep track of your favorite stocks in real-time.
              </span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</section>
