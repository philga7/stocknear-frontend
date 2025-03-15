<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import highcharts from "$lib/highcharts.ts";
  import { mode } from "mode-watcher";

  export let tickerFlow = [];

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

  function plotData() {
    // Determine the base date (using the first data point, or fallback to today)
    const baseDate =
      tickerFlow && tickerFlow.length
        ? new Date(tickerFlow[0].time)
        : new Date();

    // Set the fixed start and end times (9:30 and 16:10)
    const startTime = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      9,
      30,
    ).getTime();
    const endTime = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      16,
      10,
    ).getTime();

    // Create series arrays with x (timestamp) and y values.
    // This removes the need for xAxis.categories.
    const priceSeries =
      tickerFlow?.map((item) => ({
        x: new Date(item.time).getTime(),
        y: item.close,
      })) || [];

    const netCallPremSeries =
      tickerFlow?.map((item) => ({
        x: new Date(item.time).getTime(),
        y: item.net_call_premium,
      })) || [];

    const netPutPremSeries =
      tickerFlow?.map((item) => ({
        x: new Date(item.time).getTime(),
        y: item.net_put_premium,
      })) || [];

    const options = {
      chart: {
        type: "column",
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 360, // Set the maximum height for the chart
        animation: false,
      },

      title: {
        text: null,
      },
      legend: {
        enabled: true,
        align: "left", // Positions legend at the left edge
        verticalAlign: "top", // Positions legend at the top
        layout: "horizontal", // Align items horizontally (use 'vertical' if preferred)
        itemStyle: {
          color: $mode === "light" ? "black" : "white",
        },
        symbolWidth: 16, // Controls the width of the legend symbol
        symbolRadius: 8, // Creates circular symbols (adjust radius as needed)
        squareSymbol: false, // Ensures symbols are circular, not square
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black
        borderColor: "rgba(255, 255, 255, 0.2)", // Slightly visible white border
        borderWidth: 1,
        style: {
          color: "#fff",
          fontSize: "16px",
          padding: "10px",
        },
        borderRadius: 4,
        formatter: function () {
          // Format the x value to display time in a custom format
          let tooltipContent = `<span class="m-auto text-[1rem] font-[501]">${new Date(
            this?.x,
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}</span><br>`;

          // Loop through each point in the shared tooltip
          this.points.forEach((point) => {
            tooltipContent += `
        <span style="display:inline-block; width:10px; height:10px; background-color:${point.color}; border-radius:50%; margin-right:5px;"></span>
        <span class="font-semibold text-sm">${point.series.name}:</span> 
        <span class="font-normal text-sm">${abbreviateNumber(point.y)}</span><br>`;
          });

          return tooltipContent;
        },
      },

      xAxis: {
        type: "datetime",
        min: startTime, // Force start at 9:30
        max: endTime, // Force end at 16:10
        crosshair: {
          color: $mode === "light" ? "black" : "white", // Set the color of the crosshair line
          width: 1, // Adjust the line width as needed
          dashStyle: "Solid",
        },
        labels: {
          style: { color: $mode === "light" ? "black" : "white" },
          distance: 20, // Increases space between label and axis
          formatter: function () {
            return new Date(this.value).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });
          },
        },
        tickPositioner: function () {
          // Create custom tick positions with wider spacing
          const positions = [];
          const info = this.getExtremes();
          const tickCount = 5; // Reduce number of ticks displayed
          const interval = (info.max - info.min) / tickCount;

          for (let i = 0; i <= tickCount; i++) {
            positions.push(info.min + i * interval);
          }
          return positions;
        },
      },

      yAxis: [
        {
          title: {
            text: null,
          },
          labels: {
            enabled: false,
          },
          gridLineWidth: 0,
          opposite: false,
        },
        {
          gridLineWidth: 1,
          gridLineColor: $mode === "light" ? "#d1d5dc" : "#111827",
          labels: {
            style: { color: $mode === "light" ? "black" : "white" },
          },
          title: { text: null },
          opposite: true,
        },
      ],

      series: [
        {
          name: "Price",
          type: "spline",
          data: priceSeries,
          yAxis: 0,
          color: $mode === "light" ? "#2C6288" : "#fff",
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: false,
              },
            },
          },
          lineWidth: 2,
          zIndex: 10,
        },

        {
          name: "Net Call Prem",
          type: "spline",
          data: netCallPremSeries,
          yAxis: 1,
          color: $mode === "light" ? "#208646" : "#90EE90",
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: false,
              },
            },
          },
        },
        {
          name: "Net Put Prem",
          type: "spline",
          data: netPutPremSeries,
          yAxis: 1,
          color: $mode === "light" ? "#DC2626" : "#FF6B6B",
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: false,
              },
            },
          },
        },
      ],

      plotOptions: {
        series: {
          color: "white",
          animation: false, // Disable series animation
          states: {
            hover: {
              enabled: false, // Disable hover effect globally
            },
          },
        },
      },
    };

    return options;
  }

  let config = null;
  $: {
    if ($mode) {
      config = plotData();
    }
  }
</script>

<section class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="w-full m-auto">
            {#if tickerFlow?.length > 0}
              <label
                for="dailyNetPutCallPrem"
                class="mr-1 cursor-pointer flex flex-row items-center text-xl sm:text-2xl font-bold w-fit"
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

              <div class=" text-xs sm:text-sm italic mt-5 mb-3">
                Last Updated: {formatDate(findLastNonNull(tickerFlow, "time"))}
              </div>
              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
              >
                <div
                  class="shadow-md bg-gray-100 dark:bg-gray-800/30 rounded-lg p-4"
                >
                  <div class=" text-sm mb-2 flex items-center">
                    <span>Volume</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold">
                      {abbreviateNumber(
                        findLastNonNull(tickerFlow, "net_volume"),
                        false,
                        true,
                      )}</span
                    >
                  </div>
                </div>

                <div
                  class="shadow-md bg-gray-100 dark:bg-gray-800/30 rounded-lg p-4"
                >
                  <div class=" text-sm mb-2 flex items-center">
                    <span>Net Call Prem</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold"
                      >{abbreviateNumber(
                        findLastNonNull(tickerFlow, "net_call_premium"),
                        false,
                        true,
                      )}</span
                    >
                  </div>
                </div>

                <div
                  class="shadow-md bg-gray-100 dark:bg-gray-800/30 rounded-lg p-4"
                >
                  <div class=" text-sm mb-2 flex items-center">
                    <span>Net Put Prem</span>
                  </div>
                  <div class="flex items-baseline">
                    <span class="text-xl font-bold"
                      >{abbreviateNumber(
                        findLastNonNull(tickerFlow, "net_put_premium"),
                        false,
                        true,
                      )}</span
                    >
                  </div>
                </div>
              </div>

              <div class="mb-5">
                <div
                  class="shadow border border-gray-300 dark:border-gray-800 rounded"
                  use:highcharts={config}
                ></div>
              </div>
            {/if}
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
