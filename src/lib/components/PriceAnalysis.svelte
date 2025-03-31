<script lang="ts">
  import { displayCompanyName, screenWidth } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { Chart } from "svelte-echarts";
  import { onMount } from "svelte";

  import { init, use } from "echarts/core";
  import { LineChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

  export let data;
  let isLoaded = false;

  let priceAnalysisDict = data?.getPriceAnalysis;
  let lastPrice = data?.getStockQuote?.price ?? "n/a";

  const modalContent = `
    Our AI model, employing a Bayesian approach, predicts future prices by breaking down trends, seasonality, and holiday effects. It integrates uncertainty to offer forecasts with intervals.<br><br>
    <span class="font-semibold underline"><span class="italic">R</span><sup>2</sup> Score</span>: How well the regression model fits the data. A high score (close to 100%) is good, indicating a strong fit, while a low score (close to 0%) is bad, suggesting poor fit.
    <br><br>
    <span class="font-semibold underline">Mean Absolute Percentage Error (MAPE)</span>: Measures the average percentage difference between predicted and actual values. A lower MAPE indicates better accuracy, while a higher MAPE suggests less accurate predictions.
  `;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let r2Score;
  let mape;
  let priceSentiment = "n/a";
  let oneYearPricePrediction = "n/a";
  let optionsData;

  function getPlotOptions() {
    const predictionDate = priceAnalysisDict?.predictionDate;
    const upperBand = priceAnalysisDict?.upperBand;
    const lowerBand = priceAnalysisDict?.lowerBand?.map((value) =>
      value < 0 ? 0 : value,
    );
    const historicalPrice = priceAnalysisDict?.historicalPrice;

    const option = {
      silent: true,
      animation: false,
      grid: {
        left: screenWidth < 640 ? "0%" : "2%",
        right: screenWidth < 640 ? "5%" : "2%",
        bottom: screenWidth < 640 ? "0%" : "5%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: predictionDate,
        axisLabel: {
          color: "#fff",
          formatter(value) {
            const dateParts = value?.split("-");
            const year = dateParts[0]?.substring(2);
            const monthIndex = parseInt(dateParts[1], 10) - 1;
            return `${monthNames[monthIndex]} '${year}`;
          },
        },
      },
      yAxis: [
        {
          type: "value",
          splitLine: { show: false },
          axisLabel: { show: false },
        },
      ],
      series: [
        {
          name: "Stock Price",
          data: historicalPrice,
          showSymbol: false,
          smooth: true,
          type: "line",
          itemStyle: { color: "#fff" },
        },
        {
          name: "Upperband",
          data: upperBand,
          showSymbol: false,
          smooth: true,
          type: "line",
          areaStyle: { color: "rgba(60, 116, 212, 0.4)" },
          lineStyle: { color: "rgb(60, 116, 212)" },
        },
        {
          name: "Lowerband",
          data: lowerBand,
          showSymbol: false,
          smooth: true,
          type: "line",
          areaStyle: { color: "#09090B", opacity: 1 },
          lineStyle: { color: "rgb(60, 116, 212)" },
        },
      ],
    };

    return option;
  }

  onMount(async () => {
    oneYearPricePrediction = priceAnalysisDict?.meanResult?.slice(-1)?.at(0);
    mape = priceAnalysisDict?.mape;
    r2Score = priceAnalysisDict?.r2Score;
    priceSentiment = lastPrice < oneYearPricePrediction ? "Bullish" : "Bearish";
    optionsData = await getPlotOptions();
    isLoaded = true;
  });
</script>

<section class="overflow-hidden text-white h-full pb-8 sm:pb-2">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="priceAnalysisInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold"
      >
        AI Price Analysis
      </label>
      <InfoModal
        title={"Price Analysis"}
        content={modalContent}
        id={"priceAnalysisInfo"}
      />
    </div>

    {#if isLoaded}
      {#if Object?.keys(priceAnalysisDict)?.length !== 0}
        <div class="w-full flex flex-col items-start">
          <div class="text-white text-[1rem] mt-1 sm:mt-3 mb-1 w-full">
            Our model predicts future prices by analyzing trends, seasonal
            variations, and holiday impacts. Here are the stats of the model for {$displayCompanyName}
            to ensure transparency and reliability.
          </div>
        </div>

        <div class="w-full mt-5 mb-5 flex justify-start items-center">
          <div
            class="w-full grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-y-3 gap-x-3"
          >
            <!--Start Flow Sentiment-->
            <div
              class="flex flex-row items-center flex-wrap w-full px-3 sm:px-5 bg-primary shadow-lg rounded-md h-20"
            >
              <div class="flex flex-col items-start">
                <span class=" text-gray-200 text-sm">Price Sentiment</span>
                <span
                  class="text-start text-[1rem] sm:text-lg font-semibold {priceSentiment ===
                  'Bullish'
                    ? 'text-[#37C97D]'
                    : 'text-red-700 dark:text-[#FF2F1F]'}"
                  >{priceSentiment}</span
                >
              </div>
            </div>

            <!--End Flow Sentiment-->
            <!--Start Put/Call-->
            <div
              class="flex flex-row items-center flex-wrap w-full px-3 sm:px-5 bg-primary shadow-lg rounded-md h-20"
            >
              <div class="flex flex-col items-start">
                <span class=" text-gray-200 text-sm"
                  ><span class="italic">R</span><sup>2</sup> Score</span
                >
                <span class="text-start text-sm sm:text-[1rem] text-white">
                  {r2Score >= 65 ? "Good" : r2Score >= 50 ? "Moderate" : "Bad"}
                </span>
              </div>
              <!-- Circular Progress -->
              <div class="relative size-14 ml-auto">
                <svg
                  class="size-full w-14 h-14"
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
                      class="stroke-current {r2Score >= 65
                        ? 'text-green-700 dark:text-[#00FC50]'
                        : r2Score >= 50
                          ? 'text-[#F8901E]'
                          : 'text-red-700 dark:text-[#FF2F1F]'}"
                      stroke-width="3"
                      stroke-dasharray="100"
                      stroke-dashoffset={100 - r2Score}
                    ></circle>
                  </g>
                </svg>
                <!-- Percentage Text -->
                <div
                  class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2"
                >
                  <span class="text-center text-white text-sm">{r2Score}%</span>
                </div>
              </div>
              <!-- End Circular Progress -->
            </div>
            <!--End Put/Call-->

            <!--Start mape-->
            <div
              class="flex flex-row items-center flex-wrap w-full px-3 sm:px-5 bg-primary shadow-lg rounded-md h-20"
            >
              <div class="flex flex-col items-start">
                <span class=" text-gray-200 text-sm">MAPE</span>
                <span class="text-start text-sm sm:text-[1rem] text-white">
                  {mape <= 15 ? "Good" : mape <= 35 ? "Moderate" : "Bad"}
                </span>
              </div>
              <!-- Circular Progress -->
              <div class="relative size-14 ml-auto">
                <svg
                  class="size-full w-14 h-14"
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
                      class="stroke-current {mape <= 15
                        ? 'text-green-700 dark:text-[#00FC50]'
                        : mape <= 35
                          ? 'text-[#F8901E]'
                          : 'text-red-700 dark:text-[#FF2F1F]'}"
                      stroke-width="3"
                      stroke-dasharray="100"
                      stroke-dashoffset={100 - mape > 0 ? 100 - mape : 1}
                    ></circle>
                  </g>
                </svg>
                <!-- Percentage Text -->
                <div
                  class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2"
                >
                  <span class="text-center text-white text-sm">{mape}%</span>
                </div>
              </div>
              <!-- End Circular Progress -->
            </div>
            <!--End mape-->
          </div>
        </div>

        <div class="app w-full h-[300px]">
          <Chart {init} options={optionsData} class="chart" />
        </div>

        <div class="text-white text-[1rem] mt-4 sm:mt-7 ml-1">
          Over the next 12 months, the model predicts a
          <span
            class="font-semibold {priceSentiment === 'Bullish'
              ? 'text-[#37C97D]'
              : 'text-red-700 dark:text-[#FF2F1F]'}">{priceSentiment}</span
          >
          trend, suggesting that the future price is expected to {priceSentiment ===
          "Bullish"
            ? "surpass"
            : "to be less than"} the previous price of
          <span class="font-semibold">${lastPrice?.toFixed(2) ?? "n/a"}</span>,
          with a mean value of
          <span class="font-semibold">${oneYearPricePrediction}</span>.
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
      height: 230px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
