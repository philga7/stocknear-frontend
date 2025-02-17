<script lang="ts">
  import { screenWidth } from "$lib/store";
  import { goto } from "$app/navigation";

  import HoverStockChart from "$lib/components/HoverStockChart.svelte";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import { abbreviateNumberWithColor, sectorList } from "$lib/utils";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import UpgradeToPro from "$lib/components/UpgradeToPro.svelte";

  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import SEO from "$lib/components/SEO.svelte";

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
  let isLoading = false;
  let optionsData = null;
  let selectedSector = "Technology";
  const sectorDict = {
    "Basic Materials": "XLB",
    "Communication Services": "XLC",
    Energy: "XLE",
    "Financial Services": "XLF",
    Industrials: "XLI",
    Technology: "XLK",
    "Consumer Defensive": "XLP",
    "Real Estate": "XLRE",
    Utilities: "XLU",
    Healthcare: "XLV",
    "Consumer Cyclical": "XLY",
  };

  //let sectorData = data?.getData?.sectorData || [];
  let topPosNetPremium =
    data?.getData?.topPosNetPremium[sectorDict[selectedSector]] || [];
  let topNegNetPremium =
    data?.getData?.topNegNetPremium[sectorDict[selectedSector]] || [];

  let marketTideData =
    data?.getData?.sectorFlow[sectorDict[selectedSector]] || {};
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
    let dates = marketTideData?.map((item) => item?.time);
    const priceList = marketTideData?.map((item) =>
      item?.close !== null ? item?.close?.toFixed(2) : item?.close,
    );
    const netCallPremList = marketTideData?.map(
      (item) => item?.net_call_premium,
    );
    const netPutPremList = marketTideData?.map((item) => item?.net_put_premium);
    const volumeList = marketTideData?.map((item) => item?.net_volume);

    const positiveVolume = volumeList.map((v) => (v >= 0 ? v : "-"));
    const negativeVolume = volumeList.map((v) => (v < 0 ? v : "-"));

    const options = {
      silent: true,
      animation: false,
      legend: {
        data: ["Price", "Vol", "Net Call Premium", "Net Put Premium"],
        textStyle: {
          color: "#fff",
        },
        axisPointer: {
          lineStyle: {
            color: "#fff",
          },
        },
      },

      tooltip: {
        trigger: "axis",
        hideDelay: 100,
        borderColor: "#969696",
        borderWidth: 1,
        backgroundColor: "#313131",
        textStyle: {
          color: "#fff",
        },
        formatter: function (params) {
          const timestamp = params[0].axisValue;
          let result = timestamp + "<br/>";

          // Find volume value and determine color
          const volParams = params.find((p) => p.seriesName.includes("Vol"));
          const volIndex = volParams?.dataIndex ?? 0;
          const volValue = volumeList[volIndex];
          const volColor = volValue >= 0 ? "#90EE90" : "#FF6B6B";

          // Sort and filter params
          const filteredParams = params
            .filter(
              (p) =>
                !p.seriesName.includes("Vol") ||
                p.seriesName === "Positive Vol",
            )
            .map((p) => {
              if (p.seriesName.includes("Vol")) {
                return {
                  ...p,
                  seriesName: "Vol",
                  value: volValue,
                  color: volColor,
                };
              }
              return p;
            })
            .sort((a, b) => {
              if (a.seriesName === "Vol") return 1;
              if (b.seriesName === "Vol") return -1;
              return 0;
            });

          filteredParams.forEach((param) => {
            const marker =
              '<span style="display:inline-block;margin-right:4px;' +
              "border-radius:10px;width:10px;height:10px;background-color:" +
              param.color +
              '"></span>';
            result +=
              marker +
              param.seriesName +
              ": " +
              abbreviateNumberWithColor(param.value, false, true) +
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
      axisPointer: {
        link: [{ xAxisIndex: [0, 1] }],
      },
      grid: [
        {
          left: "3%",
          right: "3%",
          top: $screenWidth < 640 ? "15%" : "5%",
          height: "60%",
          containLabel: true,
        },
        {
          left: "3%",
          right: "3%",
          bottom: "5%",
          height: "20%",
          containLabel: true,
        },
      ],

      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: dates,
          axisLabel: {
            color: "#fff",
            formatter: (value, index) => {
              const [datePart, timePart] = value.split(" ");
              let [hours, minutes] = timePart.split(":").map(Number);

              // Only show labels at 30-minute intervals (XX:00 and XX:30)
              if (minutes % 30 === 0) {
                const amPm = hours >= 12 ? "PM" : "AM";
                hours = hours % 12 || 12;
                return minutes === 0
                  ? `${hours} ${amPm}`
                  : `${hours}:30 ${amPm}`;
              }
              return "";
            },
            interval: 30,
          },
        },

        {
          type: "category",
          gridIndex: 1,
          data: dates,
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          gridIndex: 0,
          position: "left",
          splitLine: {
            show: false,
          },
          axisLabel: {
            color: "#fff",
            show: true,
          },
          scale: true,
          min: (value) => Math.floor(value.min * 0.999),
          max: (value) => Math.ceil(value.max * 1.001),
        },
        {
          type: "value",
          gridIndex: 0,
          position: "right",
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
        {
          type: "value",
          gridIndex: 1,
          position: "right",
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "Price",
          type: "line",
          data: priceList,
          yAxisIndex: 0,
          xAxisIndex: 0,
          showSymbol: false,
          lineStyle: { color: "#fff" },
          itemStyle: { color: "#fff" },
          smooth: true,
        },
        {
          name: "Net Call Premium",
          type: "line",
          data: netCallPremList,
          yAxisIndex: 1,
          xAxisIndex: 0,
          showSymbol: false,
          lineStyle: { color: "#90EE90" },
          itemStyle: { color: "#90EE90" },
          smooth: true,
        },
        {
          name: "Net Put Premium",
          type: "line",
          data: netPutPremList,
          yAxisIndex: 1,
          xAxisIndex: 0,
          showSymbol: false,
          lineStyle: { color: "#FF6B6B" },
          itemStyle: { color: "#FF6B6B" },
          smooth: true,
        },
        {
          name: "Positive Vol",
          type: "line",
          data: positiveVolume,
          xAxisIndex: 1,
          yAxisIndex: 2,
          showSymbol: false,
          areaStyle: {
            opacity: 1,
            color: "#19AA75",
          },
          itemStyle: { color: "#19AA75" },
        },
        {
          name: "Negative Vol",
          type: "line",
          data: negativeVolume,
          xAxisIndex: 1,
          yAxisIndex: 2,
          showSymbol: false,
          areaStyle: {
            opacity: 1,
            color: "#F71F4F",
          },
          itemStyle: { color: "#F71F4F" },
        },
      ],
    };
    isLoading = false;
    return options;
  }
  optionsData = marketTideData ? getPlotOptions() : null;

  $: {
    if (selectedSector) {
      topPosNetPremium =
        data?.getData?.topPosNetPremium[sectorDict[selectedSector]] || [];
      topNegNetPremium =
        data?.getData?.topNegNetPremium[sectorDict[selectedSector]] || [];

      marketTideData =
        data?.getData?.sectorFlow[sectorDict[selectedSector]] || {};
      originalPosTickers = topPosNetPremium;
      displayPosTickers = topPosNetPremium;

      originalNegTickers = topNegNetPremium;
      displayNegTickers = topNegNetPremium;
      optionsData = marketTideData ? getPlotOptions() : null;
    }
  }
</script>

<SEO
  title="Live Sector Flow - Real-Time Sector Options Sentiment"
  description="Get real-time insights on all sectors of the stock market flow sentiment through options premium analysis. Track trends and make informed trading decisions."
/>

<section class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden">
  <div class="w-full overflow-hidden m-auto">
    <div class="sm:p-0 flex justify-center w-full m-auto overflow-hidden">
      <div
        class="relative flex justify-center items-start overflow-hidden w-full"
      >
        <main class="w-full">
          <div class="w-full m-auto">
            {#if optionsData !== null}
              <p class="mt-4 text-white">
                <strong>{selectedSector}</strong> Flow tracks sector stocks, net
                call/put premiums, and price movements to gauge market sentiment
                and momentum in real time.
              </p>

              <div
                class="flex flex-row items-center w-fit ml-auto mt-2 sm:mt-0"
              >
                <div class="relative inline-block text-left grow">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                      <Button
                        builders={[builder]}
                        class="w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                      >
                        <span class="truncate text-white">{selectedSector}</span
                        >
                        <svg
                          class="-mr-1 ml-1 h-5 w-5 xs:ml-2 inline-block"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          style="max-width:40px"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                      class="w-56 h-fit max-h-72 overflow-y-auto scroller"
                    >
                      <DropdownMenu.Label class="text-gray-400">
                        Select Sector
                      </DropdownMenu.Label>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Group>
                        {#each sectorList as sector}
                          {#if sector === "Technology" || data?.user?.tier === "Pro"}
                            <DropdownMenu.Item
                              on:click={() => (selectedSector = sector)}
                              class="cursor-pointer hover:bg-primary"
                            >
                              {sector}
                            </DropdownMenu.Item>
                          {:else}
                            <DropdownMenu.Item
                              on:click={() => goto("/pricing")}
                              class="cursor-pointer hover:bg-primary"
                            >
                              {sector}
                              <svg
                                class="ml-1 size-4"
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
                            </DropdownMenu.Item>
                          {/if}
                        {/each}
                      </DropdownMenu.Group>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </div>

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
                    <span class="text-2xl font-bold text-white">
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
                    <span class="text-2xl font-bold text-white"
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
                    <span class="text-2xl font-bold text-white"
                      >{@html abbreviateNumberWithColor(
                        findLastNonNull(marketTideData, "net_put_premium"),
                        false,
                        true,
                      )}</span
                    >
                  </div>
                </div>
              </div>

              <div class="pb-8 sm:pb-2 rounded border border-gray-600">
                <div class="app w-full h-[300px] mt-5">
                  {#if isLoading}
                    <div class="flex justify-center items-center h-80">
                      <div class="relative">
                        <label
                          class="bg-secondary z-10 rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        >
                          <span
                            class="loading loading-spinner loading-md text-white"
                          ></span>
                        </label>
                      </div>
                    </div>
                  {:else}
                    <Chart {init} options={optionsData} class="chart" />
                  {/if}
                </div>
              </div>
            {/if}
            <div class="w-full m-auto mt-10">
              <div
                class="flex flex-wrap sm:flex-row items-center sm:justify-between mb-4"
              >
                <div class="flex flex-row items-center">
                  <label
                    for="topPosNetPrem"
                    class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold"
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
                    class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-2xl font-bold"
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

<style>
  .app {
    height: 600px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 510px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
