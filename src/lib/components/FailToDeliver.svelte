<script lang="ts">
  import {
    displayCompanyName,
    stockTicker,
    assetType,
    etfTicker,
  } from "$lib/store";
  import { abbreviateNumber, removeCompanyStrings } from "$lib/utils";
  import { goto } from "$app/navigation";
  import highcharts from "$lib/highcharts.ts";
  import { mode } from "mode-watcher";

  export let data;
  export let rawData = [];

  let config = null;

  let avgFailToDeliver;
  let weightedFTD;

  let activeIdx = 0;
  const tabs = [
    {
      title: "Daily",
    },
    {
      title: "Quarterly",
    },
  ];

  let tableList = rawData?.sort(
    (a, b) => new Date(b?.date) - new Date(a?.date),
  );

  function changeTimePeriod(i) {
    activeIdx = i;
    tableList = rawData?.sort((a, b) => new Date(b?.date) - new Date(a?.date));

    if (activeIdx === 1) {
      tableList = filterByPeriod([...tableList]);
    }
  }

  function filterByPeriod(data) {
    if (!Array.isArray(data) || data.length === 0) return [];

    // Quarterly: one result per year-quarter.
    const seenPeriods = new Set();
    return data.filter((item) => {
      const dt = new Date(item.date);
      const year = dt.getFullYear();
      const quarter = Math.floor(dt.getMonth() / 3) + 1; // Quarter 1 to 4
      const key = `${year}-Q${quarter}`;
      if (!seenPeriods.has(key)) {
        seenPeriods.add(key);
        return true;
      }
      return false;
    });
  }

  function getPlotOptions() {
    let dates = [];
    let priceList = [];
    let failToDeliverList = [];
    rawData?.sort((a, b) => new Date(a?.date) - new Date(b?.date));
    rawData?.forEach((item) => {
      dates?.push(item?.date);
      priceList?.push(Number(item?.price));
      failToDeliverList?.push(item?.failToDeliver);
    });

    const totalNumber = failToDeliverList?.reduce((acc, item) => acc + item, 0);
    avgFailToDeliver = Math?.floor(totalNumber / failToDeliverList?.length);

    const options = {
      credits: {
        enabled: false,
      },
      chart: {
        // Removed global type so each series can define its own type.
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 360,
        animation: false,
      },
      title: {
        text: `<h3 class="mt-3 mb-1 text-[1rem] sm:text-lg">${removeCompanyStrings($displayCompanyName)} FTD</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
        },
        useHTML: true,
      },
      plotOptions: {
        series: {
          color: $mode === "light" ? "black" : "white",
          animation: false, // Disable series animation
          states: {
            hover: {
              enabled: false, // Disable hover effect globally
            },
          },
        },
      },
      legend: {
        enabled: false,
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
          // Format the x value to display time in hh:mm format
          let tooltipContent = `<span class=" m-auto text-[1rem] font-[501]">${new Date(
            this?.x,
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</span><br>`;

          // Loop through each point in the shared tooltip
          this.points.forEach((point) => {
            tooltipContent += `<span class=" font-semibold text-sm">${point.series.name}:</span> 
          <span class=" font-normal text-sm">${abbreviateNumber(
            point.y,
          )}</span><br>`;
          });

          return tooltipContent;
        },
      },
      xAxis: {
        endOnTick: false,
        categories: dates,
        crosshair: {
          color: $mode === "light" ? "black" : "white", // Set the color of the crosshair line
          width: 1, // Adjust the line width as needed
          dashStyle: "Solid",
        },

        labels: {
          style: { color: $mode === "light" ? "black" : "white" },
          distance: 20, // Increases space between label and axis
          formatter: function () {
            return new Date(this.value).toLocaleDateString("en-US", {
              day: "2-digit", // Include day number
              month: "short", // Display short month name
              year: "numeric", // Include year
            });
          },
        },
      },
      yAxis: [
        {
          gridLineWidth: 1,
          gridLineColor: $mode === "light" ? "#d1d5dc" : "#111827",
          labels: {
            enabled: false,
          },
          title: {
            text: null,
          },
          opposite: true,
        },
        {
          gridLineWidth: 1,
          gridLineColor: $mode === "light" ? "#d1d5dc" : "#111827",
          labels: {
            enabled: false,
          },
          title: {
            text: null,
          },
          opposite: true,
        },
      ],
      series: [
        {
          // FTD Shares area series drawn first (behind the line)
          name: "FTD Shares",
          type: "area",
          data: failToDeliverList,
          fillOpacity: 1,
          yAxis: 1,
          color: "#E11D48",
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: false,
              },
            },
          },
        },
        {
          // Price line series drawn on top
          name: "Price",
          type: "line",
          data: priceList,
          color: $mode === "light" ? "#2C6288" : "#fff",
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: false,
              },
            },
          },
          lineWidth: 2,
        },
      ],
    };

    return options;
  }

  $: {
    if ($stockTicker || $etfTicker || $mode) {
      const ticker = $assetType === "stock" ? $stockTicker : $etfTicker;
      if (ticker) {
        if (rawData?.length > 0) {
          weightedFTD = (
            (rawData?.slice(-1)?.at(0)?.failToDeliver /
              data?.getStockQuote?.avgVolume) *
            100
          )?.toFixed(2);
          config = getPlotOptions();
        }
      }
    }
  }
</script>

<section class="overflow-hidden h-full pb-8">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center w-full mt-3">
      <h1 class="text-xl sm:text-2xl font-bold">FTD Chart</h1>
    </div>

    {#if rawData?.length !== 0}
      <div class="w-full flex flex-col items-start">
        <div class=" text-[1rem] mt-2 mb-2 w-full">
          Over the past year, {$displayCompanyName} has seen a monthly average of
          <span class="font-semibold"
            >{avgFailToDeliver?.toLocaleString("en-US")}
          </span> fail to deliver shares.
        </div>
      </div>

      <div
        class="chart mt-5 sm:mt-0 border border-gray-300 dark:border-gray-800 rounded"
        use:highcharts={config}
      ></div>

      <div
        class="mt-5 flex flex-col sm:flex-row items-start sm:items-center w-full justify-between sm:border-y border-gray-300 dark:border-gray-800 sm:pt-2 sm:pb-2"
      >
        <h3 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">FTD History</h3>

        <div
          class="inline-flex justify-center w-full rounded-md sm:w-auto sm:ml-auto"
        >
          <div
            class="bg-gray-300 dark:bg-secondary w-full min-w-24 sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1"
          >
            {#each tabs as item, i}
              {#if !["Pro", "Plus"]?.includes(data?.user?.tier) && i > 0}
                <button
                  on:click={() => goto("/pricing")}
                  class="cursor-pointer group relative z-1 rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1"
                >
                  <span class="relative text-sm block font-semibold">
                    {item.title}
                    <svg
                      class="inline-block ml-0.5 -mt-1 w-3.5 h-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      ><path
                        fill="currentColor"
                        d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                      /></svg
                    >
                  </span>
                </button>
              {:else}
                <button
                  on:click={() => changeTimePeriod(i)}
                  class="cursor-pointer group relative z-1 rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {activeIdx ===
                  i
                    ? 'z-0'
                    : ''} "
                >
                  {#if activeIdx === i}
                    <div class="absolute inset-0 rounded-md bg-[#fff]"></div>
                  {/if}
                  <span
                    class="relative text-sm block font-semibold whitespace-nowrap {activeIdx ===
                    i
                      ? 'text-black'
                      : ''}"
                  >
                    {item.title}
                  </span>
                </button>
              {/if}
            {/each}
          </div>
        </div>
      </div>

      <div class="w-full overflow-x-auto">
        <table
          class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full bg-white dark:bg-table border border-gray-300 dark:border-gray-800 m-auto mt-4"
        >
          <thead class="text-muted dark:text-white dark:bg-default">
            <tr>
              <th class=" font-semibold text-start text-sm">Date</th>
              <th class=" font-semibold text-end text-sm">Price</th>
              <th class=" font-semibold text-end text-sm">FTD Shares</th>
              <th class=" font-semibold text-end text-sm">% Change</th>
            </tr>
          </thead>
          <tbody>
            {#each tableList as item, index}
              <!-- row -->
              <tr
                class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd"
              >
                <td class=" text-sm sm:text-[1rem] whitespace-nowrap">
                  {new Date(item?.date)?.toLocaleDateString("en-US", {
                    day: "2-digit", // Include day number
                    month: "short", // Display short month name
                    year: "numeric", // Include year
                  })}
                </td>

                <td
                  class=" text-sm sm:text-[1rem] text-right whitespace-nowrap"
                >
                  {item?.price}
                </td>

                <td
                  class=" text-sm sm:text-[1rem] text-right whitespace-nowrap"
                >
                  {abbreviateNumber(item?.failToDeliver)}
                </td>

                <td class=" text-sm sm:text-[1rem] whitespace-nowrap text-end">
                  {#if index === tableList?.length - 1}
                    n/a
                  {:else if item?.failToDeliver > tableList[index + 1]?.failToDeliver}
                    <span class="text-green-600 dark:text-[#00FC50]">
                      +{(
                        ((item?.failToDeliver -
                          tableList[index + 1]?.failToDeliver) /
                          tableList[index + 1]?.failToDeliver) *
                        100
                      )?.toFixed(2)}%
                    </span>
                  {:else if item?.failToDeliver < tableList[index + 1]?.failToDeliver}
                    <span class="text-red-600 dark:text-[#FF2F1F]">
                      -{(
                        Math.abs(
                          (item?.failToDeliver -
                            tableList[index + 1]?.failToDeliver) /
                            tableList[index + 1]?.failToDeliver,
                        ) * 100
                      )?.toFixed(2)}%
                    </span>
                  {:else}
                    n/a
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </main>
</section>
