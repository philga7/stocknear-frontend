<script lang="ts">
  import { displayCompanyName, stockTicker } from "$lib/store";
  import { abbreviateNumber, monthNames } from "$lib/utils";
  import SEO from "$lib/components/SEO.svelte";

  //import * as XLSX from 'xlsx';
  import { goto } from "$app/navigation";
  import { Chart } from "svelte-echarts";

  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import Infobox from "$lib/components/Infobox.svelte";
  use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;

  let optionsData = null;

  let rawData = data?.getHistoricalRevenue || {};
  let tableList = [];

  const tabs = [
    {
      title: "Annual",
    },
    {
      title: "Quarterly",
    },
  ];
  let activeIdx = 0;
  let timeIdx = 0;

  const plotTabs = [
    {
      title: "Annual",
    },
    {
      title: "Quarterly",
    },
  ];

  function changeTablePeriod(index) {
    activeIdx = index;
    const rawData = data?.getHistoricalRevenue;
    if (activeIdx === 0) {
      // Clone the array before sorting
      tableList = [...rawData?.annual];
      tableList.sort((a, b) => new Date(b?.date) - new Date(a?.date));
    } else {
      tableList = [...rawData?.quarter];
      tableList.sort((a, b) => new Date(b?.date) - new Date(a?.date));
    }
  }

  async function changeTimePeriod(state) {
    timeIdx = state;
    optionsData = plotData();
  }

  function plotData() {
    let filteredData = [];
    const rawData = data?.getHistoricalRevenue;
    if (timeIdx === 0) {
      // Clone the array before sorting
      filteredData = [...rawData?.annual];
    } else {
      filteredData = [...rawData?.quarter];
    }
    // Sort ascending for plotting
    filteredData.sort((a, b) => new Date(a?.date) - new Date(b?.date));

    const dates = filteredData.map((item) => item?.date);
    const valueList = filteredData.map((item) => item?.revenue);

    const options = {
      animation: false,
      grid: {
        left: "0%",
        right: "2%",
        bottom: "2%",
        top: "10%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: dates,
          axisLabel: {
            color: "#fff",
            formatter: function (value) {
              // Assuming dates are in the format 'yyyy-mm-dd'
              const dateParts = value.split("-");
              const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
              const year = parseInt(dateParts[0]);
              const day = parseInt(dateParts[2]);
              return `${day} ${monthNames[monthIndex]} ${year}`;
            },
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
      ],
      series: [
        {
          name: "Revenue",
          data: valueList,
          type: "bar",
          smooth: true,
          symbol: "none",
          itemStyle: {
            color: "#f2f1f0",
          },
          barWidth: "60%",
        },
      ],
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
        borderColor: "#969696", // Black border color
        borderWidth: 1, // Border width of 1px
        backgroundColor: "#313131", // Optional: Set background color for contrast
        textStyle: {
          color: "#fff", // Optional: Text color for better visibility
        },
        formatter: function (params) {
          // Get the timestamp from the first parameter
          const timestamp = params[0].axisValue;
          // Initialize result with timestamp
          let result = timestamp + "<br/>";
          // Add each series data
          params.forEach((param) => {
            const marker =
              '<span style="display:inline-block;margin-right:4px;' +
              "border-radius:10px;width:10px;height:10px;background-color:" +
              param.color +
              '"></span>';
            result +=
              marker +
              param.seriesName +
              ": " +
              abbreviateNumber(param.value, false, true) +
              "<br/>";
          });
          return result;
        },
        axisPointer: {
          lineStyle: {
            color: "#fff",
          },
        },
      },
    };

    return options;
  }

  changeTablePeriod(0);
  optionsData = plotData();
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Market Cap & Net Worth`}
  description={`Historical Revenue of ${$displayCompanyName}.`}
/>

<section class="bg-default w-full overflow-hidden text-white h-full">
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0">
          <div class="">
            <h1 class="text-xl sm:text-2xl text-white font-bold">Market Cap</h1>
          </div>

          {#if rawData?.length !== 0}
            <div class="grid grid-cols-1 gap-2 mt-3 mb-3 sm:mt-0 sm:mb-0">
              <Infobox
                text="Apple had revenue of $124.30B in the quarter ending December 28, 2024, with 3.95% growth. This brings the company's revenue in the last twelve months to $395.76B, up 2.61% year-over-year. In the fiscal year ending September 28, 2024, Apple had annual revenue of $391.04B with 2.02% growth."
              />

              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 mt-3"
              >
                <div
                  class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Revenue (ttm)</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white">
                      {abbreviateNumber(rawData?.revenue, true)}</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Revenue Growth</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white"
                      >{rawData?.growthRevenue}%</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Price / Sales Ratio</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white"
                      >{rawData?.priceToSalesRatio}</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Revenue / Employee </span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white"
                      >{abbreviateNumber(
                        rawData?.revenuePerEmployee,
                        true,
                      )}</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Employees </span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white"
                      >{rawData?.employees?.toLocaleString("en-US")}</span
                    >
                  </div>
                </div>
                <div
                  class="bg-gray-800/30 rounded p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div
                    class="text-[#c3c6d0] text-sm sm:text-[1rem] mb-2 flex items-center"
                  >
                    <span>Market Cap </span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold text-white"
                      >{abbreviateNumber(data?.getStockQuote?.marketCap)}</span
                    >
                  </div>
                </div>
              </div>

              <div
                class="mt-10 flex flex-col sm:flex-row items-start sm:items-center w-full justify-between"
              >
                <h2 class="text-xl sm:text-2xl text-white font-bold">
                  Revenue Chart
                </h2>

                <div
                  class="inline-flex justify-center w-full rounded-md sm:w-auto sm:ml-auto"
                >
                  <div
                    class="bg-secondary w-full min-w-24 sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 mt-4"
                  >
                    {#each plotTabs as item, i}
                      <button
                        on:click={() => changeTimePeriod(i)}
                        class="group relative z-[1] rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {timeIdx ===
                        i
                          ? 'z-0'
                          : ''} "
                      >
                        {#if timeIdx === i}
                          <div
                            class="absolute inset-0 rounded-md bg-[#fff]"
                          ></div>
                        {/if}
                        <span
                          class="relative text-sm block font-semibold {timeIdx ===
                          i
                            ? 'text-black'
                            : 'text-white'}"
                        >
                          {item.title}
                        </span>
                      </button>
                    {/each}
                  </div>
                </div>
              </div>

              {#if optionsData !== null}
                <div class="app w-full">
                  <Chart {init} options={optionsData} class="chart" />
                </div>
              {/if}

              <div
                class="mt-10 flex flex-col sm:flex-row items-start sm:items-center w-full justify-between"
              >
                <h3 class="text-xl sm:text-2xl text-white font-bold">
                  Revenue History
                </h3>

                <div
                  class="inline-flex justify-center w-full rounded-md sm:w-auto sm:ml-auto"
                >
                  <div
                    class="bg-secondary w-full min-w-24 sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 mt-4"
                  >
                    {#each tabs as item, i}
                      {#if data?.user?.tier !== "Pro" && i > 0}
                        <button
                          on:click={() => goto("/pricing")}
                          class="group relative z-[1] rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1"
                        >
                          <span class="relative text-sm block font-semibold">
                            {item.title}
                            <svg
                              class="inline-block ml-0.5 -mt-1 w-3.5 h-3.5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              ><path
                                fill="#A3A3A3"
                                d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                              /></svg
                            >
                          </span>
                        </button>
                      {:else}
                        <button
                          on:click={() => changeTablePeriod(i)}
                          class="group relative z-[1] rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {activeIdx ===
                          i
                            ? 'z-0'
                            : ''} "
                        >
                          {#if activeIdx === i}
                            <div
                              class="absolute inset-0 rounded-md bg-[#fff]"
                            ></div>
                          {/if}
                          <span
                            class="relative text-sm block font-semibold {activeIdx ===
                            i
                              ? 'text-black'
                              : 'text-white'}"
                          >
                            {item.title}
                          </span>
                        </button>
                      {/if}
                    {/each}
                  </div>
                </div>
              </div>

              <div class="w-full overflow-x-scroll">
                <table
                  class="table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md w-full m-auto mt-4"
                >
                  <thead class="bg-default">
                    <tr>
                      <th class="text-white font-semibold text-start text-sm"
                        >{activeIdx === 0
                          ? "Fiscal Year End"
                          : "Quarter Ended"}</th
                      >
                      <th class="text-white font-semibold text-end text-sm"
                        >Revenue</th
                      >
                      <th class="text-white font-semibold text-end text-sm"
                        >% Change</th
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each tableList as item, index}
                      <!-- row -->
                      <tr
                        class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800"
                      >
                        <td
                          class="text-white font-medium text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.date}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] text-right whitespace-nowrap"
                        >
                          {abbreviateNumber(item?.revenue)}
                        </td>

                        <td
                          class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end"
                        >
                          {#if index === tableList?.length - 1}
                            n/a
                          {:else if item?.revenue > tableList[index + 1]?.revenue}
                            <span class="text-[#00FC50]">
                              +{(
                                ((item?.revenue -
                                  tableList[index + 1]?.revenue) /
                                  tableList[index + 1]?.revenue) *
                                100
                              )?.toFixed(2)}%
                            </span>
                          {:else if item?.revenue < tableList[index + 1]?.revenue}
                            <span class="text-[#FF2F1F]">
                              -{(
                                Math.abs(
                                  (item?.revenue -
                                    tableList[index + 1]?.revenue) /
                                    tableList[index + 1]?.revenue,
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
            </div>
          {:else}
            <Infobox text="No data available" />
          {/if}
        </div>
      </main>
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
