<script lang="ts">
  import { abbreviateNumber, removeCompanyStrings } from "$lib/utils";
  import { displayCompanyName } from "$lib/store";

  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";

  import highcharts from "$lib/highcharts.ts";
  import { mode } from "mode-watcher";

  import { onMount } from "svelte";

  export let data;
  export let ticker = null;

  let isLoaded = false;

  let rawData = data?.getData;
  let dateList = rawData?.map((item) => item?.expiration);
  let selectedDate = dateList?.at(0);
  let selectedMaxPain = rawData?.at(0)?.maxPain;

  let displayList = rawData?.slice(0, 150) || [];

  let configStrike = null;

  function daysLeft(targetDate) {
    // Parse the target date parts:
    const [year, month, day] = targetDate?.split("-")?.map(Number);

    // Build a UTC timestamp for midnight of that date:
    const targetUTCms = Date?.UTC(year, month - 1, day);

    // Now (in ms since epoch, UTC):
    const nowUTCms = Date?.now();

    // Milliseconds in one full day:
    const msPerDay = 24 * 60 * 60 * 1000;

    // Difference, then round up to the next integer day:
    const diff = targetUTCms - nowUTCms;
    const days = Math.ceil(diff / msPerDay);

    return `${days}`;
  }

  function formatDate(dateStr) {
    // Convert the input date string to a Date object in UTC
    let date = new Date(dateStr + "T00:00:00Z");

    // Use the desired format and set timezone if needed
    let options = {
      timeZone: "UTC",
      month: "long", // Full month name
      day: "numeric", // Day without leading zero
      year: "numeric", // Full year
    };

    let formatter = new Intl.DateTimeFormat("en-US", options);

    return formatter.format(date); // e.g., April 11, 2025
  }

  function plotStrikePrice() {
    const raw = rawData?.find((item) => item?.expiration === selectedDate);
    if (!raw) return {};

    // Destructure strikes and payouts
    let strikes = raw.strikes; // e.g. [95,96,97,...]
    let callData = raw.callPayouts;
    let putData = raw.putPayouts;
    selectedMaxPain = raw.maxPain;
    let currPrice = data?.getStockQuote?.price;

    // Ensure current price and maxPain are in our categories
    const extras = [currPrice, selectedMaxPain].filter(
      (s) => typeof s === "number",
    );
    const allStrikes = Array.from(new Set([...strikes, ...extras])).sort(
      (a, b) => a - b,
    );

    // Re-map call/put data to align with allStrikes (fill missing with 0)
    const callSeries = allStrikes.map((s) => {
      const idx = strikes.indexOf(s);
      return idx > -1 ? callData[idx] : 0;
    });
    const putSeries = allStrikes.map((s) => {
      const idx = strikes.indexOf(s);
      return idx > -1 ? putData[idx] : 0;
    });

    // Build the Highcharts options
    return {
      credits: { enabled: false },

      chart: {
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 360,
        animation: false,
      },

      title: {
        text: `<h3 class=\"mt-3 mb-1 text-[1rem] sm:text-lg\"> Max Pain By Strike</h3>`,
        useHTML: true,
        style: { color: $mode === "light" ? "black" : "white" },
      },

      xAxis: {
        categories: allStrikes,
        plotLines: [
          {
            // Underlying Price Line by index
            value: allStrikes?.findIndex((s) => s === currPrice),
            color: $mode === "light" ? "#000" : "#fff",
            dashStyle: "Dash",
            width: 1.5,
            label: {
              text: `Current Price ${currPrice}`,
              style: { color: $mode === "light" ? "#000" : "#fff" },
            },
            zIndex: 5,
          },
          {
            // Max Pain Line by index
            value: allStrikes?.findIndex((s) => s === selectedMaxPain),
            color: $mode === "light" ? "#000" : "#fff",
            dashStyle: "Dash",
            width: 1.5,
            label: {
              text: `Max Pain ${(selectedMaxPain || 0).toFixed(2)}`,
              style: { color: $mode === "light" ? "#000" : "#fff" },
            },
            zIndex: 5,
          },
        ],
        gridLineWidth: 0,
        crosshair: {
          color: $mode === "light" ? "black" : "white",
          width: 1,
          dashStyle: "Solid",
        },
        labels: {
          style: { color: $mode === "light" ? "#545454" : "white" },
          formatter() {
            return this.pos % 1 === 0 ? this.value : "";
          },
        },
        tickAmount: 12,
      },

      yAxis: [
        {
          gridLineWidth: 1,
          gridLineColor: $mode === "light" ? "#e5e7eb" : "#111827",
          labels: { style: { color: $mode === "light" ? "#545454" : "white" } },
          title: { text: null },
          opposite: true,
        },
        {
          gridLineWidth: 0,
          labels: { enabled: false },
          title: { text: null },
        },
      ],

      plotOptions: {
        column: { groupPadding: 0.1, pointPadding: 0.1, borderWidth: 0 },
        series: { animation: false, states: { hover: { enabled: false } } },
      },

      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        borderRadius: 4,
        style: { color: "#fff", fontSize: "16px", padding: "10px" },
        formatter() {
          let s = `<span class=\"text-white font-[501]\">Strike ${this.x}</span><br>`;
          this.points.forEach((point) => {
            s +=
              `<span style=\"display:inline-block;width:10px;height:10px;background-color:${point.color};border-radius:50%;margin-right:5px;\"></span>` +
              `<span class=\"text-white font-semibold text-sm\">${point.series.name}:</span>` +
              `<span class=\"text-white font-normal text-sm\">${abbreviateNumber(point.y)}</span><br>`;
          });
          return s;
        },
      },

      series: [
        {
          name: "Call",
          type: "column",
          data: callSeries,
          color: "#00FC50",
          borderColor: "#00FC50",
          borderRadius: 0,
          marker: { enabled: false },
          animation: false,
        },
        {
          name: "Put",
          type: "column",
          data: putSeries,
          color: "#EE5365",
          borderColor: "#EE5365",
          borderRadius: 0,
          marker: { enabled: false },
          animation: false,
        },
      ],

      legend: {
        enabled: true,
        align: "center", // Positions legend at the left edge
        verticalAlign: "top", // Positions legend at the top
        layout: "horizontal", // Align items horizontally (use 'vertical' if preferred)
        itemStyle: {
          color: $mode === "light" ? "black" : "white",
        },
        symbolWidth: 16, // Controls the width of the legend symbol
        symbolRadius: 8, // Creates circular symbols (adjust radius as needed)
        squareSymbol: false, // Ensures symbols are circular, not square
      },
    };
  }

  $: columns = [
    { key: "date", label: "Date", align: "left" },
    { key: "optionSymbol", label: "Option Chain", align: "left" },
    { key: "dte", label: "DTE", align: "right" },
    { key: "unusualType", label: "Type", align: "right" },
    { key: "executionEst", label: "Exec", align: "right" },
    { key: "sentiment", label: "Sent.", align: "right" },
    { key: "size", label: "Size", align: "right" },
    { key: "price", label: "Spot", align: "right" },
    { key: "premium", label: "Prem", align: "right" },
  ];

  $: sortOrders = {
    date: { order: "none", type: "date" },
    optionSymbol: { order: "none", type: "string" },
    unusualType: { order: "none", type: "string" },
    executionEst: { order: "none", type: "string" },
    dte: { order: "none", type: "number" },
    sentiment: { order: "none", type: "sentiment" },
    size: { order: "none", type: "number" },
    price: { order: "none", type: "number" },
    premium: { order: "none", type: "number" },
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
      displayList = [...originalData]?.slice(0, 150); // Reset originalData to rawData
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
        case "sentiment":
          const sentimentOrder = { BULLISH: 1, NEUTRAL: 2, BEARISH: 3 };
          const sentimentA = sentimentOrder[a?.sentiment?.toUpperCase()] || 4;
          const sentimentB = sentimentOrder[b?.sentiment?.toUpperCase()] || 4;
          return sortOrder === "asc"
            ? sentimentA - sentimentB
            : sentimentB - sentimentA;

        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      // Default comparison for numbers and fallback case
      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    };

    // Sort using the generic comparison function
    displayList = [...originalData].sort(compareValues)?.slice(0, 150);
  };

  $: {
    if ($mode || selectedDate) {
      configStrike = plotStrikePrice() || null;
    }
  }
</script>

<section class="w-full overflow-hidden min-h-screen pb-40">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
        <h2
          class=" flex flex-row items-center text-xl sm:text-2xl font-bold w-fit mb-2 sm:mb-0"
        >
          {removeCompanyStrings($displayCompanyName)} Max Pain
        </h2>
        <Infobox
          text={`The Max Pain for NVDA options expiring on ${formatDate(
            selectedDate,
          )} (${
            selectedDate ? daysLeft(selectedDate) : "n/a"
          } days) is $${selectedMaxPain}.`}
        />

        <div class="mt-4">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild let:builder>
              <Button
                builders={[builder]}
                class=" border-gray-300 dark:border-none shadow-sm bg-white dark:bg-[#000] h-[35px] flex flex-row justify-between items-center min-w-[130px] w-[140px] sm:w-auto  px-3  rounded-md truncate"
              >
                <span class="truncate text-sm"
                  >Date Expiration | {formatDate(selectedDate)}</span
                >
                <svg
                  class="-mr-1 ml-2 h-5 w-5 inline-block"
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
              class="min-w-56 w-auto max-w-60 max-h-[400px] overflow-y-auto scroller relative"
            >
              <!-- Dropdown items -->
              <DropdownMenu.Group class="pb-2"
                >{#each dateList as item}
                  <DropdownMenu.Item
                    on:click={() => {
                      selectedDate = item;
                    }}
                    class="sm:hover:bg-gray-200 dark:sm:hover:bg-primary cursor-pointer "
                  >
                    {formatDate(item)}
                  </DropdownMenu.Item>
                {/each}</DropdownMenu.Group
              >
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>

        <div>
          <div class="grow mt-3">
            <div class="relative">
              <!-- Apply the blur class to the chart -->
              <div
                class="{!['Pro']?.includes(data?.user?.tier)
                  ? 'blur-[3px]'
                  : ''} mt-5 shadow-sm sm:mt-0 sm:border sm:border-gray-300 dark:border-gray-800 rounded"
                use:highcharts={configStrike}
              ></div>
              <!-- Overlay with "Upgrade to Pro" -->
              {#if !["Pro"]?.includes(data?.user?.tier)}
                <div
                  class="font-bold text-lg sm:text-xl absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center text-muted dark:text-white"
                >
                  <a
                    href="/pricing"
                    class="sm:hover:text-blue-700 dark:sm:hover:text-white dark:text-white flex flex-row items-center"
                  >
                    <span>Upgrade to Pro</span>
                    <svg
                      class="ml-1 w-5 h-5 sm:w-6 sm:h-6 inline-block"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      ><path
                        fill="currentColor"
                        d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                      /></svg
                    >
                  </a>
                </div>
              {/if}
            </div>
          </div>
        </div>
        <!--
        <div class="w-full overflow-x-auto">
          <table
            class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full border border-gray-300 dark:border-gray-800 m-auto mt-4"
          >
            <thead class="text-muted dark:text-white dark:bg-default">
              <TableHeader {columns} {sortOrders} {sortData} />
            </thead>
            <tbody>
              {#each data?.user?.tier !== "Pro" ? displayList?.slice(0, 3) : displayList as item, index}
                <tr
                  class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd {index +
                    1 ===
                    rawData?.slice(0, 3)?.length &&
                  !['Pro']?.includes(data?.user?.tier)
                    ? 'opacity-[0.1]'
                    : ''}"
                >
                  <td
                    class=" text-sm sm:text-[1rem] text-start whitespace-nowrap"
                  >
                    {formatDate(item?.date)}
                  </td>

                  <td
                    class="text-sm sm:text-[1rem] text-start whitespace-nowrap flex justify-between"
                  >
                    <span
                      class="inline-block px-2 {item?.optionType === 'Calls'
                        ? 'text-green-800 dark:text-[#00FC50]'
                        : 'text-red-800 dark:text-[#FF2F1F]'}"
                    >
                      {item?.optionType}
                    </span>
                    <label
                      on:click={() => handleViewData(item)}
                      on:mouseover={() =>
                        getContractHistory(item?.option_symbol)}
                      class="cursor-pointer text-[#3B82F6] dark:text-[#04D9FF] dark:sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                    >
                      {item?.strike}

                      {" " + item?.expiry}

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="inline-block w-4 h-4 -mt-1"
                        viewBox="0 0 512 512"
                        fill={$mode === "light" ? "#3B82F6" : "#04D9FF"}
                        ><path
                          d="M104 496H72a24 24 0 01-24-24V328a24 24 0 0124-24h32a24 24 0 0124 24v144a24 24 0 01-24 24zM328 496h-32a24 24 0 01-24-24V232a24 24 0 0124-24h32a24 24 0 0124 24v240a24 24 0 01-24 24zM440 496h-32a24 24 0 01-24-24V120a24 24 0 0124-24h32a24 24 0 0124 24v352a24 24 0 01-24 24zM216 496h-32a24 24 0 01-24-24V40a24 24 0 0124-24h32a24 24 0 0124 24v432a24 24 0 01-24 24z"
                        ></path></svg
                      >
                    </label>
                  </td>

                  <td
                    class=" text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.dte}
                  </td>

                  <td
                    class=" text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.unusualType}
                  </td>

                  <td
                    class=" text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.executionEst}
                  </td>

                  <td
                    class="text-sm sm:text-[1rem] text-end whitespace-nowrap {item?.sentiment ===
                    'Bullish'
                      ? 'text-green-800 dark:text-[#00FC50]'
                      : item?.sentiment === 'Bearish'
                        ? 'text-red-800 dark:text-[#FF2F1F]'
                        : 'text-orange-600 dark:text-[#C8A32D]'} "
                  >
                    {item?.sentiment}
                  </td>
                  <td
                    class=" text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.size?.toLocaleString("en-US")}
                  </td>

                  <td
                    class=" text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {item?.price}
                  </td>
                  <td
                    class=" text-sm sm:text-[1rem] text-end whitespace-nowrap"
                  >
                    {abbreviateNumber(item?.premium, false, true)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <UpgradeToPro {data} display={true} />
        -->
      </div>
    </div>
  </div>
</section>
