<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  import { onMount } from "svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import highcharts from "$lib/highcharts.ts";
  import { mode } from "mode-watcher";

  export let data;
  export let title = "Gamma";
  export let ticker;

  $: isGamma = title === "Gamma";

  let rawData = data?.getData || [];

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

  let displayList = rawData?.slice(0, 150);

  function plotData() {
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
        categories: strikes,
        gridLineWidth: 0,
        crosshair: {
          color: $mode === "light" ? "black" : "white", // Set the color of the crosshair line
          width: 1, // Adjust the line width as needed
          dashStyle: "Solid",
        },
        labels: {
          style: {
            color: $mode === "light" ? "#545454" : "white",
          },
          // Only display every 5th label
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
  $: {
    if ($mode) {
      config = plotData() || null;
    }
  }
</script>

<div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
  <h2 class=" flex flex-row items-center text-xl sm:text-2xl font-bold w-fit">
    {ticker}
    {title} Exposure By Strike
  </h2>

  <div class="w-full overflow-hidden m-auto mt-3 shadow-sm">
    {#if config !== null}
      <div>
        <div class="grow">
          <div class="relative">
            <!-- Apply the blur class to the chart -->
            <div
              class="{!['Pro']?.includes(data?.user?.tier)
                ? 'blur-[3px]'
                : ''} mt-5 shadow-sm sm:mt-0 sm:border sm:border-gray-300 dark:border-gray-800 rounded"
              use:highcharts={config}
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
    {/if}
  </div>

  <h3 class="text-xl sm:text-2xl font-bold mt-5">
    {title === "Gamma" ? "GEX" : "DEX"} Table
  </h3>
  <div class="w-full overflow-x-auto mt-3">
    <table
      class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full border border-gray-300 dark:border-gray-800 m-auto"
    >
      <thead>
        <TableHeader {columns} {sortOrders} {sortData} />
      </thead>
      <tbody>
        {#each data?.user?.tier === "Pro" ? displayList : displayList?.slice(0, 3) as item, index}
          <tr
            class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd {index +
              1 ===
              displayList?.slice(0, 3)?.length &&
            !['Pro']?.includes(data?.user?.tier)
              ? 'opacity-[0.1]'
              : ''}"
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

  <UpgradeToPro {data} display={true} />
</div>
