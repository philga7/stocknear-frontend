<script lang="ts">
  import { displayCompanyName, stockTicker, screenWidth } from "$lib/store";
  import Infobox from "$lib/components/Infobox.svelte";

  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart, GaugeChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import SEO from "$lib/components/SEO.svelte";

  export let data;
  use([
    LineChart,
    GaugeChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    CanvasRenderer,
  ]);

  const price = data?.getStockQuote?.price?.toFixed(2) || 0;

  const calculatePriceChange = (targetPrice) =>
    targetPrice && price ? ((targetPrice / price - 1) * 100)?.toFixed(2) : 0;

  const avgPriceTarget = data?.getPriceAnalysis?.avgPriceTarget || 0;
  const medianPriceTarget = data?.getPriceAnalysis?.medianPriceTarget || 0;
  const lowPriceTarget = data?.getPriceAnalysis?.lowPriceTarget || 0;
  const highPriceTarget = data?.getPriceAnalysis?.highPriceTarget || 0;

  const lowChange = calculatePriceChange(lowPriceTarget);
  const medianChange = calculatePriceChange(medianPriceTarget);
  const avgChange = calculatePriceChange(avgPriceTarget);
  const highChange = calculatePriceChange(highPriceTarget);

  let consensusRating;

  if (avgChange < -20) {
    consensusRating = "Strong Sell";
  } else if (avgChange < -10) {
    consensusRating = "Sell";
  } else if (avgChange <= 15) {
    consensusRating = "Hold";
  } else if (avgChange >= 35) {
    consensusRating = "Strong Buy";
  } else if (avgChange >= 20) {
    consensusRating = "Buy";
  } else {
    consensusRating = "Hold";
  }

  function getPieChart() {
    let value;
    // Determine the value based on the consensus rating
    switch (consensusRating) {
      case "Strong Sell":
        value = 0;
        break;
      case "Sell":
        value = 0.25;
        break;
      case "Hold":
        value = 0.5;
        break;
      case "Buy":
        value = 0.75;
        break;
      case "Strong Buy":
        value = 1;
        break;
      default:
        value = 0.5;
        break;
    }
    const option = {
      silent: true,
      animation: false,
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          center: ["50%", "45%"],
          radius: "70%",
          min: 0,
          max: 1,
          splitNumber: 4,
          axisLine: {
            lineStyle: {
              width: 25,
              color: [
                [0.2, "#9E190A"],
                [0.4, "#D9220E"],
                [0.6, "#FF9E21"],
                [0.8, "#31B800"],
                [1, "#008A00"],
              ],
            },
          },
          pointer: {
            icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
            length: "25%",
            width: 20,
            offsetCenter: [0, "-30%"],
            itemStyle: {
              color: "#fff",
            },
          },
          axisTick: {
            length: 0,
          },
          splitLine: {
            length: 0,
          },
          axisLabel: {
            show: false,
          },
          detail: {
            show: false, // Hide the numerical value display
          },
          data: [
            {
              value: value,
              label: {
                show: false, // Hide the data label
              },
            },
          ],
        },
      ],
    };
    return option;
  }

  function getPriceForecastChart() {
    const historicalData = data?.getAnalystSummary?.pastPriceList || [];
    const forecastTargets = {
      low: lowPriceTarget,
      avg: avgPriceTarget,
      high: highPriceTarget,
    };

    // Process historical data
    const processedHistorical = historicalData?.map((point) => ({
      date: point?.date,
      value: point?.close,
    }));

    const currentDate = new Date(); // Get the current date
    const forecastDate = new Date(
      currentDate.getFullYear() + 1,
      currentDate.getMonth(),
      currentDate.getDate(),
    ); // Add one year
    const forecastDateString = forecastDate.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'

    // Get the last historical data point
    const lastHistoricalDate = historicalData[historicalData.length - 1]?.date;
    const lastHistoricalClose =
      historicalData[historicalData.length - 1]?.close;

    // Create forecast points by appending them after the last historical date
    const forecastHigh = [
      { date: lastHistoricalDate, value: lastHistoricalClose },
      { date: forecastDateString, value: forecastTargets.high },
    ];

    const forecastAvg = [
      { date: lastHistoricalDate, value: lastHistoricalClose },
      { date: forecastDateString, value: forecastTargets.avg },
    ];

    const forecastLow = [
      { date: lastHistoricalDate, value: lastHistoricalClose },
      { date: forecastDateString, value: forecastTargets.low },
    ];

    const option = {
      animation: false,
      silent: true,
      grid: {
        left: "2%",
        right: "2%",
        bottom: "10%",
        top: "5%",
        containLabel: true,
      },

      xAxis: {
        type: "time",
        axisLabel: {
          color: "#fff",
          formatter: (value) => {
            const date = new Date(value);
            const isMobile = $screenWidth < 640; // Define your breakpoint for mobile

            // Use a different date format for mobile screens
            return isMobile
              ? date.toLocaleDateString("en-US", { month: "short" }) // Show only the month for mobile
              : date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                }); // Full format for larger screens
          },
        },
        axisPointer: {
          type: "line", // Can enhance interaction on mobile
          lineStyle: {
            color: "#fff", // Customize pointer color if needed
          },
        },
      },

      yAxis: {
        type: "value",
        axisLabel: {
          color: "#fff",
          formatter: (value) => `$${value.toFixed(0)}`,
        },

        splitLine: {
          show: false,
        },
      },
      series: [
        {
          name: "Historical",
          type: "line",
          data: processedHistorical?.map((point) => [point.date, point.value]),
          symbol: "circle",
          symbolSize: 6,
          itemStyle: {
            color: "#fff",
          },
          lineStyle: {
            width: 2,
          },
        },
        {
          name: "High",
          type: "line",
          data: forecastHigh?.map((point) => [point.date, point.value]),
          symbol: "none",
          lineStyle: {
            type: "dashed",
            color: "#31B800",
          },
        },
        {
          name: "Average",
          type: "line",
          data: forecastAvg?.map((point) => [point.date, point.value]),
          symbol: "none",
          lineStyle: {
            type: "dashed",
            color: "#fff",
          },
        },
        {
          name: "Low",
          type: "line",
          data: forecastLow?.map((point) => [point.date, point.value]),
          symbol: "none",
          lineStyle: {
            type: "dashed",
            color: "#D9220E",
          },
        },
      ],
    };

    return option;
  }

  let optionsPieChart = getPieChart() || null;
  let optionsPriceForecast = getPriceForecastChart() || null;
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Stock Forecast & Analyst Ratings | AI Insights`}
  description={`Discover our AI-powered forecast for ${$displayCompanyName} (${$stockTicker}). Get in-depth analyst ratings, price targets, upgrades, and downgrades from top Wall Street experts. Stay ahead of market trends and make smarter investment decisions.`}
/>

<section class="w-full bg-default overflow-hidden text-white h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-4 sm:pt-4 w-full m-auto mt-2 sm:mt-0">
        <h1 class="mb-px text-xl sm:text-2xl font-bold bp:text-3xl sm:pl-1">
          {$displayCompanyName} AI Forecast
        </h1>
        {#if Object?.keys(data?.getPriceAnalysis)?.length > 0}
          <div class="w-full mb-6 mt-3">
            <div
              class="rounded-sm border border-gray-600 p-0.5 xs:p-1 md:flex md:flex-col md:space-y-4 md:divide-y md:p-4 lg:flex-row lg:space-x-4 lg:space-y-0 lg:divide-x lg:divide-y-0 divide-gray-600"
            >
              <div
                class="p-3 md:flex md:space-x-4 md:p-0 lg:block lg:max-w-[32%] lg:space-x-0"
              >
                <div>
                  <div class="flex items-baseline justify-between">
                    <h2 class="mb-1 text-xl font-bold">Stock Price Forecast</h2>
                    <span></span>
                  </div>
                  <p>
                    Using our AI model trained on historical data, we generated
                    a 12‑month forecast for {$displayCompanyName}
                    ({$stockTicker}) stock. The model estimates a median target
                    price of {medianPriceTarget}—ranging from a low of {lowPriceTarget}
                    to a high of {highPriceTarget}—which suggests {medianChange >
                    0
                      ? "an increase"
                      : "a decrease"} of {medianChange}% compared to the current
                    price of {price}.
                  </p>
                </div>
                <div>
                  <div class="app h-[160px]">
                    {#if optionsPieChart !== null}
                      <Chart {init} options={optionsPieChart} class="chart" />
                    {/if}
                  </div>
                  <div class="-mt-36 text-center text-xl font-semibold">
                    AI Consensus: <span
                      class="font-bold {['Strong Buy', 'Buy']?.includes(
                        consensusRating,
                      )
                        ? 'text-[#00FC50]'
                        : ['Strong Sell', 'Sell']?.includes(consensusRating)
                          ? 'text-[#FF2F1F]'
                          : 'text-[#fff]'}">{consensusRating}</span
                    >
                  </div>
                </div>
              </div>
              <div class="grow pt-2 md:pt-4 lg:pl-4 lg:pt-0">
                <div class="app h-[250px] xs:h-[275px]">
                  {#if data?.user?.tier !== "Pro"}
                    <div
                      class="flex flex-row items-center justify-center m-auto h-full text-center font-bold"
                    >
                      <a
                        href="/pricing"
                        class="flex flex-row items-center sm:hover:text-blue-400 text-white"
                      >
                        <span class="m-auto"> Chart Forecast</span>
                        <svg
                          class="ml-1 size-5"
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
                      </a>
                    </div>
                  {:else if optionsPriceForecast !== null}
                    <Chart
                      {init}
                      options={optionsPriceForecast}
                      class="chart"
                    />
                  {/if}
                </div>
                <div
                  class="hide-scroll mb-1 mt-2 overflow-x-auto px-1.5 text-center md:mb-0 md:px-0 lg:mt-2"
                >
                  <table
                    class="w-full text-right text-tiny text-white xs:text-sm sm:text-base"
                  >
                    <thead
                      ><tr
                        class="border-b border-gray-600 font-normal text-sm sm:text-[1rem]"
                        ><th class="py-[3px] text-left font-semibold lg:py-0.5"
                          >Target</th
                        > <th class="font-semibold">Low</th>
                        <th class="font-semibold">Average</th>
                        <th class="font-semibold">Median</th>
                        <th class="font-semibold">High</th></tr
                      ></thead
                    >
                    <tbody
                      ><tr
                        class="border-b border-gray-600 font-normal text-sm sm:text-[1rem]"
                        ><td class="py-[3px] text-left lg:py-0.5">Price</td>
                        <td>${lowPriceTarget}</td>
                        <td>${avgPriceTarget}</td> <td>${medianPriceTarget}</td>
                        <td>${highPriceTarget}</td></tr
                      >
                      <tr class="text-sm sm:text-[1rem]"
                        ><td class="py-[3px] text-left lg:py-0.5">Change</td>
                        <td
                          class={lowChange > 0 && data?.user?.tier === "Pro"
                            ? "before:content-['+'] text-[#00FC50]"
                            : "text-[#FF2F1F]"}
                        >
                          {#if data?.user?.tier !== "Pro"}
                            <a
                              href="/pricing"
                              class="text-white sm:hover:text-blue-400"
                            >
                              <svg
                                class="size-4 sm:size-5 text-end ml-auto"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clip-rule="evenodd"
                                >
                                </path>
                              </svg>
                            </a>
                          {:else}
                            {lowChange}%
                          {/if}
                        </td>
                        <td
                          class={avgChange > 0 && data?.user?.tier === "Pro"
                            ? "before:content-['+'] text-[#00FC50]"
                            : "text-[#FF2F1F]"}
                        >
                          {#if data?.user?.tier !== "Pro"}
                            <a
                              href="/pricing"
                              class="text-white sm:hover:text-blue-400"
                            >
                              <svg
                                class="size-4 sm:size-5 text-end ml-auto"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clip-rule="evenodd"
                                >
                                </path>
                              </svg>
                            </a>
                          {:else}
                            {avgChange}%
                          {/if}
                        </td>
                        <td
                          class={medianChange > 0 && data?.user?.tier === "Pro"
                            ? "before:content-['+'] text-[#00FC50]"
                            : "text-[#FF2F1F]"}
                        >
                          {#if data?.user?.tier !== "Pro"}
                            <a
                              href="/pricing"
                              class="text-white sm:hover:text-blue-400"
                            >
                              <svg
                                class="size-4 sm:size-5 text-end ml-auto"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clip-rule="evenodd"
                                >
                                </path>
                              </svg>
                            </a>
                          {:else}
                            {medianChange}%
                          {/if}
                        </td>
                        <td
                          class={highChange > 0 && data?.user?.tier === "Pro"
                            ? "before:content-['+'] text-[#00FC50]"
                            : "text-[#FF2F1F]"}
                        >
                          {#if data?.user?.tier !== "Pro"}
                            <a
                              href="/pricing"
                              class="text-white sm:hover:text-blue-400"
                            >
                              <svg
                                class="size-4 sm:size-5 text-end ml-auto"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clip-rule="evenodd"
                                >
                                </path>
                              </svg>
                            </a>
                          {:else}
                            {highChange}%
                          {/if}</td
                        ></tr
                      ></tbody
                    >
                  </table>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <Infobox text="No AI Price Forecast available right now" />
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .app {
    height: 300px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 300px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
