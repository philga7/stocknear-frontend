<script lang="ts">
  import {
    abbreviateNumberWithColor,
    abbreviateNumber,
    monthNames,
  } from "$lib/utils";
  import { screenWidth, displayCompanyName } from "$lib/store";
  import { onMount } from "svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";
  import { Chart } from "svelte-echarts";

  import { init, use } from "echarts/core";
  import { LineChart, BarChart } from "echarts/charts";
  import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
  } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";

  use([
    LineChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer,
  ]);

  export let data;

  let rawData = data?.getData || [];
  rawData = rawData?.map((item) => ({
    ...item,
    volatilitySpread:
      item?.rv !== null ? (item?.iv - item?.rv)?.toFixed(2) : null,
  }));

  const avgIV =
    rawData?.reduce((acc, entry) => acc + entry.iv, 0) / rawData?.length;
  const avgRV =
    rawData?.reduce((acc, entry) => acc + entry.rv, 0) / rawData?.length;

  let displayList = rawData?.slice(0, 150);
  let timePeriod = "3M";

  let options = null;

  function filterDataByPeriod(historicalData, period = "3M") {
    const currentDate = new Date();
    let startDate = new Date();

    // Calculate the start date based on the period input
    switch (period) {
      case "3M":
        startDate.setMonth(currentDate.getMonth() - 3);
        break;
      case "6M":
        startDate.setMonth(currentDate.getMonth() - 6);
        break;
      case "1Y":
        startDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        throw new Error(`Unsupported period: ${period}`);
    }

    // Filter the data based on the calculated start date
    let filteredData = historicalData?.filter((item) => {
      if (!item?.date) return false;
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= currentDate;
    });

    filteredData?.forEach((entry) => {
      const matchingData = data?.getHistoricalPrice?.find(
        (d) => d?.time === entry?.date,
      );
      if (matchingData) {
        entry.price = matchingData?.close;
      }
    });

    // Extract the dates and gamma values from the filtered data
    const dateList = filteredData?.map((item) => item.date);
    const impliedVolatility = filteredData?.map((item) => item?.iv);
    const realizedVolatility = filteredData?.map((item) => item?.rv);

    const volatilitySpread = filteredData?.map(
      (item) => item?.volatilitySpread,
    );
    const priceList = filteredData?.map((item) => item.price);

    return {
      dateList,
      impliedVolatility,
      realizedVolatility,
      volatilitySpread,
      priceList,
    };
  }

  function plotData() {
    const data = rawData?.sort((a, b) => new Date(a?.date) - new Date(b?.date));
    const {
      dateList,
      impliedVolatility,
      realizedVolatility,
      volatilitySpread,
      priceList,
    } = filterDataByPeriod(data, timePeriod);
    const options = {
      animation: false,
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
          // Get the timestamp from the first parameter
          const timestamp = params[0].axisValue;

          // Initialize result with timestamp
          let result = timestamp + "<br/>";

          // Add each series data
          params?.forEach((param) => {
            const marker =
              '<span style="display:inline-block;margin-right:4px;' +
              "border-radius:10px;width:10px;height:10px;background-color:" +
              param.color +
              '"></span>';
            result +=
              marker +
              param.seriesName +
              ": " +
              abbreviateNumber(param.value) +
              "<br/>";
          });

          return result;
        },
        axisPointer: {
          lineStyle: {
            color: "#fff",
          },
        },
      },
      silent: true,
      grid: {
        left: $screenWidth < 640 ? "5%" : "4%",
        right: $screenWidth < 640 ? "5%" : "0%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: dateList,
          axisLabel: {
            color: "#fff",

            formatter: function (value) {
              // Assuming dates are in the format 'yyyy-mm-dd'
              const dateParts = value.split("-");
              const monthIndex = parseInt(dateParts[1]) - 1; // Months are zero-indexed in JavaScript Date objects
              const year = parseInt(dateParts[0]);
              const day = parseInt(dateParts[2]);
              return `${day} ${monthNames[monthIndex]} ${year}`;
            },
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
        {
          type: "value",
          splitLine: {
            show: false, // Disable x-axis grid lines
          },
          position: "right",
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
      ],
      series: [
        {
          name: "Price",
          type: "line",
          data: priceList,
          yAxisIndex: 1,
          lineStyle: { width: 2 },
          itemStyle: {
            color: "#fff",
          },
          smooth: true,
          showSymbol: false,
        },
        {
          name: "Implied Volatility",
          type: "line",
          lineStyle: { width: 2 },
          data: impliedVolatility,
          itemStyle: {
            color: "#FAD776",
          },
          smooth: true,
          showSymbol: false,
        },
        {
          name: "Realized Volatility",
          type: "line",
          lineStyle: { width: 2 },
          data: realizedVolatility,
          itemStyle: {
            color: "#007BFF",
          },
          smooth: true,
          showSymbol: false,
        },
        {
          name: "Vol. Spread",
          type: "bar",
          lineStyle: { width: 2 },
          data: volatilitySpread,
          itemStyle: {
            color: "#9B5DC4",
          },
          smooth: true,
          showSymbol: false,
        },
      ],
    };
    return options;
  }

  function formatDate(dateStr) {
    // Parse the input date string (YYYY-mm-dd)
    var date = new Date(dateStr);

    // Get month, day, and year
    var month = date.getMonth() + 1; // Month starts from 0
    var day = date.getDate();
    var year = date.getFullYear();

    // Extract the last two digits of the year
    var shortYear = year.toString().slice(-2);

    // Add leading zeros if necessary
    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;

    var formattedDate = month + "/" + day + "/" + year;

    return formattedDate;
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;

    if (isBottom && displayList?.length !== rawData?.length) {
      const nextIndex = displayList?.length;
      const filteredNewResults = rawData?.slice(nextIndex, nextIndex + 50);
      displayList = [...displayList, ...filteredNewResults];
    }
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: columns = [
    { key: "date", label: "Date", align: "left" },
    {
      key: "changesPercentage",
      label: "% Change",
      align: "right",
    },
    {
      key: "putCallRatio",
      label: "P/C",
      align: "right",
    },
    {
      key: "total_open_interest",
      label: "Total OI",
      align: "right",
    },
    {
      key: "changesPercentageOI",
      label: "% OI Change",
      align: "right",
    },
    {
      key: "iv",
      label: "Implied Volatility",
      align: "right",
    },
    {
      key: "rv",
      label: "Realized Vol.",
      align: "right",
    },
    { key: "volatilitySpread", label: "Vol. Spread", align: "right" },
  ];

  $: sortOrders = {
    date: { order: "none", type: "date" },
    changesPercentage: { order: "none", type: "number" },
    putCallRatio: { order: "none", type: "number" },
    iv: { order: "none", type: "number" },
    rv: { order: "none", type: "number" },
    volatilitySpread: { order: "none", type: "number" },
    total_open_interest: { order: "none", type: "number" },
    changesPercentageOI: { order: "none", type: "number" },
  };

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];
    let originalData = rawData?.sort(
      (a, b) => new Date(b?.date) - new Date(a?.date),
    );
    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      originalData = [...rawData]; // Reset originalData to rawDataVolume
      displayList = originalData;
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
    displayList = [...originalData].sort(compareValues);
  };

  $: {
    if (typeof window !== "undefined" && timePeriod) {
      options = plotData();
    }
  }
</script>

<div class="sm:pl-7 sm:pb-7 sm:pt-7 w-full m-auto mt-2 sm:mt-0">
  <h2
    class=" flex flex-row items-center text-white text-xl sm:text-2xl font-bold w-fit"
  >
    Volatility Exposure
  </h2>
  <div class="w-full mt-2">
    {$displayCompanyName} has experienced an average implied volatility of {avgIV?.toFixed(
      2,
    )} and an average realized volatility of {avgRV?.toFixed(2)}.
  </div>

  <div class="w-full overflow-hidden m-auto mt-5">
    {#if options !== null}
      <div class="app w-full relative">
        <div class="flex justify-start space-x-2 absolute right-0 top-0 z-10">
          {#each ["3M", "6M", "1Y"] as item, index}
            {#if data?.user?.tier === "Pro" || index === 0}
              <label
                on:click={() => (timePeriod = item)}
                class="px-3 py-1 text-sm {timePeriod === item
                  ? 'bg-white text-black '
                  : 'text-white bg-table text-opacity-[0.6]'} transition ease-out duration-100 sm:hover:bg-white sm:hover:text-black rounded-md cursor-pointer"
              >
                {item}
              </label>
            {:else if data?.user?.tier !== "Pro"}
              <a
                href="/pricing"
                class="px-3 py-1 text-sm flex flex-row items-center {timePeriod ===
                item
                  ? 'bg-white text-black '
                  : 'text-white bg-table text-opacity-[0.6]'} transition ease-out duration-100 sm:hover:bg-white sm:hover:text-black rounded-md cursor-pointer"
              >
                {item}
                <svg
                  class="ml-1 -mt-w-3.5 h-3.5 inline-block"
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

        <Chart {init} {options} class="chart" />
      </div>
    {:else}
      <div class="flex justify-center items-center h-80">
        <div class="relative">
          <label
            class="bg-primary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <span
              class="loading loading-spinner loading-md sm:loading-[1rem] text-gray-400"
            ></span>
          </label>
        </div>
      </div>
    {/if}
  </div>
  <div class="w-full overflow-x-scroll text-white">
    <table
      class="w-full table table-sm table-compact bg-table border border-gray-800 rounded-none sm:rounded-md m-auto overflow-x-auto"
    >
      <thead>
        <TableHeader {columns} {sortOrders} {sortData} />
      </thead>
      <tbody>
        {#each data?.user?.tier === "Pro" ? displayList : displayList?.slice(0, 3) as item, index}
          <tr
            class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] odd:bg-odd border-b border-gray-800 {index +
              1 ===
              displayList?.slice(0, 3)?.length && data?.user?.tier !== 'Pro'
              ? 'opacity-[0.1]'
              : ''}"
          >
            <td
              class="text-white text-sm sm:text-[1rem] text-start whitespace-nowrap"
            >
              {formatDate(item?.date)}
            </td>

            <td class="text-white text-sm sm:text-[1rem] text-end">
              {#if item?.changesPercentage >= 0 && item?.changesPercentage !== null}
                <span class="text-[#00FC50]"
                  >+{item?.changesPercentage >= 1000
                    ? abbreviateNumberWithColor(item?.changesPercentage)
                    : item?.changesPercentage?.toFixed(2)}%</span
                >
              {:else if item?.changesPercentage < 0 && item?.changesPercentage !== null}
                <span class="text-[#FF2F1F]"
                  >{item?.changesPercentage <= -1000
                    ? abbreviateNumberWithColor(item?.changesPercentage)
                    : item?.changesPercentage?.toFixed(2)}%
                </span>
              {:else}
                n/a
              {/if}
            </td>

            <td class="text-sm sm:text-[1rem] text-end text-white">
              {item?.putCallRatio}
            </td>

            <td class="text-sm sm:text-[1rem] text-end text-white">
              {@html abbreviateNumberWithColor(
                item?.total_open_interest,
                false,
                true,
              )}
            </td>

            <td class="text-white text-sm sm:text-[1rem] text-end">
              {#if item?.changesPercentageOI >= 0 && item?.changesPercentageOI !== null}
                <span class="text-[#00FC50]"
                  >+{item?.changesPercentageOI >= 1000
                    ? abbreviateNumberWithColor(item?.changesPercentageOI)
                    : item?.changesPercentageOI?.toFixed(2)}%</span
                >
              {:else if item?.changesPercentageOI < 0 && item?.changesPercentageOI !== null}
                <span class="text-[#FF2F1F]"
                  >{item?.changesPercentageOI <= -1000
                    ? abbreviateNumberWithColor(item?.changesPercentageOI)
                    : item?.changesPercentageOI?.toFixed(2)}%
                </span>
              {:else}
                <span class="text-white"> n/a </span>
              {/if}
            </td>

            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {item?.iv}
            </td>
            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {item?.rv ?? "n/a"}
            </td>

            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {item?.volatilitySpread ?? "n/a"}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <UpgradeToPro {data} />
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
