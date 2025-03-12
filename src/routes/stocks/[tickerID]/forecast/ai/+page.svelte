<script lang="ts">
  import { displayCompanyName, stockTicker, screenWidth } from "$lib/store";
  import { removeCompanyStrings } from "$lib/utils";
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

  function getAIScorePlot() {
    // Assume data.getHistoricalPrice contains objects with a "time" field (e.g. "2015-01-02")
    const historicalData = data?.getHistoricalPrice || [];

    // Pre-defined backtest dates and scores
    const backtestList = [
      { date: "2023-03-31", yTest: 1, yPred: 1, score: 9 },
      { date: "2023-06-30", yTest: 0, yPred: 1, score: 9 },
      { date: "2023-09-30", yTest: 0, yPred: 1, score: 9 },
      { date: "2023-12-31", yTest: 0, yPred: 1, score: 7 },
      { date: "2024-03-31", yTest: 1, yPred: 1, score: 9 },
      { date: "2024-06-30", yTest: 1, yPred: 1, score: 9 },
      { date: "2024-09-30", yTest: 1, yPred: 1, score: 9 },
      { date: "2024-12-31", yTest: 0, yPred: 1, score: 9 },
    ];

    // Append the latest historical date (using "time") if available. Note that this entry may not include a score.
    if (historicalData && historicalData.length) {
      const latest = historicalData.at(-1);
      backtestList.push({ date: latest.time });
    }

    // For each backtest entry, find the historical price with the closest available time.
    // Then, if a score exists, attach a marker and data label based on the score.
    const processedData = backtestList.map((item) => {
      const dateStr = item.date;
      const targetTime = new Date(dateStr).getTime();
      let closestPoint = historicalData[0];
      let minDiff = Infinity;

      historicalData.forEach((point) => {
        const pointTime = new Date(point.time).getTime();
        const diff = Math.abs(pointTime - targetTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = point;
        }
      });

      // Base data point with x as the target date timestamp and y as the close price from the closest historical point
      const dataPoint = { x: targetTime, y: closestPoint.close };

      // If a score is provided, add marker configuration based on its value.
      if (item.hasOwnProperty("score")) {
        let markerColor, markerSymbol;
        if (item.score > 6) {
          // Bullish: green marker with an upward triangle
          markerColor = "#2ecc71";
          markerSymbol = "triangle-up";
        } else if (item.score < 5) {
          // Bearish: red marker with a downward triangle
          markerColor = "#e74c3c";
          markerSymbol = "triangle-down";
        } else {
          // Neutral (score exactly 5): yellow marker with a circle
          markerColor = "#f1c40f";
          markerSymbol = "circle";
        }

        dataPoint.marker = {
          symbol: markerSymbol,
          radius: 4,
          fillColor: markerColor,
          lineWidth: 2,
          lineColor: $mode === "light" ? "black" : "white",
        };

        dataPoint.dataLabels = {
          enabled: true,
          format: String(item.score),
          style: {
            color: $mode === "light" ? "black" : "white",
            fontWeight: "bold",
            fontSize: "14px",
          },
          y: -10,
        };
      }

      return dataPoint;
    });

    const solidData = processedData.slice(0, -1);
    const lastTwoPoints = processedData.slice(-2); // Extract the last two points

    // Highcharts options for plotting the data with markers.
    const options = {
      chart: {
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 360,
        animation: false,
      },
      title: {
        text: `<h3 class="mt-3 mb-1 text-[1rem] sm:text-lg">Historical AI Score Performance</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },
      xAxis: {
        gridLineWidth: 1,
        gridLineColor: $mode === "light" ? "#d1d5dc" : "#111827",
        type: "datetime",
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
      tooltip: {
        enabled: false,
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
          name: "Close Price",
          data: solidData,
          color: $mode === "light" ? "#007050" : "#fff",
          animation: false,
          marker: {
            enabled: true,
          },
          lineWidth: 2,
        },
        {
          name: "Projected Price",
          data: lastTwoPoints, // Include the second-last and last point
          color: $mode === "light" ? "#007050" : "#fff",
          animation: false,
          marker: {
            enabled: false,
          },
          lineWidth: 2,
          dashStyle: "Dash", // Dashed line for the last part
        },
      ],

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
      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
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

      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
    };
    return options;
  }

  let config = null;
  let configScore = null;

  $: {
    if ($mode) {
      configScore = getAIScorePlot() || null;
      config = getPriceForecastChart() || null;
    }
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Stock Forecast & Analyst Ratings | AI Insights`}
  description={`Discover our AI-powered forecast for ${$displayCompanyName} (${$stockTicker}). Get in-depth analyst ratings, price targets, upgrades, and downgrades from top Wall Street experts. Stay ahead of market trends and make smarter investment decisions.`}
/>

<section class="w-full overflow-hidden h-full">
  <div class="w-full flex justify-center w-full sm-auto h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <main class="w-full">
        <div class="sm:pl-7 sm:pb-7 sm:pt-7 m-auto mt-2 sm:mt-0">
          {#if Object?.keys(data?.getPriceAnalysis)?.length > 0}
            <div class="">
              <h1 class="text-xl sm:text-2xl font-bold">
                {removeCompanyStrings($displayCompanyName)} AI Score
              </h1>
            </div>
            <div class="w-full mb-10 mt-3">
              <Infobox
                text={`Our AI Score Model indicates a bullish outlook on Tesla with a score of 9. Key stats: Accuracy 50%, Precision 50%, F1 Score 67%, Recall 100%, ROC AUC 50%. Backtest results show consistent bullish predictions, with scores of 9 in most periods. Despite moderate accuracy, high recall ensures no bullish signals are missed. While improvements are needed, our model suggests strong upside potential for Tesla.`}
              />

              <div>
                <div class="grow pt-5">
                  <div
                    class="chart mt-5 shadow-sm sm:mt-0 sm:border sm:border-gray-300 dark:border-gray-800 rounded"
                    use:highcharts={configScore}
                  ></div>

                  <div
                    class="no-scrollbar mb-1 mt-2 overflow-x-auto px-1.5 text-center md:mb-0 md:px-0 lg:mt-5"
                  >
                    <table class="w-full text-right text-tiny xs:text-sm">
                      <thead
                        ><tr
                          class="border-b border-gray-300 dark:border-gray-600 font-normal text-sm sm:text-[1rem]"
                          ><th
                            class="py-[3px] text-left font-semibold lg:py-0.5"
                            >Date</th
                          > <th class="font-semibold">Q1 '23</th>
                          <th class="font-semibold">Q2 '23</th>
                          <th class="font-semibold">Q3 '23</th>
                          <th class="font-semibold">Q4 '23</th></tr
                        ></thead
                      >
                      <tbody
                        ><tr
                          class="border-b border-gray-300 dark:border-gray-600 font-normal text-sm sm:text-[1rem]"
                          ><td class="py-[3px] text-left lg:py-0.5">Score</td>
                          <td>8 (Bullish)</td>
                          <td>9 (Bullish)</td>
                          <td>8 (Bullish)</td>
                          <td>7 (Hold)</td></tr
                        >
                        <tr class="text-sm sm:text-[1rem]"
                          ><td class="py-[3px] text-left lg:py-0.5"
                            >QoQ Change</td
                          >
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

                  <p class="mt-4">
                    Following the AI Score for {removeCompanyStrings(
                      $displayCompanyName,
                    )} the model shows that the total return would be
                    <strong>+22.2%</strong>, with a maximum drawdown of
                    <strong>-12%</strong> based on the backtesting results.
                  </p>
                </div>
              </div>
            </div>
          {/if}

          {#if Object?.keys(data?.getPriceAnalysis)?.length > 0}
            <div class="">
              <h1 class="text-xl sm:text-2xl font-bold">
                {removeCompanyStrings($displayCompanyName)} Trend Forecast
              </h1>
            </div>
            <div class="w-full mb-6 mt-3">
              <Infobox
                text={`Using our AI model trained on historical data, we generated a
              12‑month forecast for ${$displayCompanyName}
              (${$stockTicker}) stock. The model estimates a median target price
              of ${medianPriceTarget}—ranging from a low of {lowPriceTarget}
              to a high of ${highPriceTarget}—which suggests ${
                medianChange > 0 ? "an increase" : "a decrease"
              } of ${medianChange}% compared to the current price
              of ${price}.`}
              />

              <div>
                <div class="grow pt-5">
                  <div
                    class="chart mt-5 sm:mt-0 shadow-sm sm:border sm:border-gray-300 dark:border-gray-800 rounded"
                    use:highcharts={config}
                  ></div>

                  <div
                    class="hide-scroll mb-1 mt-2 overflow-x-auto px-1.5 text-center md:mb-0 md:px-0 lg:mt-5"
                  >
                    <table class="w-full text-right text-tiny xs:text-sm">
                      <thead
                        ><tr
                          class="border-b border-gray-300 dark:border-gray-600 font-normal text-sm sm:text-[1rem]"
                          ><th
                            class="py-[3px] text-left font-semibold lg:py-0.5"
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
                          <td>${avgPriceTarget}</td>
                          <td>${medianPriceTarget}</td>
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
      </main>
    </div>
  </div>
</section>
