<script lang="ts">
  import { displayCompanyName, stockTicker, screenWidth } from "$lib/store";
  import Infobox from "$lib/components/Infobox.svelte";
  import highcharts from "$lib/highcharts.ts";

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
    const historicalData = data?.getPriceAnalysis?.pastPriceList || [];
    const forecastTargets = {
      low: lowPriceTarget,
      avg: avgPriceTarget,
      high: highPriceTarget,
    };

    // Process historical data
    const processedHistorical = historicalData?.map((point) => [
      new Date(point?.date).getTime(),
      point?.close,
    ]);

    const currentDate = new Date();
    const forecastDate = new Date(
      currentDate.getFullYear() + 1,
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    const forecastTimestamp = forecastDate.getTime();

    // Get the last historical data point
    const lastHistoricalDate = new Date(
      historicalData[historicalData.length - 1]?.date,
    ).getTime();
    const lastHistoricalClose =
      historicalData[historicalData.length - 1]?.close;

    // Create forecast points
    const forecastHigh = [
      [lastHistoricalDate, lastHistoricalClose],
      [forecastTimestamp, forecastTargets.high],
    ];

    const forecastAvg = [
      [lastHistoricalDate, lastHistoricalClose],
      [forecastTimestamp, forecastTargets.avg],
    ];

    const forecastLow = [
      [lastHistoricalDate, lastHistoricalClose],
      [forecastTimestamp, forecastTargets.low],
    ];

    const options = {
      tooltip: {
        enabled: false,
      },
      plotOptions: {
        series: {
          enableMouseTracking: false,
          states: {
            hover: {
              enabled: false,
            },
          },
          marker: {
            states: {
              hover: {
                enabled: false,
              },
            },
          },
        },
      },
      chart: {
        backgroundColor: "#09090B",
        plotBackgroundColor: "#09090B",
        height: 360,
        animation: false,
      },
      title: {
        text: `<div class="grid grid-cols-2 w-[200px] sm:w-[500px] -mb-3.5 text-xs font-[501] text-gray-400">
          <h3 class="text-left">${$screenWidth && $screenWidth < 640 ? "Past Year" : "Past 12 Months"}</h3>
          <h3 class="text-right">${$screenWidth && $screenWidth < 640 ? "Next Year" : "12 Month Forecast"}</h3>
         </div>`,
        style: {
          color: "white",
          width: "100%",
        },
        verticalAlign: "top",
        useHTML: true,
      },
      xAxis: {
        gridLineWidth: 1,
        gridLineColor: "#111827",
        type: "datetime",
        endOnTick: false,
        labels: {
          style: {
            color: "#fff",
          },
          formatter: function () {
            const date = new Date(this.value);
            return date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
          },
        },
      },
      yAxis: {
        title: {
          text: "",
        },
        labels: {
          style: {
            color: "#fff",
          },
          formatter: function () {
            return `$${this.value.toFixed(0)}`;
          },
        },
        gridLineWidth: 1,
        gridLineColor: "#111827",
        tickInterval: 20, // Adjust this value to reduce step size
      },

      series: [
        {
          animation: false,
          name: "Historical",
          data: processedHistorical,
          color: "#fff",
          marker: {
            symbol: "circle",
            radius: 4,
          },
          lineWidth: 2,
        },
        {
          animation: false,
          name: "High",
          data: forecastHigh,
          color: "#31B800",
          dashStyle: "Dash",
          marker: {
            enabled: false,
          },
        },
        {
          animation: false,
          name: "Average",
          data: forecastAvg,
          color: "#fff",
          dashStyle: "Dash",
          marker: {
            enabled: false,
          },
        },
        {
          animation: false,
          name: "Low",
          data: forecastLow,
          color: "#D9220E",
          dashStyle: "Dash",
          marker: {
            enabled: false,
          },
        },
      ],
      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
    };
    return options;
  }

  let optionsPieChart = getPieChart() || null;
  let config = getPriceForecastChart() || null;
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
                  <div>
                    <div class="app h-[160px]">
                      {#if optionsPieChart !== null}
                        <Chart {init} options={optionsPieChart} class="chart" />
                      {/if}
                    </div>
                    <div class="-mt-36 text-center text-xl font-semibold">
                      Analyst Consensus: <span
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
              </div>
              <div class="grow pt-2 md:pt-4 lg:pl-4 lg:pt-0">
                <div
                  class="chart mt-5 sm:mt-0 border border-gray-800 rounded"
                  use:highcharts={config}
                ></div>
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
                          class={lowChange > 0
                            ? "before:content-['+'] text-[#00FC50]"
                            : "text-[#FF2F1F]"}>{lowChange}%</td
                        >
                        <td
                          class={avgChange > 0
                            ? "before:content-['+'] text-[#00FC50]"
                            : "text-[#FF2F1F]"}>{avgChange}%</td
                        >
                        <td
                          class={medianChange > 0
                            ? "before:content-['+'] text-[#00FC50]"
                            : "text-[#FF2F1F]"}>{medianChange}%</td
                        >
                        <td
                          class={highChange > 0
                            ? "before:content-['+'] text-[#00FC50]"
                            : "text-[#FF2F1F]"}>{highChange}%</td
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
