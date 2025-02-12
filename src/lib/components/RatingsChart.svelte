<script lang="ts">
  import { Chart } from "svelte-echarts";
  import { setCache, getCache } from "$lib/store";
  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import { monthNames } from "$lib/utils";
  import {
    GridComponent,
    TooltipComponent,
    MarkPointComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  use([
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    MarkPointComponent,
    CanvasRenderer,
  ]);

  export let data;
  export let symbol;
  export let ratingsList;
  export let numOfRatings = 0;
  export let title = "Ratings";
  export let addToLast = false; //if date value not found at mark point to the last value date.

  let isLoaded = false;
  let optionsData = null;
  let historicalData = [];
  let timePeriod = "1Y";

  function filterDataByPeriod(historicalData, period = "1Y") {
    const currentDate = new Date();
    let startDate;

    // Calculate the start date based on the period input
    switch (period) {
      case "1Y":
        startDate = new Date();
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      case "3Y":
        startDate = new Date();
        startDate.setFullYear(currentDate.getFullYear() - 3);
        break;
      case "5Y":
        startDate = new Date();
        startDate.setFullYear(currentDate.getFullYear() - 5);
        break;
      case "Max":
        // For 'Max', assume we want to start from the earliest possible date
        startDate = new Date(0); // This will set the date to January 1, 1970
        break;
      default:
        throw new Error(`Unsupported period: ${period}`);
    }

    // Filter the data based on the calculated start date
    const filteredData = historicalData?.filter((item) => {
      const itemDate = new Date(item?.time);
      return itemDate >= startDate && itemDate <= currentDate;
    });

    // Extract the dates and close values from the filtered data
    const dates = filteredData?.map((item) => item?.time);
    const closeValues = filteredData?.map((item) => item?.close);

    return { dates, closeValues };
  }

  async function historicalPrice(symbol) {
    const cachedData = getCache(symbol, "ratingsChart");
    if (cachedData) {
      historicalData = cachedData;
    } else {
      const postData = {
        ticker: symbol,
        timePeriod: "max",
      };

      const response = await fetch("/api/historical-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      historicalData = (await response?.json()) ?? [];

      setCache(symbol, historicalData, "ratingsChart");
    }
    optionsData = plotData();
  }

  // Function to plot data based on a specified time period
  function plotData() {
    // Extract the time (x-axis) and close values (y-axis)
    const { dates, closeValues } = filterDataByPeriod(
      historicalData,
      timePeriod,
    );
    // Prepare markPoints for ratings
    const markPoints = ratingsList
      ?.filter((rating) => {
        // Ensure date format is correct and matches the ticker symbol
        return rating?.ticker === symbol;
      })
      ?.map((rating) => {
        let dateIndex;

        if (addToLast) {
          // If addToLast is true, use fallback logic for the last date
          dateIndex = dates.includes(rating?.date)
            ? dates.indexOf(rating?.date)
            : dates.length - 1;
        } else {
          // If addToLast is false, use the original logic
          dateIndex = dates.indexOf(rating?.date);
        }

        return {
          type: "max", // Marking the rating date
          name: rating?.type,
          coord: [
            dates[dateIndex], // Use the found date or the last date
            closeValues[dateIndex], // Close value corresponding to the date
          ],
          label: {
            formatter: rating?.type
              ?.replace("Bought", "Buy")
              ?.replace("Sold", "Sell")
              ?.replace("Sector Perform", "Hold")
              ?.replace("Equal-Weight", "Hold")
              ?.replace("Market Perform", "Hold")
              ?.replace("Overweight", "Buy")
              ?.replace("Market Outperform", "Buy")
              ?.replace("Outperform", "Buy")
              ?.replace("Market Underperform", "Sell")
              ?.replace("Underperform", "Sell")
              ?.replace("Underweight", "Sell"),
            position: "top", // Position the label above the point
            color: "white", // Set label color (can be customized)
            fontSize: 14, // Set font size (increase for better visibility)
          },
          symbol: "rectangle", // Symbol type (can be customized)
          symbolSize: 12, // Increase symbol size for better visibility
          itemStyle: {
            color: "red", // Set symbol color to red for better visibility
          },
        };
      });

    const series = [
      {
        name: "Price",
        data: closeValues,
        type: "line",
        smooth: true,
        showSymbol: false,

        lineStyle: {
          color: "#fff",
          width: 1,
        },
        markPoint: {
          data: markPoints.map((point) => {
            let pinColor = "#FF0000"; // Default to red (Sell, Strong Sell)
            // Set the color based on the label
            if (["Buy", "Strong Buy"]?.includes(point?.label?.formatter)) {
              pinColor = "#00FF00"; // Green for Buy, Strong Buy
            } else if (["Hold", "Neutral"]?.includes(point?.label?.formatter)) {
              pinColor = "#FFA500"; // Orange for Hold
            }

            return {
              name: point.name,
              coord: point.coord,
              label: {
                ...point.label,
                fontSize: 16, // Increase font size
                fontWeight: "bold", // Make label bold
                color: "#fff", // Change label color to white
              },
              symbol: "pin", // Use pin symbol
              symbolSize: 20, // Increase symbol size
              itemStyle: {
                color: pinColor, // Apply the dynamically set color
              },
            };
          }),
        },
      },
    ];

    // Define chart options
    const options = {
      animation: false,
      silent: true,
      grid: {
        left: "2%",
        right: "2%",
        bottom: "10%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dates, // Use the extracted dates
        axisLabel: {
          color: "#fff",
          formatter: function (value) {
            // Assuming dates are in the format 'yyyy-mm-dd'
            const dateParts = value.split("-");
            const year = dateParts[0].substring(2); // Extract last two digits of the year
            const monthIndex = parseInt(dateParts[1]) - 1; // Zero-indexed months
            return `${monthNames[monthIndex]} '${year}`;
          },
        },
      },
      yAxis: {
        show: false, // Completely hides the y-axis
        type: "value",
        splitLine: {
          show: false, // Disable grid lines
        },
        axisLabel: {
          color: "#fff",
        },
      },

      series: series, // Use the dynamically created series array

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
          const date = params[0].name; // Get the date from the x-axis value
          const dateParts = date.split("-");
          const year = dateParts[0];
          const monthIndex = parseInt(dateParts[1]) - 1;
          const day = dateParts[2];
          const formattedDate = `${monthNames[monthIndex]} ${day}, ${year}`;

          // Return the tooltip content
          return `${formattedDate}<br/> ${params[0].value}`;
        },
      },
    };

    return options;
  }

  $: {
    if (symbol && typeof window !== "undefined" && timePeriod) {
      isLoaded = false;
      optionsData = null;
      historicalData = [];

      historicalPrice(symbol);
      isLoaded = true;
    }
  }
</script>

<div class="w-full overflow-hidden m-auto mt-5">
  {#if isLoaded && optionsData !== null}
    {#if historicalData?.length > 0}
      <div class="app w-full relative">
        <div class="flex justify-start space-x-2 absolute left-16 top-0 z-10">
          {#each ["1Y", "3Y", "5Y", "Max"] as item, index}
            {#if data?.user?.tier === "Pro" || index === 0}
              <label
                on:click={() => (timePeriod = item)}
                class="px-4 py-2 {timePeriod === item
                  ? 'bg-white text-black shadow-xl'
                  : 'text-white bg-table text-opacity-[0.6]'} transition ease-out duration-100 sm:hover:bg-white sm:hover:text-black rounded-md cursor-pointer"
              >
                {item}
              </label>
            {:else if data?.user?.tier !== "Pro"}
              <a
                href="/pricing"
                class="px-4 py-2 flex flex-row items-center {timePeriod === item
                  ? 'bg-white text-black shadow-xl'
                  : 'text-white bg-table text-opacity-[0.6]'} transition ease-out duration-100 sm:hover:bg-white sm:hover:text-black rounded-md cursor-pointer"
              >
                {item}
                <svg
                  class="ml-1 mt-0.5 w-3.5 h-3.5 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  ><path
                    fill="#A3A3A3"
                    d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                  /></svg
                >
              </a>
            {/if}
          {/each}
        </div>
        <h2
          class="text-white text-xl font-semibold text-center absolute left-1/2 transform -translate-x-1/2 top-5 -translate-y-1/2"
        >
          {symbol} - {numOfRatings}
          {title}
        </h2>
        <Chart {init} options={optionsData} class="chart" />
      </div>
    {:else}
      <div class="h-[250px] sm:h-[350px]">
        <div
          class="flex h-full w-full flex-col items-center justify-center rounded-sm border border-gray-800 p-6 text-center md:p-12"
        >
          <div class="mb-4 text-white text-[1rem] sm:text-xl font-semibold">
            No chart data available for {symbol}
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <div class="flex justify-center items-center h-80">
      <div class="relative">
        <label
          class="bg-default rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <span
            class="loading loading-spinner loading-md sm:loading-[1rem] text-gray-400"
          ></span>
        </label>
      </div>
    </div>
  {/if}
</div>

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
