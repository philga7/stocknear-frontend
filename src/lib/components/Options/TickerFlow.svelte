<script lang="ts">
  import { screenWidth } from "$lib/store";

  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import { abbreviateNumberWithColor } from "$lib/utils";
  import InfoModal from "$lib/components/InfoModal.svelte";

  import { Chart } from "svelte-echarts";

  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  use([
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
  ]);

  export let tickerFlow = [];
  let isLoading = false;
  let optionsData = null;

  function findLastNonNull(dataArray, key) {
    for (let i = dataArray.length - 1; i >= 0; i--) {
      if (
        dataArray[i]?.net_call_premium !== null &&
        dataArray[i]?.net_call_premium !== undefined
      ) {
        return dataArray[i][key];
      }
    }
    return null; // Return null if no non-null value is found.
  }

  function formatDate(dateStr) {
    // Parse the input date string
    var date = new Date(dateStr);

    // Get month, day, and year
    var month = date.getMonth() + 1; // Month starts from 0
    var day = date.getDate();
    var year = date.getFullYear();

    // Get hours and minutes
    var hours = date.getHours();
    var minutes = date.getMinutes();

    // Determine AM/PM and adjust hours
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // Convert 0 hours to 12 for AM/PM

    // Add leading zeros if necessary
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    minutes = (minutes < 10 ? "0" : "") + minutes;

    // Format the date as MM/DD/YYYY HH:MM AM/PM
    var formattedDate = `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;

    return formattedDate;
  }

  function getPlotOptions() {
    isLoading = true;
    let dates = tickerFlow?.map((item) => item?.time);
    const priceList = tickerFlow?.map((item) =>
      item?.close !== null ? item?.close?.toFixed(2) : item?.close,
    );
    const netCallPremList = tickerFlow?.map((item) => item?.net_call_premium);
    const netPutPremList = tickerFlow?.map((item) => item?.net_put_premium);
    const volumeList = tickerFlow?.map((item) => item?.net_volume);

    const positiveVolume = volumeList.map((v) => (v >= 0 ? v : "-"));
    const negativeVolume = volumeList.map((v) => (v < 0 ? v : "-"));

    const options = {
      silent: true,
      animation: false,
      legend: {
        data: ["Price", "Vol", "Net Call Premium", "Net Put Premium"],
        textStyle: {
          color: "#fff",
        },
        axisPointer: {
          lineStyle: {
            color: "#fff",
          },
        },
      },

      tooltip: {
        trigger: "axis",
        hideDelay: 100,
        borderColor: "#969696",
        borderWidth: 1,
        backgroundColor: "#313131",
        textStyle: {
          color: "#fff",
        },
        formatter: function (params) {
          const timestamp = params[0].axisValue;
          let result = timestamp + "<br/>";

          // Find volume value and determine color
          const volParams = params.find((p) => p.seriesName.includes("Vol"));
          const volIndex = volParams?.dataIndex ?? 0;
          const volValue = volumeList[volIndex];
          const volColor = volValue >= 0 ? "#90EE90" : "#FF6B6B";

          // Sort and filter params
          const filteredParams = params
            .filter(
              (p) =>
                !p.seriesName.includes("Vol") ||
                p.seriesName === "Positive Vol",
            )
            .map((p) => {
              if (p.seriesName.includes("Vol")) {
                return {
                  ...p,
                  seriesName: "Vol",
                  value: volValue,
                  color: volColor,
                };
              }
              return p;
            })
            .sort((a, b) => {
              if (a.seriesName === "Vol") return 1;
              if (b.seriesName === "Vol") return -1;
              return 0;
            });

          filteredParams.forEach((param) => {
            const marker =
              '<span style="display:inline-block;margin-right:4px;' +
              "border-radius:10px;width:10px;height:10px;background-color:" +
              param.color +
              '"></span>';
            result +=
              marker +
              param.seriesName +
              ": " +
              abbreviateNumberWithColor(param.value, false, true) +
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
      axisPointer: {
        link: [{ xAxisIndex: [0, 1] }],
      },
      grid: [
        {
          left: "3%",
          right: "3%",
          top: $screenWidth < 640 ? "15%" : "5%",
          height: "60%",
          containLabel: true,
        },
        {
          left: "3%",
          right: "3%",
          bottom: "5%",
          height: "20%",
          containLabel: true,
        },
      ],

      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: dates,
          axisLabel: {
            color: "#fff",
            formatter: (value, index) => {
              const [datePart, timePart] = value.split(" ");
              let [hours, minutes] = timePart.split(":").map(Number);

              // Only show labels at 30-minute intervals (XX:00 and XX:30)
              if (minutes % 30 === 0) {
                const amPm = hours >= 12 ? "PM" : "AM";
                hours = hours % 12 || 12;
                return minutes === 0
                  ? `${hours} ${amPm}`
                  : `${hours}:30 ${amPm}`;
              }
              return "";
            },
            interval: 30,
          },
        },

        {
          type: "category",
          gridIndex: 1,
          data: dates,
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          gridIndex: 0,
          position: "left",
          splitLine: {
            show: false,
          },
          axisLabel: {
            color: "#fff",
            show: true,
          },
          scale: true,
          min: (value) => Math.floor(value.min * 0.999),
          max: (value) => Math.ceil(value.max * 1.001),
        },
        {
          type: "value",
          gridIndex: 0,
          position: "right",
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
        {
          type: "value",
          gridIndex: 1,
          position: "right",
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "Price",
          type: "line",
          data: priceList,
          yAxisIndex: 0,
          xAxisIndex: 0,
          showSymbol: false,
          lineStyle: { color: "#fff" },
          itemStyle: { color: "#fff" },
          smooth: true,
        },
        {
          name: "Net Call Premium",
          type: "line",
          data: netCallPremList,
          yAxisIndex: 1,
          xAxisIndex: 0,
          showSymbol: false,
          lineStyle: { color: "#90EE90" },
          itemStyle: { color: "#90EE90" },
          smooth: true,
        },
        {
          name: "Net Put Premium",
          type: "line",
          data: netPutPremList,
          yAxisIndex: 1,
          xAxisIndex: 0,
          showSymbol: false,
          lineStyle: { color: "#FF6B6B" },
          itemStyle: { color: "#FF6B6B" },
          smooth: true,
        },
        {
          name: "Positive Vol",
          type: "line",
          data: positiveVolume,
          xAxisIndex: 1,
          yAxisIndex: 2,
          showSymbol: false,
          areaStyle: {
            opacity: 1,
            color: "#19AA75",
          },
          itemStyle: { color: "#19AA75" },
        },
        {
          name: "Negative Vol",
          type: "line",
          data: negativeVolume,
          xAxisIndex: 1,
          yAxisIndex: 2,
          showSymbol: false,
          areaStyle: {
            opacity: 1,
            color: "#F71F4F",
          },
          itemStyle: { color: "#F71F4F" },
        },
      ],
    };
    isLoading = false;
    return options;
  }
  optionsData = tickerFlow ? getPlotOptions() : null;
</script>

<section class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="w-full m-auto">
            {#if optionsData !== null}
              <label
                for="dailyNetPutCallPrem"
                class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
              >
                Daily Net Put / Call Premium
                <InfoModal
                  title={"Daily Net Put / Call Premium"}
                  content={`Daily Net Put / Call Premium works similar like the Market Flow, which evaluates the balance between advancing and
                declining  price movements, net call
                premiums and net put premiums, providing a real-time snapshot of
                market sentiment and momentum. <a
                  href="/learning-center/article/market-sentiment-through-options-activity-riding-the-tide"
                  class="text-blue-400 sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                  >Learn more here.</a
                >`}
                  id={"dailyNetPutCallPrem"}
                />
              </label>

              <div class="text-white text-xs sm:text-sm italic mt-5 mb-3">
                Last Updated: {formatDate(findLastNonNull(tickerFlow, "time"))}
              </div>
              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
              >
                <div
                  class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div class="text-[#c3c6d0] text-sm mb-2 flex items-center">
                    <span>Volume</span>
                    <span class="ml-1 text-yellow-400">●</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-2xl font-bold text-white">
                      {@html abbreviateNumberWithColor(
                        findLastNonNull(tickerFlow, "net_volume"),
                        false,
                        true,
                      )}</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div class="text-[#c3c6d0] text-sm mb-2 flex items-center">
                    <span>Net Call Prem</span>
                    <span class="ml-1 text-green-500">●</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-2xl font-bold text-white"
                      >{@html abbreviateNumberWithColor(
                        findLastNonNull(tickerFlow, "net_call_premium"),
                        false,
                        true,
                      )}</span
                    >
                  </div>
                </div>

                <div
                  class="bg-gray-800/30 rounded-lg p-4 sm:hover:bg-gray-800/40 transition-colors"
                >
                  <div class="text-[#c3c6d0] text-sm mb-2 flex items-center">
                    <span>Net Put Prem</span>
                    <span class="ml-1 text-red-400">●</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-2xl font-bold text-white"
                      >{@html abbreviateNumberWithColor(
                        findLastNonNull(tickerFlow, "net_put_premium"),
                        false,
                        true,
                      )}</span
                    >
                  </div>
                </div>
              </div>

              <div>
                <div class="app w-full h-[300px] mt-5">
                  {#if isLoading}
                    <div class="flex justify-center items-center h-80">
                      <div class="relative">
                        <label
                          class="bg-secondary z-10 rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        >
                          <span
                            class="loading loading-spinner loading-md text-white"
                          ></span>
                        </label>
                      </div>
                    </div>
                  {:else}
                    <Chart {init} options={optionsData} class="chart" />
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </main>
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 600px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 510px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
