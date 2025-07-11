<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import {
    formatString,
    abbreviateNumber,
    removeCompanyStrings,
  } from "$lib/utils";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import Tutorial from "$lib/components/Tutorial.svelte";

  import { onMount } from "svelte";

  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import SEO from "$lib/components/SEO.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;

  let rawData = data?.getInsiderTrading;
  let filterList = [];
  let checkedItems = new Set();
  let syncWorker: Worker | undefined;
  let transactionList = [
    "P-Purchase",
    "A-Award",
    "D-Return",
    "G-Gift",
    "S-Sale",
    "M-Exempt",
    "X-InTheMoney",
    "C-Conversion",
    "F-InKind",
    "J-Other",
  ];

  let displayList = rawData?.slice(0, 50);

  async function handleChangeValue(value) {
    if (checkedItems.has(value)) {
      checkedItems.delete(value);
    } else {
      checkedItems.add(value);
    }
    const filterSet = new Set(filterList);
    filterSet.has(value) ? filterSet.delete(value) : filterSet.add(value);
    filterList = Array.from(filterSet);

    if (filterList.length > 0) {
      await loadWorker();
    } else {
      rawData = [...data?.getInsiderTrading];

      displayList = rawData?.slice(0, 50) ?? [];
    }

    transactionList = [...transactionList];
  }

  // Handle messages from our filtering web worker.
  const handleMessage = (event) => {
    rawData = event.data?.output || [];
    if (filterList?.length > 0) {
      displayList = rawData?.slice(0, 50) || [];
    } else {
      rawData = data?.getInsiderTrading;
      displayList = rawData?.slice(0, 50) || [];
    }
  };

  // Tell the web worker to filter our data
  const loadWorker = async () => {
    syncWorker?.postMessage({
      rawData: data?.getInsiderTrading,
      filterList: filterList,
    });
  };

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
    if (isBottom && displayList?.length !== rawData?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      displayList = [...displayList, ...filteredNewResults];
    }
  }

  onMount(async () => {
    if (!syncWorker) {
      const SyncWorker = await import("./workers/filterWorker?worker");
      syncWorker = new SyncWorker.default();
      syncWorker.onmessage = handleMessage;
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  let columns = [
    { key: "reportingName", label: "Name", align: "left" },
    { key: "transactionDate", label: "Date", align: "right" },
    { key: "securitiesTransacted", label: "Shares", align: "right" },
    { key: "price", label: "Price", align: "right" },
    { key: "value", label: "Value", align: "right" },
    { key: "transactionType", label: "Type", align: "right" },
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
      displayList = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
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
    displayList = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  function isChecked(item) {
    return checkedItems.has(item);
  }

  let steps = [
    {
      popover: {
        title: "Insider Trading",
        description: `This dashboard aggregates every insider stock transaction filed for ${$stockTicker}. Use these to spot insider buying or selling trends that may signal executive confidence (or concern) in the stock.`,
        side: "center",
        align: "center",
      },
    },
    {
      element: ".transactions-count-driver",
      popover: {
        title: "Total Transactions",
        description: `The total number of insider trades recorded. A high count can indicate active insider buying or selling over time.`,
        side: "bottom",
        align: "start",
      },
    },
    {
      element: ".filter-type-driver",
      popover: {
        title: "Filter Type",
        description: `Filter by transaction type (e.g. “S-Sale” for scheduled sales, “P-Purchase,” or “F-InKind”). Use this to hone in on buys versus sells or other special transactions.`,
        side: "left",
        align: "start",
      },
    },
    {
      element: ".insider-table-driver",
      popover: {
        title: "Transactions Table",
        description: `Lists each insider transaction with key details. Scroll or filter to quickly zero in on the trades you care about.`,
        side: "right",
        align: "start",
      },
    },

    {
      popover: {
        title: "You’re All Set!",
        description: `Now you know how to read this page and filter insider trades. Use this to monitor insider activity and be up-to-date with your trading decisions.`,
        side: "center",
        align: "center",
      },
    },
  ];
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Insider Trading Transactions by Executives & Key Insiders | Stocknear`}
  description={`Stay up-to-date with the latest insider trading activity of ${$displayCompanyName} (${$stockTicker}). View real-time SEC filings, executive and officer trades, transaction details, and insider holdings on Stocknear.`}
/>

<section class="w-full overflow-hidden h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <div class="w-full flex flex-row justify-between mb-10">
          <h1 class="text-xl sm:text-2xl font-bold">
            {$stockTicker} Insider Trading
          </h1>
          <Tutorial {steps} />
        </div>

        <div class="w-full flex flex-row justify-between items-center">
          <h3 class="transactions-count-driver text-xl font-semibold">
            {(rawData?.length || 0)?.toLocaleString("en-US")} Transactions
          </h3>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild let:builder>
              <Button
                builders={[builder]}
                class="filter-type-driver border-gray-300 dark:border-gray-600 border border-gray-300  text-white bg-default sm:hover:bg-black dark:sm:hover:bg-primary ease-out  px-3 py-2  rounded "
              >
                <span class="truncate">Filter Type</span>
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
              side="bottom"
              align="end"
              sideOffset={10}
              alignOffset={0}
              class="w-56 h-fit max-h-72 overflow-y-auto scroller"
            >
              <DropdownMenu.Group>
                {#each transactionList as item}
                  <DropdownMenu.Item
                    class="sm:hover:bg-gray-300 dark:sm:hover:bg-primary"
                  >
                    <div
                      on:click|capture={(event) => event.preventDefault()}
                      class="flex items-center"
                    >
                      <label
                        class="cursor-pointer"
                        on:click={() => handleChangeValue(item)}
                        for={item}
                      >
                        <input type="checkbox" checked={isChecked(item)} />
                        <span class="ml-2">{item}</span>
                      </label>
                    </div>
                  </DropdownMenu.Item>
                {/each}
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        {#if displayList?.length > 0}
          <div
            class="mt-3 flex justify-start items-center w-full m-auto rounded-none sm:rounded mb-4 overflow-x-auto no-scrollbar"
          >
            <table
              class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto"
            >
              <thead class="insider-table-driver">
                <TableHeader {columns} {sortOrders} {sortData} />
              </thead>
              <tbody>
                {#each displayList as item, index}
                  {#if item?.price > 0}
                    <tr
                      class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd {index +
                        1 ===
                        displayList?.slice(0, 6)?.length &&
                      !['Pro', 'Plus']?.includes(data?.user?.tier)
                        ? 'opacity-[0.1]'
                        : ''}"
                    >
                      <td class=" text-sm sm:text-[1rem] ] whitespace-nowrap">
                        <div class="flex flex-col">
                          <span class=""
                            >{formatString(item?.reportingName)?.replace(
                              "/de/",
                              "",
                            )}</span
                          >
                          <span class="text-sm"
                            >{extractOfficeInfo(item?.typeOfOwner)}</span
                          >
                        </div>
                      </td>

                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap ]"
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
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {item?.securitiesTransacted?.toLocaleString("en-US")}
                      </td>
                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        ${item?.price?.toFixed(2)}
                      </td>
                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        ${abbreviateNumber(item?.value)}
                      </td>
                      <td
                        class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                      >
                        {item?.transactionType}
                      </td>
                    </tr>
                  {/if}
                {/each}
              </tbody>
            </table>
          </div>

          <UpgradeToPro {data} />
        {:else if displayList?.length === 0 && filterList?.length > 0}
          <Infobox
            text={`No Transaction Type found for ${removeCompanyStrings($displayCompanyName)}. Try a different filter...`}
          />
        {:else}
          <Infobox
            text={`No trading history available for ${$displayCompanyName}. Likely no
              insider trading has happened yet.`}
          />
        {/if}
      </div>
    </div>
  </div>
</section>
