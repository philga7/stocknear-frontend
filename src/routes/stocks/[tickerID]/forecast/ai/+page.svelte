<script lang="ts">
  import { displayCompanyName, stockTicker, screenWidth } from "$lib/store";
  import Infobox from "$lib/components/Infobox.svelte";
  import highcharts from "$lib/highcharts.ts";
  import { mode } from "mode-watcher";

  import SEO from "$lib/components/SEO.svelte";

  export let data;

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
        value = 0.5;
        break;
      case "Sell":
        value = 1.5;
        break;
      case "Hold":
        value = 2.5;
        break;
      case "Buy":
        value = 3.5;
        break;
      case "Strong Buy":
        value = 4.5;
        break;
      default:
        value = 0.5;
        break;
    }

    const options = {
      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      chart: {
        type: "gauge",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        animation: false,
      },
      title: {
        text: null,
      },
      yAxis: {
        min: 0,
        max: 5,
        tickPosition: "inside",
        tickLength: 20,
        tickWidth: 0,
        minorTickInterval: null,
        lineWidth: 0,
        // Remove numeric tick labels
        labels: {
          enabled: false,
        },
        plotBands: [
          {
            from: 0,
            to: 1,
            color: "#9E190A",
            thickness: 40,
            borderRadius: "0px",
          },
          {
            from: 1,
            to: 2,
            color: "#D9220E",
            thickness: 40,
            borderRadius: "0px",
          },
          {
            from: 2,
            to: 3,
            color: "#f5b700",
            thickness: 40,
            borderRadius: "0px",
          },
          {
            from: 3,
            to: 4,
            color: "#31B800",
            thickness: 40,
            borderRadius: "0px",
          },
          {
            from: 4,
            to: 5,
            color: "#008A00",
            thickness: 40,
            borderRadius: "0px",
          },
        ],
      },
      pane: {
        startAngle: -90,
        endAngle: 89.9,
        background: null,
        center: ["50%", "50%"],
        size: "70%",
      },
      series: [
        {
          name: "Rating",
          data: [value],
          animation: false,
          dataLabels: {
            enabled: true,
            useHTML: true,
            borderWidth: 0,
            backgroundColor: "transparent",
            style: {
              textOutline: "none",
              fontSize: "16px",
              fontWeight: "bold",
            },
            formatter: function () {
              const rating = this.y;
              let ratingText = "";
              let textColor = "";

              if (rating < 1) {
                ratingText = "Strong Sell";
                textColor = "#D9220E";
              } else if (rating < 2) {
                ratingText = "Sell";
                textColor = "#D9220E";
              } else if (rating < 3) {
                ratingText = "Hold";
                textColor = "#f5b700";
              } else if (rating < 4) {
                ratingText = "Buy";
                textColor = "#31B800";
              } else {
                ratingText = "Strong Buy";
                textColor = "#31B800";
              }

              // "Analyst Consensus:" in white, rating in color
              return `
          <span class="text-lg text-muted dark:text-white">Analyst Consensus: </span>
          <span class="text-lg" style="color:${textColor};">${ratingText}</span>
        `;
            },
          },
          dial: {
            radius: "80%",
            backgroundColor: "#2A2E39",
            baseWidth: 12,
            baseLength: "0%",
            rearLength: "0%",
          },
          pivot: {
            backgroundColor: "#2A2E39",
            radius: 8,
          },
        },
      ],
    };

    return options;
  }

  function getPriceForecastChart() {
    const historicalData = data?.getAnalystSummary?.pastPriceList || [];
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
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 360,
        animation: false,
      },
      title: {
        text: `<div class="grid grid-cols-2 w-[200px] sm:w-[500px] -mb-3.5 text-xs font-[501] text-gray-600 dark:text-gray-400">
          <h3 class="text-left">${$screenWidth && $screenWidth < 640 ? "Past Year" : "Past 12 Months"}</h3>
          <h3 class="text-right">${$screenWidth && $screenWidth < 640 ? "Next Year" : "12 Month Forecast"}</h3>
         </div>`,
        style: {
          color: $mode === "light" ? "black" : "white",
          width: "100%",
        },
        verticalAlign: "top",
        useHTML: true,
      },
      xAxis: {
        gridLineWidth: 1,
        gridLineColor: $mode === "light" ? "#d1d5dc" : "#111827",
        type: "datetime",
        endOnTick: false,
        labels: {
          style: {
            color: $mode === "light" ? "black" : "white",
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
            color: $mode === "light" ? "black" : "white",
          },
          formatter: function () {
            return `$${this.value.toFixed(0)}`;
          },
        },
        gridLineWidth: 1,
        gridLineColor: $mode === "light" ? "#d1d5dc" : "#111827",
      },

      series: [
        {
          animation: false,
          name: "Historical",
          data: processedHistorical,
          color: $mode === "light" ? "#007050" : "#fff",
          marker: {
            enabled: true,
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
          color: $mode === "light" ? "#007050" : "#fff",
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
      /*
      annotations: [
        {
          labels: [
            {
              point: {
                x: forecastHigh[forecastHigh.length - 1][0], // Last X (timestamp)
                y: forecastHigh[forecastHigh.length - 1][1], // Last Y (Average value)
                xAxis: 0,
                yAxis: 0,
              },
              text: `<b>High</b><br><span class="text-sm">$${forecastHigh[forecastHigh.length - 1][1]}</span>`,
              useHTML: true,
              style: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderWidth: 1,
                fontSize: "12px",
                fontWeight: "bold",
              },
              align: "left",
              verticalAlign: "middles",
              x: -10,
              y: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
              padding: 8,
              shape: "",
            },
            {
              point: {
                x: forecastAvg[forecastAvg.length - 1][0], // Last X (timestamp)
                y: forecastAvg[forecastAvg.length - 1][1], // Last Y (Average value)
                xAxis: 0,
                yAxis: 0,
              },
              text: `<b>Average</b><br><span>$${forecastAvg[forecastAvg.length - 1][1]}</span>`,
              useHTML: true,
              style: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderWidth: 1,
                fontSize: "12px",
                fontWeight: "bold",
              },
              align: "right",
              verticalAlign: "middle",
              x: -10,
              y: 30,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
              padding: 5,
              shape: "",
            },
            {
              point: {
                x: forecastLow[forecastLow.length - 1][0], // Last X (timestamp)
                y: forecastLow[forecastLow.length - 1][1], // Last Y (Average value)
                xAxis: 0,
                yAxis: 0,
              },
              text: `<b>Low</b><br><span>$${forecastLow[forecastLow.length - 1][1]}</span>`,
              useHTML: true,
              style: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderWidth: 1,
                fontSize: "12px",
                fontWeight: "bold",
              },
              align: "top",
              verticalAlign: "middle",
              x: -10,
              y: -40,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
              padding: 5,
              shape: "",
            },
          ],
        },
      ],
      */

      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
    };
    return options;
  }

  let optionsPieChart = null;
  let config = null;

  $: {
    if ($mode) {
      optionsPieChart = getPieChart() || null;
      config = getPriceForecastChart() || null;
    }
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Stock Forecast & Analyst Ratings | AI Insights`}
  description={`Discover our AI-powered forecast for ${$displayCompanyName} (${$stockTicker}). Get in-depth analyst ratings, price targets, upgrades, and downgrades from top Wall Street experts. Stay ahead of market trends and make smarter investment decisions.`}
/>

<section class="w-full overflow-hidden min-h-screen">
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
              class="rounded-sm border border-gray-300 dark:border-gray-600 p-0.5 xs:p-1 md:flex md:flex-col md:space-y-4 md:divide-y md:p-4 lg:flex-row lg:space-x-4 lg:space-y-0 lg:divide-x lg:divide-y-0 divide-gray-300 dark:divide-gray-600"
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
                    <div
                      class="max-h-[225px]"
                      use:highcharts={optionsPieChart}
                    ></div>
                  </div>
                </div>
              </div>
              <div class="grow pt-2 md:pt-4 lg:pl-4 lg:pt-0">
                <div
                  class="chart mt-5 sm:mt-0 sm:border sm:border-gray-300 dark:border-gray-800 rounded"
                  use:highcharts={config}
                ></div>
                <div
                  class="hide-scroll mb-1 mt-2 overflow-x-auto px-1.5 text-center md:mb-0 md:px-0 lg:mt-2"
                >
                  <table class="w-full text-right text-tiny xs:text-sm">
                    <thead
                      ><tr
                        class="border-b border-gray-300 dark:border-gray-600 font-normal text-sm sm:text-[1rem]"
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
                        class="border-b border-gray-300 dark:border-gray-600 font-normal text-sm sm:text-[1rem]"
                        ><td class="py-[3px] text-left lg:py-0.5">Price</td>
                        <td>${lowPriceTarget}</td>
                        <td>${avgPriceTarget}</td> <td>${medianPriceTarget}</td>
                        <td>${highPriceTarget}</td></tr
                      >
                      <tr class="text-sm sm:text-[1rem]"
                        ><td class="py-[3px] text-left lg:py-0.5">Change</td>
                        <td
                          class={lowChange > 0
                            ? "before:content-['+'] text-green-600 dark:text-[#00FC50]"
                            : "text-red-600 dark:text-[#FF2F1F]"}
                          >{lowChange}%</td
                        >
                        <td
                          class={avgChange > 0
                            ? "before:content-['+'] text-green-600 dark:text-[#00FC50]"
                            : "text-red-600 dark:text-[#FF2F1F]"}
                          >{avgChange}%</td
                        >
                        <td
                          class={medianChange > 0
                            ? "before:content-['+'] text-green-600 dark:text-[#00FC50]"
                            : "text-red-600 dark:text-[#FF2F1F]"}
                          >{medianChange}%</td
                        >
                        <td
                          class={highChange > 0
                            ? "before:content-['+'] text-green-600 dark:text-[#00FC50]"
                            : "text-red-600 dark:text-[#FF2F1F]"}
                          >{highChange}%</td
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
