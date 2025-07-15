<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import highcharts from "$lib/highcharts.ts";
  import { mode } from "mode-watcher";
  import { goto } from "$app/navigation";
  import Infobox from "$lib/components/Infobox.svelte";

  export let data;
  export let title = "Gamma";
  export let ticker;
  let currentPrice = null;

  $: isGamma = title === "Gamma";

  let dateList = [
    "All",
    ...Object?.keys(data?.getData ?? {})?.sort(
      (a, b) => new Date(a) - new Date(b),
    ),
  ];

  // New variables for multiple selection
  let selectedDates = new Set(["All"]); // Start with "All" selected
  let checkedDates = new Set(["All"]); // Track which dates are checked

  let rawData = [];
  let displayList = [];

  // Function to handle date selection changes
  async function handleDateChange(dateValue) {
    if (dateValue === "All") {
      // If "All" is selected, clear other selections
      if (checkedDates.has("All")) {
        checkedDates.delete("All");
        selectedDates.delete("All");
      } else {
        checkedDates.clear();
        selectedDates.clear();
        checkedDates.add("All");
        selectedDates.add("All");
      }
    } else {
      // If a specific date is selected
      if (checkedDates.has(dateValue)) {
        checkedDates.delete(dateValue);
        selectedDates.delete(dateValue);
      } else {
        // Remove "All" if it was selected
        checkedDates.delete("All");
        selectedDates.delete("All");
        checkedDates.add(dateValue);
        selectedDates.add(dateValue);
      }
    }

    // If no dates are selected, default to "All"
    if (selectedDates.size === 0) {
      checkedDates.add("All");
      selectedDates.add("All");
    }

    // Update the arrays to trigger reactivity
    selectedDates = new Set(selectedDates);
    checkedDates = new Set(checkedDates);

    // Recalculate data
    updateDataForSelectedDates();
    dateList = [...dateList];
  }

  function isDateChecked(dateValue) {
    return checkedDates.has(dateValue);
  }

  function updateDataForSelectedDates() {
    if (selectedDates.has("All")) {
      rawData = aggregateDict(data?.getData) || [];
    } else {
      // Aggregate data for selected dates only
      const selectedData = {};
      selectedDates.forEach((date) => {
        if (data?.getData[date]) {
          selectedData[date] = data?.getData[date];
        }
      });
      rawData = aggregateDict(selectedData) || [];
    }

    rawData = rawData?.map((item) => {
      if (title === "Gamma") {
        return {
          ...item,
          net_gex: (item?.call_gex || 0) + (item?.put_gex || 0),
          put_call_ratio:
            item?.call_gex > 0
              ? Math.abs((item?.put_gex || 0) / item?.call_gex)
              : null,
        };
      } else {
        return {
          ...item,
          net_dex: (item?.call_dex || 0) + (item?.put_dex || 0),
          put_call_ratio:
            item?.call_dex > 0
              ? Math.abs((item?.put_dex || 0) / item?.call_dex)
              : null,
        };
      }
    });

    displayList = rawData?.slice(0, 20);
    config = plotData() || null;
  }

  // Get display text for selected dates
  function getSelectedDatesText() {
    if (selectedDates.has("All")) {
      return "All Expiries";
    } else if (selectedDates.size === 1) {
      const singleDate = Array.from(selectedDates)[0];
      return formatDate(singleDate);
    } else {
      return `${selectedDates.size} Expiries Selected`;
    }
  }

  function aggregateDict(data) {
    const map = new Map();

    // pick which keys to accumulate
    const isGamma = title === "Gamma";
    const callKey = isGamma ? "call_gex" : "call_dex";
    const putKey = isGamma ? "put_gex" : "put_dex";

    // flatten out all the points into one loop
    for (const pts of Object?.values(data)) {
      for (const pt of pts) {
        const { strike } = pt;

        // on first sight of this strike, seed all four fields at zero
        if (!map?.has(strike)) {
          map?.set(strike, {
            strike,
            call_gex: 0,
            put_gex: 0,
            call_dex: 0,
            put_dex: 0,
          });
        }

        // accumulate into the right buckets
        const agg = map.get(strike);
        agg[callKey] += pt[callKey] ?? 0;
        agg[putKey] += pt[putKey] ?? 0;
      }
    }

    // sort by strike ascending
    return Array?.from(map?.values())?.sort((a, b) => a?.strike - b?.strike);
  }

  function formatDate(dateStr) {
    try {
      let date = new Date(dateStr + "T00:00:00Z");
      let options = {
        timeZone: "UTC",
        month: "short", // Full month name
        day: "numeric", // Day without leading zero
        year: "numeric", // Full year
      };

      let formatter = new Intl.DateTimeFormat("en-US", options);

      return formatter?.format(date);
    } catch (e) {
      return "n/a";
    }
  }

  function plotData() {
    currentPrice = Number(data?.getStockQuote?.price?.toFixed(2));

    const isGamma = title === "Gamma"; // Don't delete this; isGamma is used below.
    const processedData = rawData
      ?.map((d) => ({
        strike: d?.strike,
        callValue: isGamma ? d?.call_gex : d?.call_dex,
        putValue: isGamma ? d?.put_gex : d?.put_dex,
        netValue: isGamma ? d?.net_gex : d?.net_dex,
      }))
      ?.sort((a, b) => a.strike - b.strike);

    // Extract data arrays
    const strikes = processedData?.map((d) => d.strike);

    const allStrikes = Array.from(
      new Set([...strikes, ...[currentPrice]]),
    )?.sort((a, b) => a - b);

    // Ensure numerical values instead of strings (toFixed returns a string)
    const callValues = processedData?.map((d) =>
      parseFloat(d.callValue.toFixed(2)),
    );
    const putValues = processedData?.map((d) =>
      parseFloat(d.putValue.toFixed(2)),
    );
    const netValues = processedData?.map((d) =>
      parseFloat(d.netValue.toFixed(2)),
    );

    const options = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "column",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 360,
        animation: false,
      },
      title: {
        text: `<h3 class="mt-3 mb-1 ">${ticker} ${title === "Gamma" ? "GEX" : "DEX"} Chart</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },
      legend: {
        enabled: true,
        align: "center", // Positions legend at the left edge
        verticalAlign: "top", // Positions legend at the top
        layout: "horizontal", // Align items horizontally (use 'vertical' if preferred)
        itemStyle: {
          color: $mode === "light" ? "black" : "white",
        },
        symbolWidth: 14, // Controls the width of the legend symbol
        symbolRadius: 1, // Creates circular symbols (adjust radius as needed)
        squareSymbol: true, // Ensures symbols are circular, not square
      },
      plotOptions: {
        series: {
          animation: false,
          stacking: "normal",
        },
      },
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black
        borderColor: "rgba(255, 255, 255, 0.2)", // Slightly visible white border
        borderWidth: 1,
        style: {
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
        borderRadius: 4,
        formatter: function () {
          // Displaying "Strike" and the x value in the header
          let tooltipContent = `<span class="text-white m-auto text-black text-[1rem] font-[501]">Strike ${this?.x}</span><br>`;

          // Loop through each point in the shared tooltip
          this.points.forEach((point) => {
            tooltipContent += `
        <span style="display:inline-block; width:10px; height:10px; background-color:${point.color}; border-radius:50%; margin-right:5px;"></span>
        <span class="text-white font-semibold text-sm">${point.series.name}:</span> 
        <span class="text-white font-normal text-sm">${abbreviateNumber(point.y)}</span><br>`;
          });

          return tooltipContent;
        },
      },
      xAxis: {
        categories: allStrikes,
        gridLineWidth: 0,
        crosshair: {
          color: $mode === "light" ? "black" : "white", // Set the color of the crosshair line
          width: 1, // Adjust the line width as needed
          dashStyle: "Solid",
        },
        plotLines: [
          {
            value: allStrikes?.findIndex((s) => s === currentPrice),
            color: $mode === "light" ? "#000" : "#fff",
            dashStyle: "Dash",
            width: 1.5,
            label: {
              text: `Current Price ${currentPrice}`,
              style: { color: $mode === "light" ? "#000" : "#fff" },
            },
            zIndex: 5,
          },
        ],
        labels: {
          style: {
            color: $mode === "light" ? "#545454" : "white",
          },
          // Only display every 2nd label
          formatter: function () {
            return this.pos % 2 === 0 ? this.value : "";
          },
        },
      },
      yAxis: {
        gridLineWidth: 1,
        gridLineColor: $mode === "light" ? "#e5e7eb" : "#111827",
        labels: {
          style: { color: $mode === "light" ? "#545454" : "white" },
          formatter: function () {
            return abbreviateNumber(this.value);
          },
        },
        title: { text: null },
        opposite: true,
      },
      series: [
        {
          name: `Put ${isGamma ? "Gamma" : "Delta"}`,
          data: putValues,
          stack: "value",
          color: "#9B5DC4",
          borderColor: "#9B5DC4",
          borderRadius: "1px",
          animation: false,
        },
        {
          name: `Net ${isGamma ? "Gamma" : "Delta"}`,
          data: netValues,
          stack: "value",
          color: "#FF2F1F",
          borderColor: "#FF2F1F",
          borderRadius: "1px",
          animation: false,
        },
        {
          name: `Call ${isGamma ? "Gamma" : "Delta"}`,
          data: callValues,
          stack: "value",
          color: "#C4E916",
          borderColor: "#C4E916",
          borderRadius: "1px",
          animation: false,
        },
      ],
    };

    return options;
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

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    updateDataForSelectedDates(); // Initialize data
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: columns = [
    { key: "strike", label: "Strike Price", align: "left" },
    {
      key: isGamma ? "call_gex" : "call_dex",
      label: `Call ${isGamma ? "GEX" : "Delta"}`,
      align: "right",
    },
    {
      key: isGamma ? "put_gex" : "put_dex",
      label: `Put ${isGamma ? "GEX" : "Delta"}`,
      align: "right",
    },
    {
      key: isGamma ? "net_gex" : "net_dex",
      label: `Net ${isGamma ? "GEX" : "Delta"}`,
      align: "right",
    },
    {
      key: "put_call_ratio",
      label: `P/C`,
      align: "right",
    },
  ];

  $: sortOrders = {
    strike: { order: "none", type: "number" },
    [isGamma ? "call_gex" : "call_dex"]: { order: "none", type: "number" },
    [isGamma ? "put_gex" : "put_dex"]: { order: "none", type: "number" },
    [isGamma ? "net_gex" : "net_dex"]: { order: "none", type: "number" },
    put_call_ratio: { order: "none", type: "number" },
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
      originalData = [...rawData]; // Reset originalData to rawDataVolume
      displayList = originalData;
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
    displayList = [...originalData].sort(compareValues);
  };

  let config = null;

  // Reactive statement to update when mode changes
  $: if ($mode) {
    config = plotData() || null;
  }
</script>

<div class="sm:pl-7 sm:pb-7 sm:pt-5 w-full m-auto mt-2 sm:mt-0">
  <h2 class=" flex flex-row items-center text-xl sm:text-2xl font-bold w-fit">
    {ticker}
    {title} Exposure By Strike
  </h2>

  <div class="mt-6 sm:mt-0">
    <Infobox
      text={title === "Gamma"
        ? `Gamma Exposure (GEX) for ${ticker} options, representing the estimated dollar value of shares that option sellers must buy or sell to maintain delta neutrality for each 1% move in ${ticker}'s stock price.`
        : `Delta Exposure (DEX) for ${ticker} options, representing the estimated net number of ${ticker} shares that option sellers must hold or short to hedge their current options positions and maintain delta neutrality.`}
    />
  </div>

  <p class="mt-3 mb-2">
    {#if rawData?.length > 0}
      {title} exposure data for <strong>{ticker}</strong> options contracts.
      {#if selectedDates.has("All")}
        Displaying aggregated exposure across all expiration dates.
      {:else if selectedDates.size === 1}
        Showing exposure for contracts expiring on <strong
          >{formatDate(Array.from(selectedDates)[0])}</strong
        >.
      {:else}
        Showing aggregated exposure for <strong>{selectedDates.size}</strong> selected
        expiration dates.
      {/if}
      Total call {title.toLowerCase()}
      exposure:
      <strong>
        {abbreviateNumber(
          rawData
            ?.reduce(
              (sum, item) =>
                sum + (isGamma ? (item?.call_gex ?? 0) : (item?.call_dex ?? 0)),
              0,
            )
            ?.toFixed(2),
        )}
      </strong>. Total put {title.toLowerCase()} exposure:
      <strong>
        {abbreviateNumber(
          rawData
            ?.reduce(
              (sum, item) =>
                sum + (isGamma ? (item?.put_gex ?? 0) : (item?.put_dex ?? 0)),
              0,
            )
            ?.toFixed(2),
        )}
      </strong>.
    {:else}
      No {title.toLowerCase()} exposure data available for the selected period.
    {/if}
  </p>

  <div class="mt-7">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild let:builder>
        <Button
          builders={[builder]}
          class=" border border-gray-300 dark:border-gray-700  text-white bg-black sm:hover:bg-default dark:default h-[38px] flex flex-row justify-between items-center min-w-[130px] max-w-[240px] sm:w-auto  px-3  rounded truncate"
        >
          <span class="truncate text-sm"
            >Date Expiration | {getSelectedDatesText()}</span
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
        side="bottom"
        align="end"
        sideOffset={10}
        alignOffset={0}
        class="min-w-56 w-auto max-w-60 max-h-[400px] overflow-y-auto scroller relative"
      >
        <DropdownMenu.Group class="pb-2">
          {#each dateList as item, index}
            {#if data?.user?.tier === "Pro" || index === 0}
              <DropdownMenu.Item
                class="sm:hover:bg-gray-300 dark:sm:hover:bg-primary"
              >
                <div
                  on:click|capture={(event) => event.preventDefault()}
                  class="flex items-center"
                >
                  <label
                    class="cursor-pointer"
                    on:click={() => handleDateChange(item)}
                    for={item}
                  >
                    <input type="checkbox" checked={isDateChecked(item)} />
                    <span class="ml-2">
                      {item === "All" ? "All Expiries" : formatDate(item)}
                    </span>
                  </label>
                </div>
              </DropdownMenu.Item>
            {:else}
              <DropdownMenu.Item
                on:click={() => goto("/pricing")}
                class="cursor-pointer sm:hover:bg-gray-200 dark:sm:hover:bg-primary"
              >
                {formatDate(item)}
                <svg
                  class="ml-1 size-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style="max-width: 40px;"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clip-rule="evenodd"
                  >
                  </path>
                </svg>
              </DropdownMenu.Item>
            {/if}
          {/each}
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>

  <div class="w-full overflow-hidden m-auto sm:mt-3 shadow-xs">
    {#if config !== null}
      <div>
        <div class="grow">
          <div class="relative">
            <!-- Apply the blur class to the chart -->
            <div
              class="mt-5 shadow-xs sm:mt-0 sm:border sm:border-gray-300 dark:border-gray-800 rounded"
              use:highcharts={config}
            ></div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <h3 class="text-xl sm:text-2xl font-bold mt-5">
    {title === "Gamma" ? "GEX" : "DEX"} Table
  </h3>
  <div class="w-full overflow-x-auto mt-3">
    <table
      class="table table-sm table-compact no-scrollbar rounded-none sm:rounded w-full border border-gray-300 dark:border-gray-800 m-auto"
    >
      <thead>
        <TableHeader {columns} {sortOrders} {sortData} />
      </thead>
      <tbody>
        {#each displayList as item, index}
          <tr
            class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
          >
            <td class=" text-sm sm:text-[1rem] text-start whitespace-nowrap">
              {item?.strike?.toFixed(2)}
            </td>
            <td class=" text-sm sm:text-[1rem] text-end whitespace-nowrap">
              {abbreviateNumber(
                (isGamma ? item?.call_gex : item?.call_dex)?.toFixed(2),
              )}
            </td>
            <td class=" text-sm sm:text-[1rem] text-end whitespace-nowrap">
              {abbreviateNumber(
                (isGamma ? item?.put_gex : item?.put_dex)?.toFixed(2),
              )}
            </td>

            <td class=" text-sm sm:text-[1rem] text-end whitespace-nowrap">
              {abbreviateNumber(
                (isGamma ? item?.net_gex : item?.net_dex)?.toFixed(2),
              )}
            </td>

            <td class=" text-sm sm:text-[1rem] text-end whitespace-nowrap">
              {#if item?.put_call_ratio <= 1 && item?.put_call_ratio !== null}
                <span class="text-green-800 dark:text-[#00FC50]"
                  >{item?.put_call_ratio?.toFixed(2)}</span
                >
              {:else if item?.put_call_ratio > 1 && item?.put_call_ratio !== null}
                <span class="text-red-800 dark:text-[#FF2F1F]"
                  >{item?.put_call_ratio?.toFixed(2)}</span
                >
              {:else}
                n/a
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
