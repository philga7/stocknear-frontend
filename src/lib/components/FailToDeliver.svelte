<script lang="ts">
  import {
    displayCompanyName,
    stockTicker,
    assetType,
    etfTicker,
  } from "$lib/store";
  import { Chart } from "svelte-echarts";
  import { abbreviateNumber, monthNames } from "$lib/utils";

  import { init, use } from "echarts/core";
  import { LineChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  export let data;
  export let rawData = [];

  use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

  let isLoaded = false;
  let optionsData;
  let avgFailToDeliver;
  let weightedFTD;

  let activeIdx = 0;
  const tabs = [
    {
      title: "Annual",
    },
    {
      title: "Quarterly",
    },
  ];

  let tableList = rawData?.sort(
    (a, b) => new Date(b?.date) - new Date(a?.date),
  );

  tableList = filterByPeriod([...tableList], activeIdx);

  function changeTimePeriod(i) {
    activeIdx = i;
    tableList = rawData?.sort((a, b) => new Date(b?.date) - new Date(a?.date));

    tableList = filterByPeriod([...tableList], i);
  }

  function filterByPeriod(data, period) {
    if (!Array.isArray(data) || data.length === 0) return [];

    if (period === 0) {
      // Annual: one result per year.
      const seenYears = new Set();
      return data.filter((item) => {
        const dt = new Date(item.date);
        const year = dt.getFullYear();
        if (!seenYears.has(year)) {
          seenYears.add(year);
          return true;
        }
        return false;
      });
    } else if (period === 1) {
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

    return [];
  }

  function getPlotOptions() {
    let dates = [];
    let priceList = [];
    let failToDeliverList = [];
    rawData?.sort((a, b) => new Date(a?.date) - new Date(b?.date));
    rawData?.forEach((item) => {
      dates?.push(item?.date);
      priceList?.push(item?.price);
      failToDeliverList?.push(item?.failToDeliver);
    });

    const totalNumber = failToDeliverList?.reduce((acc, item) => acc + item, 0);
    avgFailToDeliver = (totalNumber / failToDeliverList?.length)?.toFixed(0);

    const option = {
      silent: true,
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
      animation: false,
      grid: {
        left: "3%",
        right: "3%",
        bottom: "2%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            const dateParts = value.split("-");
            const day = dateParts[2].substring(0);
            const monthIndex = parseInt(dateParts[1]) - 1;
            return `${day} ${monthNames[monthIndex]}`;
          },
        },
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
        {
          type: "value",
          splitLine: {
            show: false,
          },
          position: "right",
          axisLabel: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "Price",
          data: priceList,
          type: "line",
          itemStyle: {
            color: "#fff",
          },
          showSymbol: false,
        },
        {
          name: "FTD Shares",
          data: failToDeliverList,
          type: "line",
          areaStyle: { opacity: 1 },
          yAxisIndex: 1,
          itemStyle: {
            color: "#E11D48",
          },
          showSymbol: false,
        },
      ],
    };

    return option;
  }

  $: {
    const ticker = $assetType === "stock" ? $stockTicker : $etfTicker;
    if (ticker) {
      isLoaded = false;
      if (rawData?.length > 0) {
        weightedFTD = (
          (rawData?.slice(-1)?.at(0)?.failToDeliver /
            data?.getStockQuote?.avgVolume) *
          100
        )?.toFixed(2);
        optionsData = getPlotOptions();
      }
      isLoaded = true;
    }
  }
</script>

<section class="overflow-hidden text-white h-full pb-8">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center w-full mt-5">
      <h1 class="text-2xl text-white font-bold">FTD Chart</h1>
    </div>

    {#if isLoaded}
      {#if rawData?.length !== 0}
        <div class="w-full flex flex-col items-start">
          <div class="text-white text-[1rem] mt-2 mb-2 w-full">
            Over the past year, {$displayCompanyName} has seen a monthly average
            of
            <span class="font-semibold"
              >{abbreviateNumber(avgFailToDeliver)}</span
            > fail to deliver shares.
          </div>
        </div>

        <div class="pb-2 rounded-md bg-default">
          <div class="app w-full h-[300px] mt-5">
            <Chart {init} options={optionsData} class="chart" />
          </div>
        </div>

        <div
          class="flex flex-row items-center justify-between mx-auto mt-5 w-full sm:w-11/12"
        >
          <div
            class="mt-3.5 sm:mt-0 flex flex-col sm:flex-row items-center ml-3 sm:ml-0 w-1/2 justify-center"
          >
            <div
              class="h-full transform -translate-x-1/2"
              aria-hidden="true"
            ></div>
            <div
              class="w-3 h-3 bg-[#fff] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
              aria-hidden="true"
            ></div>
            <span
              class="mt-2 sm:mt-0 text-white text-center sm:text-start text-xs sm:text-md inline-block"
            >
              Price
            </span>
          </div>
          <div
            class="flex flex-col sm:flex-row items-center ml-3 sm:ml-0 w-1/2 justify-center"
          >
            <div
              class="h-full transform -translate-x-1/2"
              aria-hidden="true"
            ></div>
            <div
              class="w-3 h-3 bg-[#E11D48] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
              aria-hidden="true"
            ></div>
            <span
              class="mt-2 sm:mt-0 text-white text-xs sm:text-md sm:font-medium inline-block"
            >
              Share Quantity
            </span>
          </div>
        </div>

        <div
          class="mt-5 flex flex-col sm:flex-row items-start sm:items-center w-full justify-between sm:border-y border-gray-800 sm:pt-2 sm:pb-2"
        >
          <h3 class="text-xl sm:text-2xl text-white font-bold mb-2 sm:mb-0">
            FTD History
          </h3>

          <div
            class="inline-flex justify-center w-full rounded-md sm:w-auto sm:ml-auto"
          >
            <div
              class="bg-secondary w-full min-w-24 sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1"
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
                    on:click={() => changeTimePeriod(i)}
                    class="group relative z-[1] rounded-full w-1/2 min-w-24 md:w-auto px-5 py-1 {activeIdx ===
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
                <th class="text-white font-semibold text-start text-sm">Date</th
                >
                <th class="text-white font-semibold text-end text-sm"
                  >FTD Shares</th
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
                    {abbreviateNumber(item?.failToDeliver)}
                  </td>

                  <td
                    class="text-white text-sm sm:text-[1rem] whitespace-nowrap font-medium text-end"
                  >
                    {#if index === tableList?.length - 1}
                      n/a
                    {:else if item?.failToDeliver > tableList[index + 1]?.failToDeliver}
                      <span class="text-[#00FC50]">
                        +{(
                          ((item?.failToDeliver -
                            tableList[index + 1]?.failToDeliver) /
                            tableList[index + 1]?.failToDeliver) *
                          100
                        )?.toFixed(2)}%
                      </span>
                    {:else if item?.failToDeliver < tableList[index + 1]?.failToDeliver}
                      <span class="text-[#FF2F1F]">
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
  </main>
</section>

<style>
  .app {
    height: 300px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 210px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
