<script lang="ts">
  import highcharts from "$lib/highcharts.ts";
  import { mode } from "mode-watcher";

  import {
    getCache,
    setCache,
    globalForm,
    realtimePrice,
    priceIncrease,
    wsBidPrice,
    wsAskPrice,
    currentPortfolioPrice,
    stockTicker,
    shouldUpdatePriceChart,
    screenWidth,
  } from "$lib/store";
  import { onDestroy } from "svelte";
  import WIIM from "$lib/components/WIIM.svelte";
  import SEO from "$lib/components/SEO.svelte";

  import News from "$lib/components/News.svelte";
  import NextEarnings from "$lib/components/NextEarnings.svelte";
  import EarningsSurprise from "$lib/components/EarningsSurprise.svelte";
  import Sidecard from "$lib/components/Sidecard.svelte";

  import { convertTimestamp, abbreviateNumber } from "$lib/utils";

  export let data;
  export let form;

  let stockDeck = data?.getStockDeck;

  $: previousClose = data?.getStockQuote?.previousClose;
  //============================================//
  const intervals = ["1D", "1W", "1M", "6M", "1Y", "MAX"];

  let config = null;
  let output = null;
  let displayData = "1D";
  let lastValue;

  function plotData(priceData) {
    const rawData = priceData || [];

    const change = (rawData?.at(-1)?.close / rawData?.at(0)?.close - 1) * 100;

    const priceList = rawData?.map((item) => item?.close);
    const dateList = rawData?.map((item) =>
      Date.UTC(
        new Date(item?.time).getUTCFullYear(),
        new Date(item?.time).getUTCMonth(),
        new Date(item?.time).getUTCDate(),
        new Date(item?.time).getUTCHours(),
        new Date(item?.time).getUTCMinutes(),
      ),
    );

    const seriesData = rawData?.map((item) => [
      Date.UTC(
        new Date(item?.time).getUTCFullYear(),
        new Date(item?.time).getUTCMonth(),
        new Date(item?.time).getUTCDate(),
        new Date(item?.time).getUTCHours(),
        new Date(item?.time).getUTCMinutes(),
        new Date(item?.time).getUTCSeconds(),
      ),
      item?.close,
    ]);

    // Find the lowest & highest close values
    let minValue = Math?.min(...rawData?.map((item) => item?.close));
    let maxValue = Math?.max(...rawData?.map((item) => item?.close));

    if (minValue - 0 < 1 && displayData === "1D") {
      //don't delete this sometimes 1D can't find minValue
      minValue = data?.getStockQuote?.dayLow;
    }

    let padding = 0.015;
    let yMin = minValue * (1 - padding) === 0 ? null : minValue * (1 - padding);
    let yMax = maxValue * (1 + padding) === 0 ? null : maxValue * (1 + padding);

    const isNegative =
      displayData === "1D"
        ? data?.getStockQuote?.changesPercentage < 0
        : change < 0;

    const lineColor = isNegative
      ? "#CC261A"
      : $mode === "light"
        ? "#047857"
        : "#00FC50";
    const fillColorStart = isNegative
      ? "rgba(204, 38, 26, 0.3)"
      : "rgb(4, 120, 87, 0.3)"; //"rgba(0, 252, 80, 0.3)";
    const fillColorEnd = isNegative
      ? "rgba(204, 38, 26, 0.004)"
      : "rgb(4, 120, 87, 0.004)"; //"rgba(0, 252, 80, 0.004)";

    const baseDate =
      rawData && rawData?.length ? new Date(rawData?.at(0)?.time) : new Date();

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
      0,
    ).getTime();

    const options = {
      chart: {
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 360,
        animation: false,
        events: {
          // Add touch event handling to hide tooltip on mobile
          load: function () {
            const chart = this;
            let isTouching = false;

            // Track touch start
            chart.container.addEventListener("touchstart", () => {
              isTouching = true;
            });

            // Track touch end
            chart.container.addEventListener("touchend", () => {
              isTouching = false;
              chart.tooltip.hide();
            });

            // Track touch cancel
            chart.container.addEventListener("touchcancel", () => {
              isTouching = false;
              chart.tooltip.hide();
            });
          },
        },
      },
      credits: { enabled: false },
      title: { text: null },
      tooltip: {
        shared: true,
        useHTML: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent black
        borderColor: "rgba(255, 255, 255, 0.2)", // Slightly visible white border
        borderWidth: 1,
        style: {
          color: $mode === "light" ? "black" : "white",
          fontSize: "16px",
          padding: "10px",
        },
        borderRadius: 4,
        formatter: function () {
          const date = new Date(this?.x);
          let formattedDate;
          if (displayData === "1D") {
            formattedDate = date?.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });
          } else if (["1W", "1M"].includes(displayData)) {
            formattedDate = date?.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            });
          } else {
            formattedDate = date?.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            });
          }

          let tooltipContent = "";

          // Loop through each point in the shared tooltip
          this.points?.forEach((point) => {
            tooltipContent += `<span class="text-white text-[1rem] font-[501]">${point.series.name}: ${point.y}</span><br>`;
          });

          // Append the formatted date at the end
          tooltipContent += `<span class="text-white m-auto text-black text-sm font-normal">${formattedDate}</span><br>`;

          return tooltipContent;
        },
      },

      xAxis: {
        type: "datetime",
        min: displayData === "1D" ? startTime : null,
        max: displayData === "1D" ? endTime : null,
        tickLength: 0,
        categories: displayData === "1D" ? null : dateList,
        crosshair: {
          color: $mode === "light" ? "black" : "white",
          width: 1,
          dashStyle: "Solid",
        },
        labels: {
          style: { color: $mode === "light" ? "black" : "white" },
          distance: 20,
          formatter: function () {
            const date = new Date(this?.value);
            if (displayData === "1D") {
              return date?.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });
            } else if (["1W", "1M"].includes(displayData)) {
              return date?.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              });
            } else {
              return date?.toLocaleDateString("en-US", {
                year: "2-digit",
                month: "short",
                timeZone: "UTC",
              });
            }
          },
        },
        tickPositioner: function () {
          // Create custom tick positions with wider spacing
          const positions = [];
          const info = this.getExtremes();
          const tickCount = $screenWidth < 640 ? 2 : 5; // Reduce number of ticks displayed
          const interval = Math.floor((info.max - info.min) / tickCount);

          for (let i = 0; i <= tickCount; i++) {
            positions.push(info.min + i * interval);
          }
          return positions;
        },
      },

      yAxis: {
        // Force y‑axis to stay near the actual data range
        min: yMin ?? null,
        max: yMax ?? null,
        startOnTick: false,
        endOnTick: false,
        gridLineWidth: 1,
        gridLineColor: $mode === "light" ? "#d1d5dc" : "#111827",
        title: { text: null },
        labels: {
          style: { color: $mode === "light" ? "black" : "white" },
        },
        opposite: true,
        // Add a dashed plot line at the previous close value
        plotLines: [
          {
            value:
              displayData === "1D"
                ? data?.getStockQuote?.previousClose
                : priceData?.at(0)?.close,
            dashStyle: "Dash",
            color: "#fff", // Choose a contrasting color if needed
            width: 0.8,
          },
        ],
      },
      plotOptions: {
        series: {
          animation: false,
          marker: { enabled: false },
          states: { hover: { enabled: false } },
        },
      },
      legend: { enabled: false },
      series: [
        {
          name: "Price",
          type: "area",
          data: displayData === "1D" ? seriesData : priceList,
          animation: false,
          color: lineColor,
          lineWidth: 1.3,
          marker: {
            enabled: false,
          },
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, fillColorStart],
              [1, fillColorEnd],
            ],
          },
        },
      ],
    };

    return options;
  }

  //const startTimeTracking = performance.now();

  //==========================//

  $: {
    if (output !== null) {
      let change;
      let graphChange;
      let currentDataRow;
      let currentDataRowOneDay;
      let baseClose = previousClose;
      let graphBaseClose;

      currentDataRowOneDay = oneDayPrice?.at(-1);

      switch (displayData) {
        case "1W":
          currentDataRow = oneWeekPrice?.at(-1);
          graphBaseClose = oneWeekPrice?.at(0)?.close;
          config = plotData(oneWeekPrice) || null;
          break;

        case "1M":
          currentDataRow = oneMonthPrice?.at(-1);
          graphBaseClose = oneMonthPrice?.at(0)?.close;
          config = plotData(oneMonthPrice) || null;
          break;

        case "6M":
          currentDataRow = sixMonthPrice?.at(-1);
          graphBaseClose = sixMonthPrice?.at(0)?.close;
          config = plotData(sixMonthPrice) || null;
          break;

        case "1Y":
          currentDataRow = oneYearPrice?.at(-1);
          graphBaseClose = oneYearPrice?.at(0)?.close;
          config = plotData(oneYearPrice) || null;
          break;

        case "MAX":
          currentDataRow = maxPrice?.at(-1);
          graphBaseClose = maxPrice?.at(0)?.close;
          config = plotData(maxPrice) || null;
          break;
      }

      const closeValue =
        $realtimePrice !== null && $realtimePrice !== undefined
          ? $realtimePrice
          : (currentDataRowOneDay?.close ?? currentDataRowOneDay?.value);

      const graphCloseValue =
        $realtimePrice !== null && $realtimePrice !== undefined
          ? $realtimePrice
          : (currentDataRow?.close ?? currentDataRow?.value);

      if (closeValue && baseClose) {
        change = ((closeValue / baseClose - 1) * 100)?.toFixed(2);
      }

      if (graphCloseValue && graphBaseClose) {
        graphChange = ((graphCloseValue / graphBaseClose - 1) * 100)?.toFixed(
          2,
        );
      }

      // Format date
      const date = new Date(currentDataRowOneDay?.time * 1000);

      const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      };

      const formattedDate = date?.toLocaleString("en-US", options);

      const safeFormattedDate =
        formattedDate === "Invalid Date"
          ? convertTimestamp(data?.getStockQuote?.timestamp)
          : formattedDate;

      // Set display legend
      displayLegend = {
        close:
          currentDataRowOneDay?.close?.toFixed(2) ??
          data?.getStockQuote?.price?.toFixed(2),
        date: safeFormattedDate,
        change,
        graphChange: displayData === "1D" ? change : graphChange,
      };
    }
  }

  //==========================//

  $: {
    if ($stockTicker) {
      // add a check to see if running on client-side
      if ($realtimePrice !== null && $realtimePrice !== 0) {
        $currentPortfolioPrice = $realtimePrice;
      } else if ($realtimePrice === null || $realtimePrice === 0) {
        $realtimePrice = data?.getStockQuote?.price;
        $currentPortfolioPrice = $realtimePrice;
      } else if (oneDayPrice?.length !== 0) {
        $currentPortfolioPrice = oneDayPrice?.at(-1)?.close;
      }
    }
  }

  async function changeData(state) {
    switch (state) {
      case "1D":
        displayData = "1D";
        if (oneDayPrice?.length !== 0) {
          displayLastLogicalRangeValue = oneDayPrice?.at(0)?.close; //previousClose
          lastValue = oneDayPrice?.at(-1)?.close;
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }
        config = plotData(oneDayPrice) || null;
        break;
      case "1W":
        displayData = "1W";
        await historicalPrice("one-week");
        if (oneWeekPrice?.length !== 0) {
          displayLastLogicalRangeValue = oneWeekPrice?.at(0)?.close;
          lastValue = oneWeekPrice?.slice(-1)?.at(0)?.close;
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }

        break;
      case "1M":
        displayData = "1M";
        await historicalPrice("one-month");
        if (oneMonthPrice?.length !== 0) {
          displayLastLogicalRangeValue = oneMonthPrice?.at(0)?.close;
          lastValue = oneMonthPrice.slice(-1)?.at(0)?.close;
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }
        break;

      case "6M":
        displayData = "6M";
        await historicalPrice("six-months");
        if (sixMonthPrice?.length !== 0) {
          displayLastLogicalRangeValue = sixMonthPrice?.at(0)?.close;
          lastValue = sixMonthPrice?.slice(-1)?.at(0)?.close;
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }
        break;
      case "1Y":
        displayData = "1Y";
        await historicalPrice("one-year");

        if (oneYearPrice?.length !== 0) {
          displayLastLogicalRangeValue = oneYearPrice?.at(0)?.close;
          lastValue = oneYearPrice.slice(-1)?.at(0)?.close;
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }

        break;
      case "MAX":
        displayData = "MAX";
        await historicalPrice("max");
        if (maxPrice?.length !== 0) {
          displayLastLogicalRangeValue = maxPrice?.at(0)?.close;
          lastValue = maxPrice.slice(-1)?.at(0)?.close;
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }

        break;
      default:
        return;
    }
  }

  let oneDayPrice = [];
  let oneWeekPrice = [];
  let oneMonthPrice = [];
  let sixMonthPrice = [];

  let oneYearPrice = [];
  let maxPrice = [];

  async function historicalPrice(timePeriod: string) {
    const cachedData = getCache($stockTicker, "historicalPrice" + timePeriod);
    if (cachedData) {
      switch (timePeriod) {
        case "one-week":
          oneWeekPrice = cachedData;
          break;
        case "one-month":
          oneMonthPrice = cachedData;
          break;
        case "six-months":
          sixMonthPrice = cachedData;
          break;
        case "one-year":
          oneYearPrice = cachedData;
          break;
        case "max":
          maxPrice = cachedData;
          break;
        default:
          console.log(`Unsupported time period: ${timePeriod}`);
      }
    } else {
      output = null;
      config = null;

      const postData = {
        ticker: $stockTicker,
        timePeriod: timePeriod,
      };

      const response = await fetch("/api/historical-price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      output = (await response?.json()) ?? [];

      try {
        switch (timePeriod) {
          case "one-week":
            oneWeekPrice = output;
            break;
          case "one-month":
            oneMonthPrice = output;
            break;
          case "six-months":
            sixMonthPrice = output;
            break;
          case "one-year":
            oneYearPrice = output;
            break;
          case "max":
            maxPrice = output;
            break;
          default:
            console.log(`Unsupported time period: ${timePeriod}`);
        }

        setCache($stockTicker, output, "historicalPrice" + timePeriod);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async function initializePrice() {
    output = null;
    config = null;

    try {
      oneDayPrice = [...data?.getOneDayPrice] ?? [];

      output = [...oneDayPrice];

      if (oneDayPrice?.length > 0) {
        config = plotData(oneDayPrice) || null;
      }

      displayData =
        oneDayPrice?.length === 0 && sixMonthPrice?.length !== 0 ? "6M" : "1D";
      if (displayData === "1D") {
        lastValue = oneDayPrice?.at(-0)?.close;
      } else if (displayData === "6M") {
        lastValue = sixMonthPrice?.at(-1)?.close;
      }

      displayLastLogicalRangeValue =
        oneDayPrice?.length === 0 && sixMonthPrice?.length !== 0
          ? sixMonthPrice?.at(0)?.close
          : oneDayPrice?.at(0)?.close;
    } catch (e) {
      console.log(e);
    }
  }

  let displayLegend = {
    close: data?.getStockQuote?.price
      ? data?.getStockQuote?.price?.toFixed(2)
      : "n/a",
    date: "-",
    change: data?.getStockQuote?.changesPercentage
      ? data?.getStockQuote?.changesPercentage?.toFixed(2)
      : "n/a",
  };

  let displayLastLogicalRangeValue;

  onDestroy(async () => {
    $priceIncrease = null;
    $globalForm = [];
    shouldUpdatePriceChart.set(false);
  });

  $: dataMapping = {
    "1D": oneDayPrice,
    "1W": oneWeekPrice,
    "1M": oneMonthPrice,
    "6M": sixMonthPrice,
    "1Y": oneYearPrice,
    MAX: maxPrice,
  };

  $: {
    if (form) {
      $globalForm = form;
    }
  }

  $: {
    if ($stockTicker || $mode) {
      // add a check to see if running on client-side
      shouldUpdatePriceChart.set(false);
      oneDayPrice = [];
      oneWeekPrice = [];
      oneMonthPrice = [];
      oneYearPrice = [];
      maxPrice = [];
      output = null;
      config = null;

      stockDeck = data?.getStockDeck;
      initializePrice();
    }
  }
</script>

<SEO
  title={`${$stockTicker} ${$currentPortfolioPrice !== null && $currentPortfolioPrice !== 0 ? $currentPortfolioPrice : data?.getStockQuote?.price?.toFixed(2)} ${displayLegend?.change >= 0 ? "▲" : "▼"} ${displayLegend?.change}%`}
  description={`Get a real-time ${data?.companyName} (${$stockTicker}) stock chart, price quote with breaking news, financials, statistics, charts and more.`}
/>

<section
  class="text-muted dark:text-white min-h-screen pb-40 overflow-hidden w-full"
>
  <div class="w-full m-auto overflow-hidden">
    <div
      class="md:flex md:justify-between md:divide-x md:divide-slate-800 w-full"
    >
      <!-- Main content -->
      <div class="pb-12 md:pb-20 w-full sm:pr-6 xl:pr-0">
        <div class="mt-2">
          <!--End Ticker Section-->
          <!-- Start Graph -->

          <div class="sm:pl-7 mt-4 mb-5 lg:flex lg:flex-row lg:gap-x-4 w-full">
            {#if dataMapping[displayData]?.length === 0}
              <div
                class="order-1 lg:order-5 m-auto grow overflow-hidden border-gray-300 dark:border-gray-800 py-0.5 xs:py-1 sm:px-0.5 sm:pb-3 sm:pt-2.5 lg:mb-0 lg:border-0 lg:border-l lg:border-sharp lg:px-0 lg:py-0 lg:pl-5 md:mb-4 md:border-b"
              >
                <div class="flex items-center justify-between py-1 sm:pt-0.5">
                  <div class="hide-scroll overflow-x-auto">
                    <ul
                      class="flex space-x-[3px] whitespace-nowrap pl-0.5 xs:space-x-1"
                    >
                      {#each intervals as interval}
                        <li>
                          <button
                            on:click={() => changeData(interval)}
                            class="cursor-pointer px-1 py-1 text-sm sm:text-[1rem] xs:px-[3px] bp:px-1.5 sm:px-2 xxxl:px-3"
                          >
                            <span
                              class="block {displayData === interval
                                ? 'text-muted dark:text-white'
                                : 'text-muted dark:text-gray-400'}"
                              >{interval}</span
                            >
                            <div
                              class="{displayData === interval
                                ? `bg-[${displayLegend?.graphChange < 0 ? '#FF2F1F' : '#00FC50'}] `
                                : 'bg-default'} mt-1 h-[3px] w-[1.5rem] m-auto rounded-full"
                            />
                          </button>
                        </li>
                      {/each}
                    </ul>
                  </div>
                </div>
                <div class="h-[360px]">
                  <div
                    class="flex h-full w-full flex-col items-center justify-center rounded-sm border border-gray-300 dark:border-gray-800 p-6 text-center md:p-12"
                  >
                    <div class="mb-4 text-[1rem] sm:text-xl font-semibold">
                      No {displayData} chart data available
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <div
                class="order-1 lg:order-5 grow overflow-hidden border-gray-300 dark:border-gray-800 py-0.5 xs:py-1 sm:px-0.5 sm:pb-3 sm:pt-2.5 lg:mb-0 lg:border-0 lg:border-l lg:border-sharp lg:px-0 lg:py-0 lg:pl-5 md:mb-4 md:border-b"
              >
                <div class="flex items-center justify-between py-1 sm:pt-0.5">
                  <div class="hide-scroll overflow-x-auto">
                    <ul
                      class="flex space-x-[3px] whitespace-nowrap pl-0.5 xs:space-x-1"
                    >
                      {#each intervals as interval}
                        <li>
                          <button
                            on:click={() => changeData(interval)}
                            class="cursor-pointer px-1 py-1 text-sm sm:text-[1rem] xs:px-[3px] bp:px-1.5 sm:px-2 xxxl:px-3"
                          >
                            <span
                              class="block {displayData === interval
                                ? 'text-muted dark:text-white'
                                : 'text-muted dark:text-gray-400'}"
                              >{interval}</span
                            >
                            <div
                              class="{displayData === interval
                                ? `bg-[${displayLegend?.graphChange < 0 ? '#FF2F1F' : '#00FC50'}] `
                                : 'bg-white dark:bg-default'} mt-1 h-[3px] w-[1.5rem] m-auto rounded-full"
                            />
                          </button>
                        </li>
                      {/each}
                    </ul>
                  </div>
                  <div
                    class="flex shrink flex-row space-x-1 pr-1 text-sm sm:text-[1rem]"
                  >
                    <span
                      class={displayLegend?.graphChange >= 0
                        ? "before:content-['+'] text-[#00FC50]"
                        : "text-[#FF2F1F]"}
                    >
                      {displayLegend?.graphChange ??
                        data?.getStockQuote?.changesPercentage?.toFixed(2)}%
                    </span>
                    <span class="hidden text-muted dark:text-gray-200 sm:block"
                      >({displayData})</span
                    >
                  </div>
                </div>

                {#if output !== null && config !== null && dataMapping[displayData]?.length !== 0}
                  <div use:highcharts={config}></div>
                {:else}
                  <div
                    class="flex justify-center w-full sm:w-[650px] h-[360px] items-center"
                  >
                    <div class="relative">
                      <label
                        class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      >
                        <span
                          class="loading loading-spinner loading-md text-gray-400"
                        ></span>
                      </label>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}

            <div
              class="mt-10 lg:mt-0 order-5 lg:order-1 flex flex-row space-x-2 sm:space-x-3 xs:space-x-4"
            >
              <table class="w-[50%] text-sm sm:text-[1rem] lg:min-w-[250px]">
                <tbody
                  ><tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >Bid</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{$wsBidPrice !== 0 && $wsBidPrice !== null
                        ? $wsBidPrice
                        : ((data?.getStockQuote?.bid !== 0
                            ? data?.getStockQuote?.bid
                            : "n/a") ?? "n/a")}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      ><a
                        href={`/stocks/${$stockTicker}/statistics/market-cap`}
                        class="sm:hover:text-blue-400 underline underline-offset-4"
                        >Market Cap</a
                      ></td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{@html abbreviateNumber(
                        data?.getStockQuote?.marketCap,
                        false,
                        true,
                      )}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >Revenue (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{@html stockDeck?.revenueTTM !== null &&
                      stockDeck?.revenueTTM !== 0
                        ? abbreviateNumber(stockDeck?.revenueTTM, false, true)
                        : "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >Net Income (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{@html stockDeck?.netIncomeTTM !== null
                        ? abbreviateNumber(stockDeck?.netIncomeTTM, false, true)
                        : "n/a"}</td
                    ></tr
                  >

                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >EPS (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{data?.getStockQuote?.eps ?? "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >PE Ratio (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{data?.getStockQuote?.pe ?? "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >Forward PE</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{stockDeck?.forwardPE ?? "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      ><a
                        href={data?.getAnalystSummary?.consensusRating !==
                        undefined
                          ? `/stocks/${$stockTicker}/forecast`
                          : ""}
                        class={data?.getAnalystSummary?.consensusRating !==
                        undefined
                          ? "sm:hover:text-blue-400  underline underline-offset-4"
                          : " cursor-text"}>Analyst</a
                      >
                    </td>
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{data?.getAnalystSummary?.consensusRating !== null &&
                      data?.getAnalystSummary?.consensusRating !== "n/a" &&
                      data?.getAnalystSummary?.consensusRating !== undefined
                        ? data?.getAnalystSummary?.consensusRating
                        : "n/a"}</td
                    ></tr
                  >
                </tbody>
              </table>
              <table class="w-[50%] text-sm lg:min-w-[250px]">
                <tbody
                  ><tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >Ask</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{$wsAskPrice !== 0 && $wsAskPrice !== null
                        ? $wsAskPrice
                        : ((data?.getStockQuote?.ask !== 0
                            ? data?.getStockQuote?.ask
                            : "n/a") ?? "n/a")}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >Volume</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{data?.getStockQuote?.volume?.toLocaleString(
                        "en-us",
                      )}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >Avg. Volume (20D)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{data?.getStockQuote?.avgVolume !== undefined
                        ? data?.getStockQuote?.avgVolume?.toLocaleString(
                            "en-us",
                          )
                        : "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >Open</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{data?.getStockQuote?.open?.toFixed(2)}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >Previous Close</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{data?.getStockQuote?.previousClose?.toFixed(2)}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >Day's Range</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{data?.getStockQuote?.dayLow?.toFixed(2)} - {data?.getStockQuote?.dayHigh?.toFixed(
                        2,
                      )}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >52-Week Range</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{data?.getStockQuote?.yearLow?.toFixed(2)} - {data?.getStockQuote?.yearHigh?.toFixed(
                        2,
                      )}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-300 dark:border-gray-800 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 text-sm"
                      >Beta</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:text-right"
                      >{stockDeck?.beta?.toFixed(2)}</td
                    ></tr
                  >
                </tbody>
              </table>
            </div>
          </div>

          <!--End Graph-->

          <div
            class="mt-6 flex flex-col lg:flex-row gap-x-14 items-start w-full justify-between"
          >
            <div
              class="lg:space-y-6 lg:order-2 lg:pt-1 sm:pl-7 lg:pl-0 w-full lg:w-[45%] sm:ml-auto lg:max-w-[345px]"
            >
              <Sidecard {data} />
            </div>

            <div class="w-full lg:w-[65%] 2xl:w-[70%]">
              <div
                class="w-full m-auto sm:pl-6 sm:pb-6 {Object?.keys(
                  data?.getEarningsSurprise || {},
                )?.length !== 0
                  ? ''
                  : 'hidden'}"
              >
                <EarningsSurprise {data} />
              </div>

              <div
                class="w-full m-auto mt-5 sm:mt-0 sm:pl-6 sm:pb-6 {Object?.keys(
                  data?.getNextEarnings || {},
                )?.length !== 0
                  ? ''
                  : 'hidden'}"
              >
                <NextEarnings {data} />
              </div>

              <div
                class="w-full mt-10 sm:mt-0 m-auto sm:pl-6 sm:pb-6 {data
                  ?.getWhyPriceMoved?.length !== 0
                  ? ''
                  : 'hidden'}"
              >
                <WIIM {data} />
              </div>

              <div class="w-full mt-5 sm:mt-0 m-auto sm:pl-6 sm:pb-6">
                <News {data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
