<script lang="ts">
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import { abbreviateNumber } from "$lib/utils";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import Infobox from "$lib/components/Infobox.svelte";

  import Tutorial from "$lib/components/Tutorial.svelte";

  import { mode } from "mode-watcher";

  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";

  import SEO from "$lib/components/SEO.svelte";
  import highcharts from "$lib/highcharts.ts";

  export let data;
  let config = null;
  //let sectorData = data?.getData?.sectorData || [];
  let topPosNetPremium = data?.getData?.topPosNetPremium || [];

  let marketTideData = data?.getData?.marketTide || {};
  let originalPosTickers = topPosNetPremium;
  let displayPosTickers = topPosNetPremium;

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

  $: sortOrders = {
    rank: { order: "none", type: "number" },
    date: { order: "none", type: "date" },
    ticker: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    price: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    call_volume: { order: "none", type: "number" },
    put_volume: { order: "none", type: "number" },
    net_premium: { order: "none", type: "number" },
    net_call_premium: { order: "none", type: "number" },
    net_put_premium: { order: "none", type: "number" },
    call_premium: { order: "none", type: "number" },
    put_premium: { order: "none", type: "number" },
    iv_rank: { order: "none", type: "number" },
  };

  $: topColumns = [
    { key: "rank", label: "Rank", align: "left" },
    { key: "ticker", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "net_premium", label: "Net Prem", align: "right" },
    { key: "net_call_premium", label: "Net Call Prem", align: "right" },
    { key: "net_put_premium", label: "Net Put Prem", align: "right" },
    { key: "iv_rank", label: "IV Rank", align: "right" },
  ];

  const sortPosTickers = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalPosTickers = [...topPosNetPremium]; // Reset originalPosTickers to sectorData
      displayPosTickers = originalPosTickers?.slice(0, 50);
      return;
    }

    // Define a generic comparison function
    const compareValues = (a, b) => {
      const { type } = sortOrders[key];
      let valueA, valueB;

      switch (type) {
        case "date":
          valueA = new Date(a[key]);
          valueB = new Date(b[key]);
          break;
        case "string":
          valueA = a[key].toUpperCase();
          valueB = b[key].toUpperCase();
          return sortOrder === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        case "number":
        default:
          valueA = parseFloat(a[key]);
          valueB = parseFloat(b[key]);
          break;
      }

      if (sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    };

    // Sort using the generic comparison function
    displayPosTickers = [...originalPosTickers]
      .sort(compareValues)
      ?.slice(0, 50);
  };

  function plotData() {
    // Determine the base date (using the first data point, or fallback to today)
    const baseDate =
      marketTideData && marketTideData.length
        ? new Date(marketTideData[0].time)
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
      marketTideData?.map((item) => ({
        x: new Date(item.time).getTime(),
        y: item.close,
      })) || [];

    const netCallPremSeries =
      marketTideData?.map((item) => ({
        x: new Date(item.time).getTime(),
        y: item.net_call_premium,
      })) || [];

    const netPutPremSeries =
      marketTideData?.map((item) => ({
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
        text: `<h3 class="mt-3 -mb-2">S&P500 Flow</h3>`,
        style: {
          color: $mode === "light" ? "black" : "white",
          // Using inline CSS for margin-top and margin-bottom
        },
        useHTML: true, // Enable HTML to apply custom class styling
      },

      legend: {
        enabled: true,
        align: "center", // Positions legend at the left edge
        verticalAlign: "top", // Positions legend at the top
        layout: "horizontal", // Align items horizontally (use 'vertical' if preferred)
        itemStyle: {
          color: $mode === "light" ? "black" : "white",
        },
        symbolWidth: 14, // Controls the width of the legend symbol
        symbolRadius: 1, // Creates circular symbols (adjust radius as needed)
        squareSymbol: true, // Ensures symbols are circular, not square
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
          )?.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
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
          style: { color: $mode === "light" ? "#545454" : "white" },
          distance: 10, // Increases space between label and axis
          formatter: function () {
            const date = new Date(this?.value);
            const timeString = date?.toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            });
            return `<span class="text-xs">${timeString.replace(/\s/g, " ")}</span>`;
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
          gridLineColor: $mode === "light" ? "#e5e7eb" : "#111827",
          labels: {
            style: { color: $mode === "light" ? "#545454" : "white" },
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

  let steps = [
    {
      popover: {
        title: "Market Flow",
        description: `Track real‑time S&P 500 options flow to pinpoint large call and put premium trades, monitor net premium movement, and gauge bullish vs. bearish sentiment. Instantly spot institutional‑size orders, follow shifts in market skew, and align your strategy with the prevailing market bias.`,
        side: "center",
        align: "center",
      },
    },
    {
      element: ".net-volume-driver",
      popover: {
        title: "Net Volume",
        description: `Net volume is defined as (call ask volume − call bid volume) − (put ask volume − put bid volume). It reflects the balance of aggressive buying versus selling across calls and puts. A positive value suggests bullish sentiment, while a negative value indicates bearish pressure from big whales.`,
        side: "left",
        align: "start",
      },
    },
    {
      element: ".net-call-premium-driver",
      popover: {
        title: "Net Call Premium",
        description: `Net call premium is defined as (call premium ask side) − (call premium bid side). It shows the flow of capital into call options, helping identify whether big whales are aggressively buying calls. A high positive value suggests bullish sentiment and potential institutional interest.`,
        side: "left",
        align: "start",
      },
    },
    {
      element: ".net-put-premium-driver",
      popover: {
        title: "Net Put Premium",
        description: `Net put premium is defined as (put premium ask side) − (put premium bid side). It highlights the capital flow into put options, revealing whether big whales are positioning for downside. A high positive value signals strong bearish sentiment or hedging activity.`,
        side: "right",
        align: "start",
      },
    },
    {
      element: ".chart-driver",
      popover: {
        title: "S&P500 Flow Chart",
        description: `This chart displays the price movement (white line) alongside net call premium (green line) and net put premium (red line) throughout the trading day from 9 AM to 4 PM. to get realtime updates about market sentiment.`,
        side: "bottom",
        align: "start",
      },
    },
    {
      element: ".net-premium-driver",
      popover: {
        title: "Top Tickers by Net Premium",
        description: `This table highlights stocks with the strongest bullish options flow, where traders are aggressively buying calls or selling puts. A high positive net premium often signals institutional positioning or speculation on upside moves over the coming days, weeks, or months.`,
        side: "bottom",
        align: "start",
      },
    },
    {
      popover: {
        title: "You’re All Set!",
        description:
          "You’ve now seen how market flow, including volume, premium, and directional bias, can reveal where the money is moving. Use these insights to spot momentum shifts, follow smart money, and sharpen your trading decisions. Happy trading!",
        side: "center",
        align: "center",
      },
    },
  ];
  $: {
    if ($mode) {
      config = marketTideData ? plotData() : null;
    }
  }
</script>

<SEO
  title="Live Market Flow - Real-Time S&P 500 Options Sentiment"
  description="Get real-time insights on S&P 500 market flow sentiment through options premium analysis. Track trends and make informed trading decisions."
/>

<section class="w-full overflow-hidden text-muted dark:text-white">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="w-full m-auto">
            {#if config !== null}
              <div class="mt-4">
                <Infobox
                  text={`Market Flow evaluates the balance between advancing and
                declining stocks by analyzing S&P500 price movements, net call
                premiums and net put premiums, providing a real-time snapshot of
                market sentiment and momentum.`}
                />
              </div>

              <div class="mt-5 mb-3 flex flex-row items-center justify-between">
                <div class="text-xs sm:text-sm italic">
                  Last Updated: {formatDate(
                    findLastNonNull(marketTideData, "time"),
                  )}
                </div>
                <Tutorial {steps} />
              </div>

              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
              >
                <div
                  class="net-volume-driver shadow-md bg-gray-100 dark:bg-gray-800/30 rounded-lg p-4"
                >
                  <div
                    class="dark:text-[#c3c6d0] text-sm mb-2 flex items-center"
                  >
                    <span>Net Volume</span>
                  </div>
                  <div class="flex items-baseline">
                    {#if data?.user?.tier === "Pro"}
                      <span class="text-xl font-bold">
                        {abbreviateNumber(
                          findLastNonNull(marketTideData, "net_volume"),
                        )}</span
                      >
                    {:else}
                      <a href="/pricing" class="flex mt-2">
                        <svg
                          class="size-5 text-muted dark:text-[#fff]"
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
                    {/if}
                  </div>
                </div>

                <div
                  class="net-call-premium-driver shadow-md bg-gray-100 dark:bg-gray-800/30 rounded-lg p-4"
                >
                  <div
                    class="dark:text-[#c3c6d0] text-sm mb-2 flex items-center"
                  >
                    <span>Net Call Prem</span>
                  </div>
                  <div class="flex items-baseline">
                    {#if data?.user?.tier === "Pro"}
                      <span class="text-xl font-bold">
                        {abbreviateNumber(
                          findLastNonNull(marketTideData, "net_call_premium"),
                        )}</span
                      >
                    {:else}
                      <a href="/pricing" class="flex mt-2">
                        <svg
                          class="size-5 text-muted dark:text-[#fff]"
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
                    {/if}
                  </div>
                </div>

                <div
                  class="net-put-premium-driver shadow-md bg-gray-100 dark:bg-gray-800/30 rounded-lg p-4"
                >
                  <div
                    class="dark:text-[#c3c6d0] text-sm mb-2 flex items-center"
                  >
                    <span>Net Put Prem</span>
                  </div>
                  <div class="flex items-baseline">
                    {#if data?.user?.tier === "Pro"}
                      <span class="text-xl font-bold">
                        {abbreviateNumber(
                          findLastNonNull(marketTideData, "net_put_premium"),
                        )}</span
                      >
                    {:else}
                      <a href="/pricing" class="flex mt-2">
                        <svg
                          class="size-5 text-muted dark:text-[#fff]"
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
                    {/if}
                  </div>
                </div>
              </div>

              <div class="grow chart-driver">
                <div class="relative">
                  <!-- Apply the blur class to the chart -->
                  <div
                    class="{!['Pro']?.includes(data?.user?.tier)
                      ? 'blur-[3px]'
                      : ''}  border border-gray-300 dark:border-gray-800 rounded"
                    use:highcharts={config}
                  ></div>
                  <!-- Overlay with "Upgrade to Pro" -->
                  {#if !["Pro"]?.includes(data?.user?.tier)}
                    <div
                      class="font-bold text-lg sm:text-xl absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center text-muted dark:text-white"
                    >
                      <a
                        href="/pricing"
                        class="sm:hover:text-blue-700 dark:sm:hover:text-white dark:text-white flex flex-row items-center"
                      >
                        <span>Upgrade to Pro</span>
                        <svg
                          class="ml-1 w-5 h-5 sm:w-6 sm:h-6 inline-block"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          ><path
                            fill="currentColor"
                            d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                          /></svg
                        >
                      </a>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
            <div class="w-full m-auto mt-5">
              <div
                class="flex flex-wrap sm:flex-row items-center sm:justify-between mb-4"
              >
                <div class="flex flex-row items-center">
                  <label
                    for="topPosNetPrem"
                    class="net-premium-driver mr-1 cursor-pointer flex flex-row items-center text-xl font-bold"
                  >
                    Top Tickers by Net Premium
                  </label>
                  <InfoModal
                    title={"Top Tickers by Net Prem"}
                    content={"This list showcases top stocks with a positive net premium, indicating bullish sentiment. Track price movements, analyze options activity, and uncover the stocks leading their sectors with detailed options data."}
                    id={"topPosNetPrem"}
                  />
                </div>
              </div>

              <div
                class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-auto"
              >
                <table
                  class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md w-full border border-gray-300 dark:border-gray-800 m-auto"
                >
                  <thead>
                    <TableHeader
                      columns={topColumns}
                      {sortOrders}
                      sortData={sortPosTickers}
                    />
                  </thead>
                  <tbody>
                    {#each displayPosTickers as item, index}
                      <tr
                        class="dark:sm:hover:bg-[#245073]/10 odd:bg-[#F6F7F8] dark:odd:bg-odd {index +
                          1 ===
                          originalPosTickers?.length &&
                        !['Pro']?.includes(data?.user?.tier)
                          ? 'opacity-[0.1]'
                          : ''}"
                      >
                        <td
                          class="text-start text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.rank}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                        >
                          <HoverStockChart symbol={item?.symbol} />
                        </td>

                        <td
                          class="text-start text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.name?.length > 20
                            ? item?.name?.slice(0, 20) + "..."
                            : item?.name}
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap"
                        >
                          {item?.price}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] {item?.changesPercentage >=
                          0
                            ? "text-green-800 dark:text-[#00FC50] before:content-['+'] "
                            : 'text-red-800 dark:text-[#FF2F1F]'} text-end"
                        >
                          {item?.changesPercentage?.toFixed(2)}%
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end">
                          {@html abbreviateNumber(item?.net_premium)}
                        </td>
                        <td class="text-sm sm:text-[1rem] text-end">
                          {@html abbreviateNumber(item?.net_call_premium)}
                        </td>
                        <td class="text-sm sm:text-[1rem] text-end">
                          {@html abbreviateNumber(item?.net_put_premium)}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end">
                          {item?.iv_rank}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
            <UpgradeToPro {data} display={true} />
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
