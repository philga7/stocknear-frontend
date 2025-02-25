<script lang="ts">
  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import { abbreviateNumberWithColor } from "$lib/utils";
  import InfoModal from "$lib/components/InfoModal.svelte";

  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";

  import SEO from "$lib/components/SEO.svelte";
  import highcharts from "$lib/highcharts.ts";

  export let data;
  let isLoading = false;
  let config = null;
  //let sectorData = data?.getData?.sectorData || [];
  let topPosNetPremium = data?.getData?.topPosNetPremium || [];
  let topNegNetPremium = data?.getData?.topNegNetPremium || {};

  let marketTideData = data?.getData?.marketTide || {};
  let originalPosTickers = topPosNetPremium;
  let displayPosTickers = topPosNetPremium;

  let originalNegTickers = topNegNetPremium;
  let displayNegTickers = topNegNetPremium;

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

  const sortNegTickers = (key) => {
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
      originalNegTickers = [...topNegNetPremium];
      displayNegTickers = originalNegTickers?.slice(0, 50);
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
    displayNegTickers = [...originalNegTickers]
      .sort(compareValues)
      ?.slice(0, 50);
  };
  function getPlotOptions() {
    isLoading = true;

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
        backgroundColor: "#09090B",
        plotBackgroundColor: "#09090B",
        height: 360, // Set the maximum height for the chart
        width: 970,
        animation: false,
      },

      title: {
        text: null,
      },

      legend: {
        enabled: false,
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
          // Format the x value to display time in hh:mm format
          let tooltipContent = `<span class="m-auto text-white text-[1rem] font-[501]">${new Date(
            this.x,
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}</span><br>`;

          // Loop through each point in the shared tooltip
          this.points.forEach((point) => {
            tooltipContent += `<span class="text-white font-semibold text-sm">${point.series.name}:</span> 
          <span class="text-white font-normal text-sm" style="color:${point.color}">${abbreviateNumberWithColor(
            point.y,
          )}</span><br>`;
          });

          return tooltipContent;
        },
      },

      xAxis: {
        type: "datetime",
        min: startTime, // Force start at 9:30
        max: endTime, // Force end at 16:10
        crosshair: {
          color: "#fff", // Set the color of the crosshair line
          width: 1, // Adjust the line width as needed
          dashStyle: "Solid",
        },
        labels: {
          style: {
            color: "#fff",
          },
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
          gridLineColor: "#111827",
          labels: {
            style: { color: "white" },
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
          color: "#fff",
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
          color: "#90EE90",
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
          color: "#FF6B6B",
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
          animation: false,
        },
      },
    };

    isLoading = false;
    return options;
  }

  config = marketTideData ? getPlotOptions() : null;
</script>

<SEO
  title="Live Market Flow - Real-Time S&P 500 Options Sentiment"
  description="Get real-time insights on S&P 500 market flow sentiment through options premium analysis. Track trends and make informed trading decisions."
/>

<section class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="w-full m-auto">
            {#if config !== null}
              <p class="mt-4 text-white">
                Market Flow evaluates the balance between advancing and
                declining stocks by analyzing SP& 500 price movements, net call
                premiums and net put premiums, providing a real-time snapshot of
                market sentiment and momentum. <a
                  href="/learning-center/article/market-sentiment-through-options-activity-riding-the-tide"
                  class="text-blue-400 sm:hover:text-white sm:hover:underline sm:hover:underline-offset-4"
                  >Learn more here.</a
                >
              </p>

              <div class="text-white text-sm italic mt-5 mb-3">
                Last Updated: {formatDate(
                  findLastNonNull(marketTideData, "time"),
                )}
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
                    <span class="text-xl font-bold text-white">
                      {@html abbreviateNumberWithColor(
                        findLastNonNull(marketTideData, "net_volume"),
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
                    <span class="text-xl font-bold text-white"
                      >{@html abbreviateNumberWithColor(
                        findLastNonNull(marketTideData, "net_call_premium"),
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
                    <span class="text-xl font-bold text-white"
                      >{@html abbreviateNumberWithColor(
                        findLastNonNull(marketTideData, "net_put_premium"),
                        false,
                        true,
                      )}</span
                    >
                  </div>
                </div>
              </div>

              <div
                class="chart border border-gray-800 rounded"
                use:highcharts={config}
              ></div>
            {/if}
            <div class="w-full m-auto mt-5">
              <div
                class="flex flex-wrap sm:flex-row items-center sm:justify-between mb-4"
              >
                <div class="flex flex-row items-center">
                  <label
                    for="topPosNetPrem"
                    class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl font-bold"
                  >
                    Top Stocks by Positive Net Prem
                  </label>
                  <InfoModal
                    title={"Top Stocks by Positive Net Prem"}
                    content={"This list showcases top stocks with a positive net premium, indicating bullish sentiment. Track price movements, analyze options activity, and uncover the stocks leading their sectors with detailed options data."}
                    id={"topPosNetPrem"}
                  />
                </div>
              </div>

              <div
                class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-scroll"
              >
                <table
                  class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md text-white w-full bg-table border border-gray-800 m-auto"
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
                        class="sm:hover:bg-[#245073] border-b border-gray-800 sm:hover:bg-opacity-[0.2] odd:bg-odd {index +
                          1 ===
                          originalPosTickers?.length &&
                        data?.user?.tier !== 'Pro'
                          ? 'opacity-[0.1]'
                          : ''}"
                      >
                        <td
                          class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.rank}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                        >
                          <HoverStockChart symbol={item?.symbol} />
                        </td>

                        <td
                          class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.name?.length > 20
                            ? item?.name?.slice(0, 20) + "..."
                            : item?.name}
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.price}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] {item?.changesPercentage >=
                          0
                            ? "text-[#00FC50] before:content-['+'] "
                            : 'text-[#FF2F1F]'} text-end"
                        >
                          {item?.changesPercentage}%
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end">
                          {@html abbreviateNumberWithColor(
                            item?.net_premium,
                            false,
                            true,
                          )}
                        </td>
                        <td class="text-sm sm:text-[1rem] text-end">
                          {@html abbreviateNumberWithColor(
                            item?.net_call_premium,
                            false,
                            true,
                          )}
                        </td>
                        <td class="text-sm sm:text-[1rem] text-end">
                          {@html abbreviateNumberWithColor(
                            item?.net_put_premium,
                            false,
                            true,
                          )}
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end">
                          {item?.iv_rank}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>

              <div class="mb-3 mt-10">
                <div class="flex flex-row items-center">
                  <label
                    for="topNegNetPrem"
                    class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl font-bold"
                  >
                    Top Stocks by Negative Net Prem
                  </label>
                  <InfoModal
                    title={"Top Stocks by Negative Net Prem"}
                    content={"This list showcases top stocks with a negative net premium, indicating bullish sentiment. Track price movements, analyze options activity, and uncover the stocks leading their sectors with detailed options data."}
                    id={"topNegNetPrem"}
                  />
                </div>
              </div>
              <div
                class="w-full m-auto rounded-none sm:rounded-md mb-4 overflow-x-scroll"
              >
                <table
                  class="table table-sm table-compact no-scrollbar rounded-none sm:rounded-md text-white w-full bg-table border border-gray-800 m-auto"
                >
                  <thead>
                    <TableHeader
                      columns={topColumns}
                      {sortOrders}
                      sortData={sortNegTickers}
                    />
                  </thead>
                  <tbody>
                    {#each displayNegTickers as item, index}
                      <tr
                        class="sm:hover:bg-[#245073] border-b border-gray-800 sm:hover:bg-opacity-[0.2] odd:bg-odd {index +
                          1 ===
                          originalNegTickers?.length &&
                        data?.user?.tier !== 'Pro'
                          ? 'opacity-[0.1]'
                          : ''}"
                      >
                        <td
                          class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.rank}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] text-start whitespace-nowrap"
                        >
                          <HoverStockChart symbol={item?.symbol} />
                        </td>

                        <td
                          class="text-start text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.name?.length > 20
                            ? item?.name?.slice(0, 20) + "..."
                            : item?.name}
                        </td>

                        <td
                          class="text-end text-sm sm:text-[1rem] whitespace-nowrap text-white"
                        >
                          {item?.price}
                        </td>

                        <td
                          class="text-sm sm:text-[1rem] {item?.changesPercentage >=
                          0
                            ? "text-[#00FC50] before:content-['+'] "
                            : 'text-[#FF2F1F]'} text-end"
                        >
                          {item?.changesPercentage}%
                        </td>

                        <td class="text-sm sm:text-[1rem] text-end">
                          {@html abbreviateNumberWithColor(
                            item?.net_premium,
                            false,
                            true,
                          )}
                        </td>
                        <td class="text-sm sm:text-[1rem] text-end">
                          {@html abbreviateNumberWithColor(
                            item?.net_call_premium,
                            false,
                            true,
                          )}
                        </td>
                        <td class="text-sm sm:text-[1rem] text-end">
                          {@html abbreviateNumberWithColor(
                            item?.net_put_premium,
                            false,
                            true,
                          )}
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
            <UpgradeToPro {data} />
          </div>
        </main>
      </div>
    </div>
  </div>
</section>
