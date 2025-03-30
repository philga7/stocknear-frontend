<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import RatingsChart from "$lib/components/RatingsChart.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  import SEO from "$lib/components/SEO.svelte";

  export let data;

  let rawData = processTickerData(data?.getInsiderTracker) ?? [];
  let stockList = rawData?.slice(0, 50) ?? [];

  function processTickerData(data) {
    const symbolMap = new Map();

    data.forEach((item) => {
      const { symbol } = item;

      if (!symbol) return; // Skip if symbol is not defined

      if (!symbolMap.has(symbol)) {
        // Add the item and initialize count
        symbolMap.set(symbol, { ...item, ratings: 1 });
      } else {
        const existing = symbolMap.get(symbol);

        // Increment the ratings count
        existing.ratings += 1;

        // Keep the item with the latest date
        if (new Date(item.filingDate) > new Date(existing.filingDate)) {
          symbolMap.set(symbol, { ...item, ratings: existing.ratings });
        }
      }
    });

    // Convert the Map back to an array
    return Array.from(symbolMap.values());
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && stockList?.length !== rawData?.length) {
      const nextIndex = stockList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 25);
      stockList = [...stockList, ...filteredNewResults];
    }
  }

  onMount(() => {
    if (["Pro", "Plus"]?.includes(data?.user?.tier)) {
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  });

  $: columns = [
    ...($screenWidth > 1024
      ? [{ key: "chart", label: "", align: "right" }]
      : []),
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "reportingName", label: "Member", align: "left" },
    { key: "marketCap", label: "Market Cap", align: "right" },
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "totalShares", label: "Shares", align: "right" },
    { key: "avgValue", label: "Avg. Value", align: "right" },
  ];

  let sortOrders = {
    chart: { order: "none", type: "string" },
    filingDate: { order: "none", type: "date" },
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    reportingName: { order: "none", type: "string" },
    marketCap: { order: "none", type: "number" },
    price: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    totalShares: { order: "none", type: "number" },
    avgValue: { order: "none", type: "number" },
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

    let originalData = rawData;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      stockList = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
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
  $: charNumber = $screenWidth < 640 ? 20 : 25;

  $: checkedSymbol = "";
  function openGraph(symbol) {
    // Clear all existing symbols
    if (checkedSymbol === symbol) {
      checkedSymbol = "";
    } else {
      checkedSymbol = symbol;
    }
  }
</script>

<SEO
  title="Insider Tracker - Real-Time Insider Trading Data"
  description="Stay ahead of the market with real-time insider trading data. Track insider buys, sells, and ownership changes to make informed investment decisions."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
      <li class="text-muted dark:text-gray-300">Insider Tracker</li>
    </ul>
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="mb-6 border-b-[2px]">
            <h1 class="mb-1 text-2xl sm:text-3xl font-bold">Insider Tracker</h1>
          </div>

          <Infobox
            text="We update our data in real time to bring you the latest
                      insights on unusual insider trading, sourced from SEC
                      filings with a minimum transaction value of $100,000."
          />

          <div class="w-full m-auto mt-20 sm:mt-10">
            <div
              class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-auto sm:overflow-hidden"
            >
              <table
                class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-white dark:bg-table border border-gray-300 dark:border-gray-800 m-auto"
              >
                <thead>
                  <TableHeader {columns} {sortOrders} {sortData} />
                </thead>
                <tbody>
                  {#each stockList as item, index}
                    <tr
                      class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd {index +
                        1 ===
                        stockList?.length &&
                      !['Pro', 'Plus']?.includes(data?.user?.tier)
                        ? 'opacity-[0.1]'
                        : ''}"
                    >
                      <td class="hidden lg:table-cell"
                        ><button
                          on:click={() => openGraph(item?.symbol)}
                          class="cursor-pointer h-full pl-2 pr-2 align-middle lg:pl-3"
                          ><svg
                            class="w-5 h-5 text-icon {checkedSymbol ===
                            item?.symbol
                              ? 'rotate-180'
                              : ''}"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            style="max-width:40px"
                            ><path
                              fill-rule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clip-rule="evenodd"
                            ></path></svg
                          ></button
                        ></td
                      >

                      <td class="text-sm sm:text-[1rem] text-start">
                        <HoverStockChart symbol={item?.symbol} />
                      </td>
                      <td
                        class="whitespace-nowrap text-sm sm:text-[1rem] text-start"
                      >
                        {item?.name?.length > charNumber
                          ? item?.name?.slice(0, charNumber) + "..."
                          : item?.name}
                      </td>

                      <td
                        class="whitespace-nowrap text-sm sm:text-[1rem] text-start"
                      >
                        {item?.reportingName?.length > charNumber
                          ? item?.reportingName?.slice(0, charNumber) + "..."
                          : item?.reportingName}
                      </td>

                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {abbreviateNumber(item?.marketCap)}
                      </td>

                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {item?.price}
                      </td>

                      <td
                        class="text-sm sm:text-[1rem] whitespace-nowrap text-end {item?.changesPercentage >=
                        0
                          ? 'text-green-700 dark:text-[#00FC50]'
                          : 'text-red-700 dark:text-[#FF2F1F]'}"
                      >
                        {item?.changesPercentage > 0
                          ? "+"
                          : ""}{item?.changesPercentage}%
                      </td>

                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {abbreviateNumber(item?.totalShares)}
                      </td>

                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap {item?.transactionType ===
                        'Buy'
                          ? 'text-green-700 dark:text-[#00FC50]'
                          : item?.transactionType === 'Sell'
                            ? 'text-red-700 dark:text-[#FF2F1F]'
                            : 'text-[#E57C34]'}"
                      >
                        <div class="flex flex-row items-center justify-end">
                          <div class="">
                            {abbreviateNumber(item?.avgValue)}
                          </div>
                          <div
                            class="ml-2 px-1.5 py-1.5 border text-center rounded-md text-xs font-semibold"
                          >
                            {item?.transactionType}
                          </div>
                        </div>
                      </td>
                    </tr>
                    {#if checkedSymbol === item?.symbol}
                      <tr class=""
                        ><td colspan="9" class="px-0" style=""
                          ><div class="-mt-0.5 px-0 pb-2">
                            <div class="relative h-[400px]">
                              <div class="absolute top-0 w-full">
                                <div
                                  class="h-[250px] w-full xs:h-[300px] sm:h-[400px]"
                                  style="overflow: hidden;"
                                >
                                  <div
                                    style="position: relative; height: 0px; z-index: 1;"
                                  >
                                    <RatingsChart
                                      ratingsList={data?.getInsiderTracker?.map(
                                        (item) => ({
                                          ...item,
                                          type: item?.transactionType,
                                          date: item?.filingDate,
                                          ticker: item?.symbol,
                                        }),
                                      )}
                                      symbol={item?.symbol}
                                      numOfRatings={item?.ratings}
                                      title={"Insider Trading"}
                                      addToLast={true}
                                      {data}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div></td
                        >
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
            <UpgradeToPro {data} />
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
