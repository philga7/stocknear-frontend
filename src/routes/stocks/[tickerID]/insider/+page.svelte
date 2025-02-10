<script lang="ts">
  import {
    displayCompanyName,
    numberOfUnreadNotification,
    stockTicker,
  } from "$lib/store";
  import { formatString, abbreviateNumber } from "$lib/utils";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import { onMount } from "svelte";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import SEO from "$lib/components/SEO.svelte";


  export let data;
  let isLoaded = true;

  let rawData = data?.getInsiderTrading?.sort(
    (a, b) => new Date(b?.transactionDate) - new Date(a?.transactionDate),
  );

  let insiderTradingList = rawData?.slice(0, 50);
  function backToTop() {
    window.scrollTo({
      top: 0,
    });
  }

  let statistics = {};
  let buySellRatio = 0;
  const now = new Date();
  let year = now.getFullYear();
  let quarter = Math.floor(now.getMonth() / 3) + 1;
  let yearRange = Array.from(
    new Set(
      rawData?.map((item) => new Date(item?.transactionDate)?.getFullYear()),
    ),
  )?.sort((a, b) => b - a);
  if (yearRange?.length > 0) {
    year = yearRange?.slice(0)?.at(0);
  }

  function calculateInsiderTradingStatistics(data, year, quarter) {
    // Helper function to check if the transaction date is within the current quarter
    const isInCurrentQuarter = (transactionDate) => {
      const date = new Date(transactionDate);
      return (
        date.getFullYear() === year &&
        Math.floor(date.getMonth() / 3) + 1 === quarter
      );
    };

    // Initialize statistics object
    let statistics = {
      soldShares: 0,
      buyShares: 0,
      buySharesPercentage: 0,
      soldSharesPercentage: 0,
      quarter: quarter,
      year: year,
    };

    // Summing up bought and sold shares efficiently in a single loop
    data.forEach(
      ({ transactionType, securitiesTransacted, price, transactionDate }) => {
        if (price > 0 && isInCurrentQuarter(transactionDate)) {
          if (transactionType === "Sold") {
            statistics.soldShares += securitiesTransacted;
          } else if (transactionType === "Bought") {
            statistics.buyShares += securitiesTransacted;
          }
        }
      },
    );

    const totalShares = statistics.buyShares + statistics.soldShares;

    if (totalShares > 0) {
      statistics.buySharesPercentage = Math.floor(
        (statistics.buyShares / totalShares) * 100,
      );
      statistics.soldSharesPercentage = 100 - statistics.buySharesPercentage;
    }

    return statistics;
  }

  function extractOfficeInfo(inputString) {
    const indexOfficer = inputString?.toLowerCase()?.indexOf("officer:");
    const indexOther = inputString?.toLowerCase()?.indexOf("other:");
    if (indexOfficer !== -1) {
      return inputString?.substring(indexOfficer + "officer:"?.length)?.trim();
    } else if (indexOther !== -1) {
      return inputString?.substring(indexOther + "other:"?.length)?.trim();
    } else if (inputString?.toLowerCase()?.includes("director")) {
      return "Director";
    } else if (inputString?.toLowerCase()?.includes("percent owner")) {
      return inputString?.replace("percent owner", "% Owner");
    } else {
      return "n/a";
    }
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && insiderTradingList?.length !== rawData?.length) {
      const nextIndex = insiderTradingList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      insiderTradingList = [...insiderTradingList, ...filteredNewResults];
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  const transactionStyles = {
    Bought: "P - Purchase",
    Grant: "G - Grant",
    Sold: "S - Sale",
    Exercise: "E - Exercise",
    "n/a": { text: "n/a", class: "text-gray-300" },
  };

  let columns = [
    { key: "reportingName", label: "Name", align: "left" },
    { key: "transactionDate", label: "Date", align: "right" },
    { key: "securitiesTransacted", label: "Shares", align: "right" },
    { key: "price", label: "Price", align: "right" },
    { key: "value", label: "Value", align: "right" },
    { key: "transactionType", label: "Trade Type", align: "right" },
  ];

  let sortOrders = {
    reportingName: { order: "none", type: "string" },
    transactionDate: { order: "none", type: "date" },
    securitiesTransacted: { order: "none", type: "number" },
    price: { order: "none", type: "number" },
    value: { order: "none", type: "number" },
    transactionType: { order: "none", type: "string" },
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
      insiderTradingList = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
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
    insiderTradingList = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  $: {
    if ((year || quarter) && typeof window !== "undefined") {
      statistics = calculateInsiderTradingStatistics(rawData, year, quarter);
      buySellRatio =
        statistics?.soldShares !== 0
          ? statistics?.buyShares / statistics?.soldShares
          : 0;
    }
  }
</script>


<SEO
  title={`${$displayCompanyName} (${$stockTicker}) US Congress & Senate Trading · Stocknear`}
  description={`Get the latest US congress & senate trading of ${$displayCompanyName} (${$stockTicker}) from democrates and republicans.`}
/>

<section class="w-full bg-default overflow-hidden text-white h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <div class="w-full mb-6">
          <h1 class="text-xl sm:text-2xl text-white font-bold mb-4">
            Insider Trading
          </h1>
          {#if insiderTradingList?.length === 0}
            <div
              class="w-fit text-white p-3 sm:p-5 mb-5 rounded-md sm:flex sm:flex-row sm:items-center border border-gray-600 text-sm sm:text-[1rem]"
            >
              <svg
                class="w-6 h-6 flex-shrink-0 inline-block sm:mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                ><path
                  fill="#fff"
                  d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
                /></svg
              >

              No trading history available for {$displayCompanyName}. Likely no
              insider trading has happened yet.
            </div>
          {/if}
        </div>

        {#if isLoaded}
          {#if insiderTradingList?.length !== 0}
            {#if Object?.keys(statistics)?.length !== 0}
              <div class="flex w-fit sm:w-[50%] md:block md:w-auto ml-auto">
                <div class="relative inline-block text-left grow">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                      <Button
                        builders={[builder]}
                        class="w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                      >
                        <span class="truncate text-white">Year: {year}</span>
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
                        Select Year
                      </DropdownMenu.Label>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Group>
                        {#each yearRange as index}
                          <DropdownMenu.Item
                            on:click={() => (year = index)}
                            class="cursor-pointer hover:bg-primary"
                          >
                            {index}
                          </DropdownMenu.Item>
                        {/each}
                      </DropdownMenu.Group>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
                <div class="relative inline-block text-left grow ml-3">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                      <Button
                        builders={[builder]}
                        class="w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                      >
                        <span class="truncate text-white"
                          >Quarter: Q{quarter}</span
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
                        Select Quarter
                      </DropdownMenu.Label>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Group>
                        {#each [1, 2, 3, 4] as index}
                          <DropdownMenu.Item
                            on:click={() => (quarter = index)}
                            class="cursor-pointer hover:bg-primary"
                          >
                            Q{index}
                          </DropdownMenu.Item>
                        {/each}
                      </DropdownMenu.Group>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </div>

              <h3 class="text-white text-lg font-semibold pt-5">
                Q{statistics?.quarter}
                {statistics?.year} Insider Statistics
              </h3>
              <!--Start Widget-->
              <div
                class="w-full mt-5 mb-10 m-auto flex justify-center items-center p-1"
              >
                <div
                  class="w-full grid grid-cols-2 lg:grid-cols-4 gap-y-3 lg:gap-y-3 gap-x-3"
                >
                  <!--Start Put/Call-->
                  <div
                    class="flex flex-row items-center flex-wrap w-full px-3 sm:px-4 border border-gray-600 bg-primary rounded-md h-20"
                  >
                    <div class="flex flex-col items-start">
                      <span
                        class="font-medium text-white text-sm sm:text-[1rem]"
                        >Buy/Sell</span
                      >
                      <span
                        class="text-start text-sm sm:text-[1rem] font-medium text-white"
                      >
                        {buySellRatio > 0
                          ? buySellRatio?.toFixed(1)
                          : buySellRatio}
                      </span>
                    </div>
                    <!-- Circular Progress -->
                    <div class="relative size-12 sm:size-14 ml-auto">
                      <svg
                        class="size-full w-12 h-12 sm:w-14 sm:h-14"
                        viewBox="0 0 36 36"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <!-- Background Circle -->
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          class="stroke-current text-[#3E3E3E]"
                          stroke-width="3"
                        ></circle>
                        <!-- Progress Circle inside a group with rotation -->
                        <g class="origin-center -rotate-90 transform">
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            class="stroke-current text-blue-500"
                            stroke-width="3"
                            stroke-dasharray="100"
                            stroke-dashoffset={buySellRatio >= 1
                              ? 0
                              : 100 - (buySellRatio * 100)?.toFixed(2)}
                          ></circle>
                        </g>
                      </svg>
                      <!-- Percentage Text -->
                      <div
                        class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2"
                      >
                        <span
                          class="text-center text-white text-sm sm:text-[1rem]"
                          >{(buySellRatio * 100)?.toFixed(0)}%</span
                        >
                      </div>
                    </div>
                    <!-- End Circular Progress -->
                  </div>
                  <!--End Put/Call-->
                  <!--Start Call Flow-->
                  <div
                    class="flex flex-row items-center flex-wrap w-full px-3 sm:px-4 border border-gray-600 bg-primary rounded-md h-20"
                  >
                    <div class="flex flex-col items-start">
                      <span
                        class="font-medium text-white text-sm sm:text-[1rem]"
                        >Bought Shares</span
                      >
                      <span
                        class="text-start text-sm sm:text-[1rem] font-medium text-white"
                      >
                        {new Intl.NumberFormat("en", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(statistics?.buyShares)}
                      </span>
                    </div>
                    <!-- Circular Progress -->
                    <div class="relative size-12 sm:size-14 ml-auto">
                      <svg
                        class="size-full w-12 h-12 sm:w-14 sm:h-14"
                        viewBox="0 0 36 36"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <!-- Background Circle -->
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          class="stroke-current text-[#3E3E3E]"
                          stroke-width="3"
                        ></circle>
                        <!-- Progress Circle inside a group with rotation -->
                        <g class="origin-center -rotate-90 transform">
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            class="stroke-current text-[#00FC50]"
                            stroke-width="3"
                            stroke-dasharray="100"
                            stroke-dashoffset={100 -
                              statistics?.buySharesPercentage}
                          ></circle>
                        </g>
                      </svg>
                      <!-- Percentage Text -->
                      <div
                        class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2"
                      >
                        <span
                          class="text-center text-white text-sm sm:text-[1rem]"
                          >{statistics?.buySharesPercentage}%</span
                        >
                      </div>
                    </div>
                    <!-- End Circular Progress -->
                  </div>
                  <!--End Call Flow-->
                  <!--Start Put Flow-->
                  <div
                    class="flex flex-row items-center flex-wrap w-full px-3 sm:px-4 border border-gray-600 rounded-md bg-primary h-20"
                  >
                    <div class="flex flex-col items-start">
                      <span
                        class="font-medium text-white text-sm sm:text-[1rem]"
                        >Sold Shares</span
                      >
                      <span
                        class="text-start text-sm sm:text-[1rem] font-medium text-white"
                      >
                        {new Intl.NumberFormat("en", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(statistics?.soldShares)}
                      </span>
                    </div>
                    <!-- Circular Progress -->
                    <div class="relative size-12 sm:size-14 ml-auto">
                      <svg
                        class="size-full w-12 h-12 sm:w-14 sm:h-14"
                        viewBox="0 0 36 36"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <!-- Background Circle -->
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          class="stroke-current text-[#3E3E3E]"
                          stroke-width="3"
                        ></circle>
                        <!-- Progress Circle inside a group with rotation -->
                        <g class="origin-center -rotate-90 transform">
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            class="stroke-current text-[#EE5365]"
                            stroke-width="3"
                            stroke-dasharray="100"
                            stroke-dashoffset={100 -
                              statistics?.soldSharesPercentage}
                          ></circle>
                        </g>
                      </svg>
                      <!-- Percentage Text -->
                      <div
                        class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2"
                      >
                        <span
                          class="text-center text-white text-sm sm:text-[1rem]"
                          >{statistics?.soldSharesPercentage}%</span
                        >
                      </div>
                    </div>
                    <!-- End Circular Progress -->
                  </div>
                  <!--End Put Flow-->
                </div>
              </div>
              <!--End Widget-->
            {/if}

            <div
              class="flex justify-start items-center w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-scroll no-scrollbar"
            >
              <table
                class="table table-sm table-pin-rows table-compact rounded-none sm:rounded-md w-full bg-table border border-gray-800 m-auto"
              >
                <thead>
                  <TableHeader {columns} {sortOrders} {sortData} />
                </thead>
                <tbody>
                  {#each insiderTradingList as item, index}
                    {#if item?.price > 0}
                      <tr
                        class="text-white odd:bg-odd border-b border-gray-800 {index +
                          1 ===
                          insiderTradingList?.slice(0, 6)?.length &&
                        data?.user?.tier !== 'Pro'
                          ? 'opacity-[0.1]'
                          : ''}"
                      >
                        <td
                          class="text-white text-sm sm:text-[1rem] ] whitespace-nowrap"
                        >
                          <div class="flex flex-col">
                            <span class=""
                              >{formatString(item?.reportingName)?.replace(
                                "/de/",
                                "",
                              )}</span
                            >
                            <span class="text-sm text-white"
                              >{extractOfficeInfo(item?.typeOfOwner)}</span
                            >
                          </div>
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white ]"
                        >
                          {new Date(item?.transactionDate)?.toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              daySuffix: "2-digit",
                            },
                          )}
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white ]"
                        >
                          {@html abbreviateNumber(
                            item?.securitiesTransacted,
                            false,
                            true,
                          )}
                        </td>
                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white ]"
                        >
                          ${item?.price?.toFixed(2)}
                        </td>
                        <td
                          class="font-medium text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {@html abbreviateNumber(item?.value, false, true)}
                        </td>
                        <td class="text-end flex justify-end whitespace-nowrap">
                          <div
                            class="w-auto px-4 py-1 rounded-full uppercase {item?.transactionType ===
                            'Bought'
                              ? 'bg-[#75D377] text-black'
                              : 'bg-[#cd4050] text-white'} font-semibold"
                          >
                            {transactionStyles[item?.transactionType]}
                          </div>
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>

            {#if rawData?.length > 5 && rawData?.length === insiderTradingList?.length && data?.user?.tier === "Pro"}
              <label
                on:click={backToTop}
                class="w-32 py-1.5 mt-10 hover:bg-white hover:bg-opacity-[0.05] cursor-pointer m-auto flex justify-center items-center border border-gray-600 rounded-full"
              >
                Back to top
              </label>
            {/if}

            <UpgradeToPro {data} />
          {/if}
        {:else}
          <div class="flex justify-center items-center h-80">
            <div class="relative">
              <label
                class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <span class="loading loading-spinner loading-md text-gray-400"
                ></span>
              </label>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 400px;
    width: 100%;
  }

  @media (max-width: 560px) {
    .app {
      width: 100%;
      height: 300px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
