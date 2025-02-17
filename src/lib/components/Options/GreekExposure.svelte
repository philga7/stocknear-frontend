<script lang="ts">
  import {
    abbreviateNumberWithColor,
    abbreviateNumber,
    monthNames,
  } from "$lib/utils";
  import { screenWidth } from "$lib/store";
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
  export let title;

  let rawData = data?.getData || [];

  rawData = rawData?.map((item) => {
    if (title === "Gamma") {
      return {
        ...item,
        putCallRatio:
          item?.call_gex > 0
            ? Math.abs((item?.put_gex || 0) / item?.call_gex)
            : null,
      };
    } else {
      return {
        ...item,
        putCallRatio:
          item?.call_dex > 0
            ? Math.abs((item?.put_dex || 0) / item?.call_dex)
            : null,
      };
    }
  });

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
    const dataList = filteredData?.map((item) =>
      title === "Gamma" ? item.netGex : item.netDex,
    );
    const priceList = filteredData?.map((item) => item.price);

    return { dateList, dataList, priceList };
  }

  function plotData() {
    const history = data?.getData?.sort(
      (a, b) => new Date(a?.date) - new Date(b?.date),
    );
    const { dateList, dataList, priceList } = filterDataByPeriod(
      history,
      timePeriod,
    );
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
        left: $screenWidth < 640 ? "5%" : "0%",
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
          name: title,
          type: "bar",
          data: dataList,
          itemStyle: {
            color: "#9B5DC4",
          },
        },
      ],
    };
    return options;
  }

  function formatDate(dateStr) {
    // Convert the input date string to a Date object in New York time
    let date = new Date(dateStr + "T00:00:00Z"); // Assume input is in UTC

    // Convert to New York Time Zone
    let options = {
      timeZone: "Europe/Berlin",
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    };

    let formatter = new Intl.DateTimeFormat("en-US", options);

    return formatter.format(date);
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

  $: columns =
    title === "Gamma"
      ? [
          { key: "date", label: "Date", align: "left" },
          { key: "call_gex", label: "Call GEX", align: "right" },
          { key: "put_gex", label: "Put GEX", align: "right" },
          { key: "netGex", label: "Net GEX", align: "right" },
          { key: "putCallRatio", label: "P/C GEX", align: "right" },
        ]
      : [
          { key: "date", label: "Date", align: "left" },
          { key: "call_dex", label: "Call Delta", align: "right" },
          { key: "put_dex", label: "Put Delta", align: "right" },
          { key: "netDex", label: "Net Delta", align: "right" },
          { key: "putCallRatio", label: "P/C Delta", align: "right" },
        ];

  $: sortOrders =
    title === "Gamma"
      ? {
          date: { order: "none", type: "date" },
          call_gex: { order: "none", type: "number" },
          put_gex: { order: "none", type: "number" },
          netGex: { order: "none", type: "number" },
          putCallRatio: { order: "none", type: "number" },
        }
      : {
          date: { order: "none", type: "date" },
          call_dex: { order: "none", type: "number" },
          put_dex: { order: "none", type: "number" },
          netDex: { order: "none", type: "number" },
          putCallRatio: { order: "none", type: "number" },
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
    let originalData = rawData;
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
    Daily {title} Exposure
  </h2>

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
            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {@html abbreviateNumberWithColor(
                title === "Gamma" ? item?.call_gex : item?.call_dex,
                false,
                true,
              )}
            </td>
            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {@html abbreviateNumberWithColor(
                title === "Gamma" ? item?.put_gex : item?.put_dex,
                false,
                true,
              )}
            </td>

            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {@html abbreviateNumberWithColor(
                title === "Gamma" ? item?.netGex : item?.netDex,
                false,
                true,
              )}
            </td>

            <td
              class="text-white text-sm sm:text-[1rem] text-end whitespace-nowrap"
            >
              {#if item?.putCallRatio <= 1 && item?.putCallRatio !== null}
                <span class="text-[#00FC50]"
                  >{item?.putCallRatio?.toFixed(2)}</span
                >
              {:else if item?.putCallRatio >= 0 && item?.putCallRatio !== null}
                <span class="text-[#FF2F1F]"
                  >{item?.putCallRatio?.toFixed(2)}</span
                >
              {:else}
                n/a
              {/if}
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
