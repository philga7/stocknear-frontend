<script lang="ts">
  import {
    displayCompanyName,
    stockTicker,
    analystEstimateComponent,
    screenWidth,
  } from "$lib/store";
  import {
    abbreviateNumber,
    monthNames,
    removeCompanyStrings,
  } from "$lib/utils";

  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart, GaugeChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import { goto } from "$app/navigation";

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

  let index = 0;
  let changeRevenue = 0;
  let changeRevenueNextYear = 0;
  let changeEPS = 0;
  let changeEPSNextYear = 0;
  const price = data?.getStockQuote?.price?.toFixed(2) || 0;

  const calculatePriceChange = (targetPrice) =>
    targetPrice && price ? ((targetPrice / price - 1) * 100)?.toFixed(2) : 0;

  let numOfAnalyst = data?.getAnalystSummary?.numOfAnalyst || 0;
  let avgPriceTarget = data?.getAnalystSummary?.avgPriceTarget || 0;
  let medianPriceTarget = data?.getAnalystSummary?.medianPriceTarget || 0;
  let lowPriceTarget = data?.getAnalystSummary?.lowPriceTarget || 0;
  let highPriceTarget = data?.getAnalystSummary?.highPriceTarget || 0;
  let consensusRating = data?.getAnalystSummary?.consensusRating;

  let lowChange = calculatePriceChange(lowPriceTarget);
  let medianChange = calculatePriceChange(medianPriceTarget);
  let avgChange = calculatePriceChange(avgPriceTarget);
  let highChange = calculatePriceChange(highPriceTarget);
  let rawAnalystList = data?.getAnalystSummary?.recommendationList || [];
  let recommendationList =
    rawAnalystList?.length > 5 ? rawAnalystList?.slice(-6) : rawAnalystList;
  let categories = ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"];

  const tabs = [
    {
      title: "All Analysts",
    },
    {
      title: "Top Analysts",
    },
  ];
  let activeIdx = 0;

  function changeTab(index) {
    activeIdx = index;
    if (activeIdx === 0) {
      numOfAnalyst = data?.getAnalystSummary?.numOfAnalyst || 0;
      avgPriceTarget = data?.getAnalystSummary?.avgPriceTarget || 0;
      medianPriceTarget = data?.getAnalystSummary?.medianPriceTarget || 0;
      lowPriceTarget = data?.getAnalystSummary?.lowPriceTarget || 0;
      highPriceTarget = data?.getAnalystSummary?.highPriceTarget || 0;
      consensusRating = data?.getAnalystSummary?.consensusRating;

      lowChange = calculatePriceChange(lowPriceTarget);
      medianChange = calculatePriceChange(medianPriceTarget);
      avgChange = calculatePriceChange(avgPriceTarget);
      highChange = calculatePriceChange(highPriceTarget);
      rawAnalystList = data?.getAnalystSummary?.recommendationList || [];
      recommendationList =
        rawAnalystList?.length > 5 ? rawAnalystList?.slice(-6) : rawAnalystList;
      categories = ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"];
    } else {
      numOfAnalyst = data?.getTopAnalystSummary?.numOfAnalyst || 0;
      avgPriceTarget = data?.getTopAnalystSummary?.avgPriceTarget || 0;
      medianPriceTarget = data?.getTopAnalystSummary?.medianPriceTarget || 0;
      lowPriceTarget = data?.getTopAnalystSummary?.lowPriceTarget || 0;
      highPriceTarget = data?.getTopAnalystSummary?.highPriceTarget || 0;
      consensusRating = data?.getTopAnalystSummary?.consensusRating;

      lowChange = calculatePriceChange(lowPriceTarget);
      medianChange = calculatePriceChange(medianPriceTarget);
      avgChange = calculatePriceChange(avgPriceTarget);
      highChange = calculatePriceChange(highPriceTarget);
      rawAnalystList = data?.getTopAnalystSummary?.recommendationList || [];
      recommendationList =
        rawAnalystList?.length > 5 ? rawAnalystList?.slice(-6) : rawAnalystList;
      categories = ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"];

      console.log(recommendationList);
    }

    optionsData = getPlotOptions() || null;
    optionsPieChart = getPieChart() || null;
    optionsPriceForecast = getPriceForecastChart() || null;
  }

  function findIndex(data) {
    let year = new Date().getFullYear() - 1;

    while (year > 0) {
      // Ensure we don't loop indefinitely
      // Find the index where the item's date matches the current year and revenue is null
      const index = data?.findIndex((item) => item?.date === year);

      // If index is found and there is at least one item in the data for this year with non-null revenue
      if (index !== -1) {
        const hasNonNullRevenue = data?.some(
          (item) => item?.date === year && item?.revenue !== null,
        );

        // Add +1 to the index if the condition is met
        return hasNonNullRevenue ? index + 1 : index;
      }

      // Decrement the year to search the previous year
      year--;
    }

    return -1; // Return -1 if no matching index is found
  }

  function getTotalForDate(index, recommendationList) {
    return categories?.reduce(
      (sum, cat) => sum + recommendationList[index][cat],
      0,
    );
  }

  const calculateChange = (current, previous) => {
    if (previous !== undefined && previous !== 0) {
      const change = (Math.abs(current) / Math.abs(previous) - 1) * 100;
      // Preserve the direction of change (positive/negative)
      const direction = current < 0 || previous < 0 ? -1 : 1;
      return change * direction;
    } else {
      return null;
    }
  };

  function getPlotOptions() {
    if (!rawAnalystList || rawAnalystList.length === 0) {
      return null;
    }

    // Define categories in the exact order you specified
    const categories = ["Strong Sell", "Sell", "Hold", "Buy", "Strong Buy"];
    const colors = ["#9E190A", "#D9220E", "#FF9E21", "#31B800", "#008A00"];

    // Create a consistent mapping for data
    const formattedData = rawAnalystList?.map((item) =>
      categories.map((cat) => item[cat] || 0),
    );

    // Normalize data to percentages
    const normalizedData = formattedData.map((row) => {
      const total = row.reduce((sum, val) => sum + val, 0);
      return row.map((val) => (total > 0 ? (val / total) * 100 : 0));
    });

    // Calculate total percentage for each category across all dates
    const totalData = [];
    for (let i = 0; i < categories.length; ++i) {
      let sum = 0;
      for (let j = 0; j < normalizedData.length; ++j) {
        sum += normalizedData[j][i];
      }
      totalData.push(sum / normalizedData.length);
    }

    // Define series based on categories with color mapping
    const series = categories.map((name, idx) => ({
      name,
      type: "bar",
      stack: "total",
      barWidth: "60%",
      data: normalizedData.map((row) => row[idx]),
      itemStyle: {
        color: colors[idx],
      },
    }));

    // Define chart option
    const option = {
      grid: {
        left: "2%",
        right: "2%",
        bottom: "10%",
        top: "5%",
        containLabel: true,
      },

      xAxis: {
        type: "category",
        data: rawAnalystList.map((item) => item.date),
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            const dateParts = value.split("-");
            const year = dateParts[0].substring(0);
            const monthIndex = parseInt(dateParts[1]) - 1;
            return `${monthNames[monthIndex]} ${year}`;
          },
        },
      },
      yAxis: {
        type: "value",
        max: 100,

        axisLabel: {
          show: false, // Hide y-axis labels
        },
        splitLine: {
          show: false,
        },
      },
      series,
      animation: false,
      silent: true,
    };

    return option;
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

  if (data?.getAnalystEstimate?.length !== 0) {
    index = findIndex(data?.getAnalystEstimate);

    // Calculate changes using the helper function
    const estimatedRevenueAvg =
      data?.getAnalystEstimate[index]?.estimatedRevenueAvg;
    const revenue = data?.getAnalystEstimate[index - 1]?.revenue;
    const estimatedRevenueAvgNextYear =
      data?.getAnalystEstimate[index + 1]?.estimatedRevenueAvg;
    const estimatedEpsAvg = data?.getAnalystEstimate[index]?.estimatedEpsAvg;
    const eps = data?.getAnalystEstimate[index - 1]?.eps;
    const estimatedEPSAvgNextYear =
      data?.getAnalystEstimate[index + 1]?.estimatedEpsAvg;

    // Calculate percentage changes for each metric
    changeRevenue = calculateChange(estimatedRevenueAvg, revenue);
    changeRevenueNextYear = calculateChange(
      estimatedRevenueAvgNextYear,
      estimatedRevenueAvg,
    );
    changeEPS = calculateChange(estimatedEpsAvg, eps);
    changeEPSNextYear = calculateChange(
      estimatedEPSAvgNextYear,
      estimatedEpsAvg,
    );
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

  let optionsData = getPlotOptions() || null;
  let optionsPieChart = getPieChart() || null;
  let optionsPriceForecast = getPriceForecastChart() || null;

  function latestInfoDate(inputDate) {
    // Convert the input date string to milliseconds since epoch
    const inputDateMs = Date?.parse(inputDate);

    // Get today's date in milliseconds since epoch
    const todayMs = Date?.now();

    // Calculate the difference in milliseconds
    const differenceInMs = todayMs - inputDateMs;

    // Convert milliseconds to days
    const differenceInDays = Math?.floor(
      differenceInMs / (1000 * 60 * 60 * 24),
    );

    // Return the difference in days
    return differenceInDays <= 1;
  }
</script>

<SEO
  title={`${$displayCompanyName} (${$stockTicker}) Forecast Overview · Stocknear`}
  description={`A list of analyst ratings for Advanced Micro Devices (AMD) stock. See upgrades, downgrades, price targets and more from top Wall Street stock analysts.`}
/>

<section class="w-full bg-default overflow-hidden text-white h-full">
  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div class="sm:pl-4 sm:pt-4 w-full m-auto mt-2 sm:mt-0">
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between"
        >
          <h1 class="mb-px text-xl sm:text-2xl font-bold bp:text-3xl sm:pl-1">
            {removeCompanyStrings($displayCompanyName)} Forecast
          </h1>

          <div class="inline-flex justify-center w-full rounded-md sm:w-auto">
            <div
              class="bg-secondary w-full sm:w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 mt-4"
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
                    on:click={() => changeTab(i)}
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
                  The {numOfAnalyst} analysts with 12-month price forecasts for {$stockTicker}
                  stock have an median target of {medianPriceTarget}, with a low
                  estimate of {lowPriceTarget}
                  and a high estimate of {highPriceTarget}. The median target
                  predicts {medianChange > 0 ? "an increase" : "a decrease"} of {medianChange}%
                  from the current stock price of {price}.
                </p>
              </div>
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
            <div class="grow pt-2 md:pt-4 lg:pl-4 lg:pt-0">
              <div class="app h-[250px] xs:h-[275px]">
                {#if optionsPriceForecast !== null}
                  <Chart {init} options={optionsPriceForecast} class="chart" />
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

          <div
            class="w-full rounded-sm border border-gray-600 mt-8 p-3 divide-gray-600 lg:flex lg:space-x-4 lg:divide-x"
          >
            <div
              class="flex flex-col justify-between p-1 lg:max-w-[32%] text-white"
            >
              <div>
                <div class="flex flex-row items-center">
                  <h2 class="mb-1 text-xl font-bold">AI Analyst Report</h2>
                  {#if latestInfoDate(data?.getAnalystInsight?.date)}
                    <label
                      class="bg-[#fff] rounded text-black font-semibold text-xs px-2 py-0.5 ml-3"
                      >New</label
                    >
                  {/if}
                </div>
                {#if Object?.keys(data?.getAnalystInsight)?.length > 0}
                  {#if data?.user?.tier === "Pro"}
                    <p>{data?.getAnalystInsight?.insight}</p>
                    <p class="mt-5 italic text-white text-sm">
                      Updated {data?.getAnalystInsight?.date}
                    </p>
                  {:else}
                    <p>
                      {data?.getAnalystInsight?.insight?.slice(0, 50) + "..."}
                      <span class="mt-3">
                        Unlock content with
                        <a
                          class="inline-block ml-0.5 text-blue-400 sm:hover:text-white"
                          href="/pricing"
                          >Pro Subscription <svg
                            class="w-4 h-4 mb-1 inline-block text[#A3A3A3] sm:hover:text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            ><path
                              fill="currentColor"
                              d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                            /></svg
                          ></a
                        >
                      </span>
                    </p>

                    <p class="mt-5 italic text-white text-sm">
                      Updated {data?.getAnalystInsight?.date}
                    </p>
                  {/if}
                {:else}
                  <p>
                    According to {numOfAnalyst} stock analyst, the rating for {$displayCompanyName}
                    is "{consensusRating}". This means that the analyst believes
                    this stock is likely to lead to {[
                      "Strong Sell",
                      "Sell",
                    ]?.includes(consensusRating)
                      ? "lower"
                      : ["Strong Buy", "Buy"]?.includes(consensusRating)
                        ? "higher"
                        : "similar"} returns than market as a whole.
                  </p>
                {/if}
              </div>
            </div>
            <div class="grow pt-2 md:pt-4 lg:pl-4 lg:pt-0">
              <div class="app h-[250px] xs:h-[275px]">
                {#if optionsData !== null}
                  <Chart {init} options={optionsData} class="chart" />
                {/if}
              </div>
              <div
                class="hide-scroll mb-1 mt-2 overflow-x-auto px-1.5 text-center md:mb-0 md:px-0 lg:mt-2"
              >
                <table
                  class="w-full text-right text-tiny xs:text-sm md:text-smaller"
                >
                  <thead
                    ><tr class="border-b border-gray-600 font-normal"
                      ><th
                        class="whitespace-nowrap px-1 py-[3px] text-sm sm:text-[1rem] text-left font-semibold"
                        >Rating</th
                      >
                      {#each recommendationList as item}
                        <th
                          class="px-1 py-[3px] text-sm sm:text-[1rem] text-right font-semibold"
                          >{new Intl.DateTimeFormat("en", {
                            month: "short",
                            year: "2-digit",
                          }).format(new Date(item?.date))}</th
                        >
                      {/each}
                    </tr></thead
                  >
                  <tbody>
                    {#each categories as category}
                      <tr class="border-b border-gray-600 font-normal">
                        <td
                          class="whitespace-nowrap px-1 py-[3px] text-sm sm:text-[1rem] text-left"
                          >{category}</td
                        >
                        {#each recommendationList as entry}
                          <td
                            class="px-1 py-[3px] text-sm sm:text-[1rem] text-right"
                            >{entry[category]}</td
                          >
                        {/each}
                      </tr>
                    {/each}
                    <tr class="font-semibold"> </tr><tr class="font-semibold">
                      <td
                        class="whitespace-nowrap px-1 py-[3px] text-sm sm:text-[1rem] text-left"
                        >Total</td
                      >
                      {#each recommendationList as _, i}
                        <td
                          class="px-1 py-[3px] text-sm sm:text-[1rem] text-right"
                        >
                          {getTotalForDate(i, recommendationList)}
                        </td>
                      {/each}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <h2 class="mt-8 text-xl sm:text-2xl text-white font-bold mb-4">
            Financial Forecast this Year
          </h2>
          {#if data?.getAnalystEstimate?.length !== 0}
            <div
              class="mb-4 grid grid-cols-1 overflow-hidden rounded-md border divide-gray-600 border-gray-600 md:grid-cols-2 lg:grid-cols-4"
            >
              <div
                class="border-b px-3 py-5 last:border-b-0 xs:px-4 sm:p-6 md:border-b lg:border-b-0 border-gray-600"
              >
                <div class="text-base font-normal text-white">
                  Revenue This Year
                </div>
                <div
                  class="mt-1 flex flex-wrap items-baseline justify-between space-y-2 bp:space-y-0"
                >
                  <div
                    class="flex items-baseline text-2xl font-semibold text-white"
                  >
                    {data?.getAnalystEstimate[index]?.estimatedRevenueAvg !==
                      null &&
                    data?.getAnalystEstimate[index]?.estimatedRevenueAvg !== 0
                      ? abbreviateNumber(
                          data?.getAnalystEstimate[index]?.estimatedRevenueAvg,
                        )
                      : "n/a"}
                    {#if data?.getAnalystEstimate[index]?.estimatedRevenueAvg !== null && data?.getAnalystEstimate[index]?.estimatedRevenueAvg !== 0}
                      <div
                        class="ml-2 block text-sm font-semibold text-white lg:hidden"
                      >
                        from {data?.getAnalystEstimate[index - 1]?.revenue !==
                        undefined
                          ? abbreviateNumber(
                              data?.getAnalystEstimate[index - 1]?.revenue,
                            )
                          : "n/a"}
                      </div>
                    {/if}
                  </div>
                  {#if data?.getAnalystEstimate[index]?.estimatedRevenueAvg !== null && data?.getAnalystEstimate[index]?.estimatedRevenueAvg !== 0}
                    <div
                      class="inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-semibold md:mt-2 lg:mt-0 {changeRevenue >
                      0
                        ? 'bg-[#00FC50]'
                        : 'bg-[#FF2F1F]'} text-black"
                    >
                      <svg
                        class="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-black {changeRevenue >
                        0
                          ? ''
                          : 'rotate-180 '}"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style="max-width:40px"
                        aria-hidden="true"
                        ><path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        ></path></svg
                      > <span class="sr-only">Increased by</span>
                      {abbreviateNumber(changeRevenue?.toFixed(1))}%
                    </div>
                  {/if}
                </div>
                {#if data?.getAnalystEstimate[index]?.estimatedRevenueAvg !== null && data?.getAnalystEstimate[index]?.estimatedRevenueAvg !== 0}
                  <div
                    class="ml-0.5 mt-1.5 hidden text-sm font-semibold text-white lg:block"
                  >
                    from {data?.getAnalystEstimate[index - 1]?.revenue !== null
                      ? abbreviateNumber(
                          data?.getAnalystEstimate[index - 1]?.revenue,
                        )
                      : "n/a"}
                  </div>
                {/if}
              </div>
              <div
                class="border-b px-3 py-5 last:border-b-0 xs:px-4 sm:p-6 md:border-b md:border-l lg:border-b-0"
              >
                <div class="text-base font-normal text-white">
                  Revenue Next Year
                </div>
                <div
                  class="mt-1 flex flex-wrap items-baseline justify-between space-y-2 bp:space-y-0"
                >
                  <div
                    class="flex items-baseline text-2xl font-semibold text-white"
                  >
                    {data?.getAnalystEstimate[index + 1]
                      ?.estimatedRevenueAvg !== undefined
                      ? abbreviateNumber(
                          data?.getAnalystEstimate[index + 1]
                            ?.estimatedRevenueAvg,
                        )
                      : "n/a"}
                    <div
                      class="ml-2 block text-sm font-semibold text-white lg:hidden"
                    >
                      from {data?.getAnalystEstimate[index]
                        ?.estimatedRevenueAvg !== undefined
                        ? abbreviateNumber(
                            data?.getAnalystEstimate[index]
                              ?.estimatedRevenueAvg,
                          )
                        : "n/a"}
                    </div>
                  </div>
                  <div
                    class="inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-semibold md:mt-2 lg:mt-0 {changeRevenueNextYear >
                    0
                      ? 'bg-[#00FC50]'
                      : 'bg-[#FF2F1F]'} text-black"
                  >
                    <svg
                      class="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-black {changeRevenueNextYear >
                      0
                        ? ''
                        : 'rotate-180 '}"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style="max-width:40px"
                      aria-hidden="true"
                      ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 11l5-5m0 0l5 5m-5-5v12"
                      ></path></svg
                    > <span class="sr-only">Increased by</span>
                    {abbreviateNumber(changeRevenueNextYear?.toFixed(1))}%
                  </div>
                </div>
                <div
                  class="ml-0.5 mt-1.5 hidden text-sm font-semibold text-white lg:block"
                >
                  from {data?.getAnalystEstimate[index]?.estimatedRevenueAvg !==
                  undefined
                    ? abbreviateNumber(
                        data?.getAnalystEstimate[index]?.estimatedRevenueAvg,
                      )
                    : "n/a"}
                </div>
              </div>
              <div
                class="border-b px-3 py-5 last:border-b-0 xs:px-4 sm:p-6 md:border-b-0 lg:border-l"
              >
                <div class="text-base font-normal text-white">
                  EPS This Year
                </div>
                <div
                  class="mt-1 flex flex-wrap items-baseline justify-between space-y-2 bp:space-y-0"
                >
                  <div
                    class="flex items-baseline text-2xl font-semibold text-white"
                  >
                    {abbreviateNumber(
                      data?.getAnalystEstimate[index]?.estimatedEpsAvg,
                    )}
                    <div
                      class="ml-2 block text-sm font-semibold text-white lg:hidden"
                    >
                      from {data?.getAnalystEstimate[index - 1]?.eps}
                    </div>
                  </div>
                  <div
                    class="inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-semibold md:mt-2 lg:mt-0 {changeEPS >
                    0
                      ? 'bg-[#00FC50]'
                      : 'bg-[#FF2F1F]'} text-black"
                  >
                    <svg
                      class="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-black {changeEPS >
                      0
                        ? ''
                        : 'rotate-180 '}"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style="max-width:40px"
                      aria-hidden="true"
                      ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 11l5-5m0 0l5 5m-5-5v12"
                      ></path></svg
                    > <span class="sr-only">Increased by</span>
                    {abbreviateNumber(changeEPS?.toFixed(1))}%
                  </div>
                </div>
                <div
                  class="ml-0.5 mt-1.5 hidden text-sm font-semibold text-white lg:block"
                >
                  from {data?.getAnalystEstimate[index - 1]?.eps}
                </div>
              </div>
              <div
                class="border-b px-3 py-5 last:border-b-0 xs:px-4 sm:p-6 md:border-l"
              >
                <div class="text-base font-normal text-white">
                  EPS Next Year
                </div>
                <div
                  class="mt-1 flex flex-wrap items-baseline justify-between space-y-2 bp:space-y-0"
                >
                  <div
                    class="flex items-baseline text-2xl font-semibold text-white"
                  >
                    {abbreviateNumber(
                      data?.getAnalystEstimate[index + 1]?.estimatedEpsAvg,
                    )}
                    <div
                      class="ml-2 block text-sm font-semibold text-white lg:hidden"
                    >
                      from {abbreviateNumber(
                        data?.getAnalystEstimate[index]?.estimatedEpsAvg,
                      )}
                    </div>
                  </div>
                  <div
                    class="inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-semibold md:mt-2 lg:mt-0 {changeEPSNextYear >
                    0
                      ? 'bg-[#00FC50]'
                      : 'bg-[#FF2F1F] '} text-black"
                  >
                    <svg
                      class="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-black {changeEPSNextYear >
                      0
                        ? ''
                        : 'rotate-180 '}"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style="max-width:40px"
                      aria-hidden="true"
                      ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 11l5-5m0 0l5 5m-5-5v12"
                      ></path></svg
                    > <span class="sr-only">Increased by</span>
                    {abbreviateNumber(changeEPSNextYear?.toFixed(1))}%
                  </div>
                </div>
                <div
                  class="ml-0.5 mt-1.5 hidden text-sm font-semibold text-white lg:block"
                >
                  from {abbreviateNumber(
                    data?.getAnalystEstimate[index]?.estimatedEpsAvg,
                  )}
                </div>
              </div>
            </div>

            <div
              class="w-full m-auto {!$analystEstimateComponent ? 'hidden' : ''}"
            >
              {#await import("$lib/components/AnalystEstimate.svelte") then { default: Comp }}
                <svelte:component this={Comp} {data} />
              {/await}
            </div>
          {:else}
            <div
              class="text-white p-3 sm:p-5 mb-10 rounded-md sm:flex sm:flex-row sm:items-center border border-gray-600 text-sm sm:text-[1rem]"
            >
              <svg
                class="w-6 h-6 flex-shrink-0 inline-block sm:mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                ><path
                  fill="#fff"
                  d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-4 48a12 12 0 1 1-12 12a12 12 0 0 1 12-12m12 112a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 0 16"
                /></svg
              >
              No analyst forecast available for {$displayCompanyName}.
            </div>
          {/if}
        </div>
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
