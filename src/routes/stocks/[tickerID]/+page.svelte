<script lang="ts">
  import { AreaSeries, Chart, PriceLine } from "svelte-lightweight-charts";
  import { TrackingModeExitMode, ColorType } from "lightweight-charts";
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
    priceChartData,
  } from "$lib/store";
  import { onDestroy, onMount } from "svelte";
  //import BullBearSay from "$lib/components/BullBearSay.svelte";
  import WIIM from "$lib/components/WIIM.svelte";
  import SEO from "$lib/components/SEO.svelte";

  import News from "$lib/components/News.svelte";
  import NextEarnings from "$lib/components/NextEarnings.svelte";
  import EarningsSurprise from "$lib/components/EarningsSurprise.svelte";
  import Sidecard from "$lib/components/Sidecard.svelte";

  import { convertTimestamp, abbreviateNumber } from "$lib/utils";

  export let data;
  export let form;

  let stockDeck = {};

  $: previousClose = data?.getStockQuote?.previousClose;
  //============================================//
  const intervals = ["1D", "1W", "1M", "6M", "1Y", "MAX"];

  let chart = null;
  async function checkChart() {
    if (chart) {
      clearInterval(intervalId);
      fitContentChart();
    }
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

      const length = oneDayPrice?.length;
      for (let i = length - 1; i >= 0; i--) {
        if (!isNaN(oneDayPrice[i]?.close)) {
          currentDataRowOneDay = oneDayPrice[i];
          break;
        }
      }

      // Determine current data row and base close price based on displayData
      switch (displayData) {
        case "1W":
          currentDataRow = oneWeekPrice?.at(-1); // Latest entry for 1 week
          graphBaseClose = oneWeekPrice?.at(0)?.close;
          break;

        case "1M":
          currentDataRow = oneMonthPrice?.at(-1); // Latest entry for 1 month
          graphBaseClose = oneMonthPrice?.at(0)?.close;
          break;

        case "6M":
          currentDataRow = sixMonthPrice?.at(-1); // Latest entry for 6 months
          graphBaseClose = sixMonthPrice?.at(0)?.close;
          break;

        case "1Y":
          currentDataRow = oneYearPrice?.at(-1); // Latest entry for 1 year
          graphBaseClose = oneYearPrice?.at(0)?.close;
          break;

        case "MAX":
          currentDataRow = maxPrice?.at(-1); // Latest entry for MAX range
          graphBaseClose = maxPrice?.at(0)?.close;
          break;
      }

      // Calculate percentage change if baseClose and currentDataRow are valid
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
    if ($stockTicker && typeof window !== "undefined") {
      // add a check to see if running on client-side
      if ($realtimePrice !== null && $realtimePrice !== 0) {
        $currentPortfolioPrice = $realtimePrice;
      } else if ($realtimePrice === null || $realtimePrice === 0) {
        $realtimePrice = data?.getStockQuote?.price;
        $currentPortfolioPrice = $realtimePrice;
      } else if (oneDayPrice?.length !== 0) {
        const length = oneDayPrice?.length;
        for (let i = length - 1; i >= 0; i--) {
          if (!isNaN(oneDayPrice[i]?.close)) {
            $currentPortfolioPrice = oneDayPrice[i]?.close;
            break;
          }
        }
      }
    }
  }

  let displayData;
  let colorChange;
  let topColorChange;
  let bottomColorChange;

  let lastValue;
  async function changeData(state) {
    switch (state) {
      case "1D":
        displayData = "1D";
        if (oneDayPrice?.length !== 0) {
          displayLastLogicalRangeValue = oneDayPrice?.at(0)?.close; //previousClose
          const length = oneDayPrice?.length;
          for (let i = length - 1; i >= 0; i--) {
            if (!isNaN(oneDayPrice[i]?.close)) {
              lastValue = oneDayPrice[i]?.close;
              break;
            }
          }
        } else {
          displayLastLogicalRangeValue = null;
          lastValue = null;
        }
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
    colorChange =
      lastValue < displayLastLogicalRangeValue ? "#FF2F1F" : "#00FC50";
    topColorChange =
      lastValue < displayLastLogicalRangeValue
        ? "rgb(255, 47, 31, 0.2)"
        : "rgb(16, 219, 6, 0.2)";
    bottomColorChange =
      lastValue < displayLastLogicalRangeValue
        ? "rgb(255, 47, 31, 0.001)"
        : "rgb(16, 219, 6, 0.001)";

    fitContentChart();

    //trackButtonClick('Time Period: '+ state)
  }

  let output = null;

  //====================================//

  let intervalId = null;
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

      const mapData = (data) =>
        data?.map(({ time, open, high, low, close }) => ({
          time: ["1D", "1W", "1M"]?.includes(displayData)
            ? Date?.parse(time + "Z") / 1000
            : time,
          open,
          high,
          low,
          close,
        }));

      const mappedData = mapData(output);
      try {
        switch (timePeriod) {
          case "one-week":
            oneWeekPrice = mappedData;
            break;
          case "one-month":
            oneMonthPrice = mappedData;
            break;
          case "six-months":
            sixMonthPrice = mappedData;
            break;
          case "one-year":
            oneYearPrice = mappedData;
            break;
          case "max":
            maxPrice = mappedData;
            break;
          default:
            console.log(`Unsupported time period: ${timePeriod}`);
        }
        setCache($stockTicker, mappedData, "historicalPrice" + timePeriod);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async function initializePrice() {
    output = null;
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(checkChart, 0);
    try {
      output = [...data?.getOneDayPrice] ?? [];
      oneDayPrice = output?.map((item) => ({
        time: Date?.parse(item?.time + "Z") / 1000,
        open: item?.open !== null ? item?.open : NaN,
        high: item?.high !== null ? item?.high : NaN,
        low: item?.low !== null ? item?.low : NaN,
        close: item?.close !== null ? item?.close : NaN,
      }));
      displayData =
        oneDayPrice?.length === 0 && sixMonthPrice?.length !== 0 ? "6M" : "1D";
      //lastValue = oneDayPrice[oneDayPrice?.length - 1]?.value;
      if (displayData === "1D") {
        const length = oneDayPrice?.length;
        for (let i = length - 1; i >= 0; i--) {
          if (!isNaN(oneDayPrice[i]?.close)) {
            lastValue = oneDayPrice[i]?.close;
            break;
          }
        }
      } else if (displayData === "6M") {
        lastValue = sixMonthPrice?.slice(-1)?.at(0)?.close;
      }

      displayLastLogicalRangeValue =
        oneDayPrice?.length === 0 && sixMonthPrice?.length !== 0
          ? sixMonthPrice?.at(0)?.close
          : oneDayPrice?.at(0)?.close; //previousClose;

      //colorChange = lastValue < displayLastLogicalRangeValue ? "#CC3636" : "#367E18";

      colorChange =
        lastValue < displayLastLogicalRangeValue ? "#FF2F1F" : "#00FC50";
      topColorChange =
        lastValue < displayLastLogicalRangeValue
          ? "rgb(255, 47, 31, 0.2)"
          : "rgb(16, 219, 6, 0.2)";
      bottomColorChange =
        lastValue < displayLastLogicalRangeValue
          ? "rgb(255, 47, 31, 0.001)"
          : "rgb(16, 219, 6, 0.001)";
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

  const fitContentChart = async () => {
    if (displayData === "1Y" && oneYearPrice?.length === 0) {
    } else if (chart !== null && typeof window !== "undefined") {
      chart?.timeScale().fitContent();

      chart?.applyOptions({
        trackingMode: {
          exitMode: TrackingModeExitMode.OnTouchEnd,
        },
      });
    }
  };

  let width = 580;
  //Initial height of graph
  let height = 350;

  let observer;
  let ref;

  ref = (element) => {
    if (observer) {
      observer?.disconnect();
    }
    if (!element) {
      return;
    }

    observer = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    });
    observer.observe(element);
  };

  //===============================================//
  function defaultTickMarkFormatter(timePoint, tickMarkType, locale) {
    const formatOptions = {
      timeZone: "UTC",
    };

    switch (tickMarkType) {
      case 0: // TickMarkType.Year:
        formatOptions.year = "numeric";
        break;
      case 1: // TickMarkType.Month:
        formatOptions.month = "short";
        break;
      case 2: // TickMarkType.DayOfMonth:
        formatOptions.day = "numeric";
        break;
      case 3: // TickMarkType.Time:
        formatOptions.hour12 = true; // Use 12-hour clock
        formatOptions.hour = "numeric"; // Use numeric hour without leading zero
        break;
      case 4: // TickMarkType.TimeWithSeconds:
        formatOptions.hour12 = true; // Use 12-hour clock
        formatOptions.hour = "numeric"; // Use numeric hour without leading zero
        formatOptions.minute = "2-digit"; // Always show minutes with leading zero
        formatOptions.second = "2-digit"; // Always show seconds with leading zero
        break;
      default:
      // Ensure this default case handles unexpected tickMarkType values
    }
    if ([3, 4]?.includes(tickMarkType)) {
      const date = new Date(timePoint?.timestamp * 1000);
      return new Intl.DateTimeFormat(locale, formatOptions)?.format(date);
    } else {
      const date = new Date(timePoint?.timestamp);
      return new Intl.DateTimeFormat(locale, formatOptions)?.format(date);
    }
  }

  $: options = {
    width: width,
    height: height,
    layout: {
      background: {
        type: ColorType.Solid,
        color: "#09090B",
      },
      textColor: "#d1d4dc",
    },
    grid: {
      vertLines: {
        color: "#09090B",
        visible: false,
      },
      horzLines: {
        color: "#09090B",
        visible: false,
      },
    },
    crosshair: {
      horzLine: {
        visible: true,
        labelBackgroundColor: "#fff",
      },
      vertLine: {
        labelVisible: true,
        labelBackgroundColor: "#fff",
        style: 0,
      },
    },
    priceScale: {
      autoScale: true,
      scaleMargins: {
        top: 0.3,
        bottom: 0.25,
      },
    },
    rightPriceScale: {
      scaleMargins: {
        top: 0.3,
        bottom: 0.25,
        borderVisible: false,
      },
      visible: true,
      borderVisible: false,
      mode: 1, // Keeps price scale fixed
    },
    leftPriceScale: {
      visible: false,
      borderColor: "rgba(197, 203, 206, 0.8)",
    },
    handleScale: {
      mouseWheel: false,
      pinch: false, // Disables scaling via pinch gestures
      axisPressedMouseMove: false, // Disables scaling by dragging the axis with the mouse
    },
    handleScroll: {
      mouseWheel: false,
      horzTouchDrag: false,
      vertTouchDrag: false,
      pressedMouseMove: false,
    },
    timeScale: {
      borderColor: "#fff",
      textColor: "#fff",
      borderVisible: false,
      visible: true,
      fixLeftEdge: true,
      fixRightEdge: true,
      timeVisible: ["1D", "1W", "1M"].includes(displayData),
      secondsVisible: false,
      tickMarkFormatter: (time, tickMarkType, locale) => {
        return defaultTickMarkFormatter(
          { timestamp: time },
          tickMarkType,
          locale,
        );
      },
    },
  };

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

  function updateClosePrice(data, extendPriceChart) {
    const newDateParsedUTC = Date?.parse(extendPriceChart?.time + "Z") / 1000; // Parse the incoming time
    const closePrice = extendPriceChart?.price; // Store the close price for easier reference
    let foundMatch = false;
    let lastNonNullCloseIndex = null;

    // Iterate through data to find the right time slot
    for (let i = 0; i < data.length; i++) {
      // Check if the timestamp matches
      if (data[i].time === newDateParsedUTC) {
        data[i].close = closePrice; // Update the existing close price
        foundMatch = true;
        break; // Exit loop once matched
      }
      // Keep track of the last non-null close price
      if (data[i].close !== null) {
        lastNonNullCloseIndex = i;
      }
    }

    // If no matching timestamp was found, add new data
    if (!foundMatch) {
      // Only update the last non-null close if it exists
      if (lastNonNullCloseIndex !== null) {
        data[lastNonNullCloseIndex].close = closePrice; // Update with the latest close price
      } else {
        // If there's no previous close data, add a new entry
        data.push({ time: newDateParsedUTC, close: closePrice }); // Add new data
      }
    }

    return data; // Return updated data
  }

  onMount(() => {
    shouldUpdatePriceChart.subscribe(async (value) => {
      if (
        value &&
        chart !== null &&
        $realtimePrice !== null &&
        oneDayPrice?.length > 0 &&
        $priceChartData?.time !== null &&
        $priceChartData?.price !== null
      ) {
        // Create a new array and update oneDayPrice to trigger reactivity
        const updatedPrice = updateClosePrice(oneDayPrice, $priceChartData);
        oneDayPrice = [...updatedPrice]; // Reassign the updated array to trigger reactivity
        try {
          chart?.update(oneDayPrice); // Update the chart with the new prices
        } catch (e) {
          // Handle error if chart update fails
          //console.error("Chart update error:", e);
        }
        shouldUpdatePriceChart.set(false); // Reset the update flag
      }
    });
  });

  $: {
    if ($stockTicker && typeof window !== "undefined") {
      // add a check to see if running on client-side
      shouldUpdatePriceChart.set(false);
      oneDayPrice = [];
      oneWeekPrice = [];
      oneMonthPrice = [];
      oneYearPrice = [];
      maxPrice = [];
      output = null;

      stockDeck = data?.getStockDeck; // Essential otherwise chart will not be updated since we wait until #layout.server.ts server response is finished

      initializePrice();
    }
  }
</script>

<SEO
  title={`${$stockTicker} ${$currentPortfolioPrice !== null && $currentPortfolioPrice !== 0 ? $currentPortfolioPrice : data?.getStockQuote?.price?.toFixed(2)} ${displayLegend?.change >= 0 ? "▲" : "▼"} ${displayLegend?.change}%`}
  description={`Get a real-time ${data?.companyName} (${$stockTicker}) stock chart, price quote with breaking news, financials, statistics, charts and more.`}
/>

<section class="bg-default min-h-screen pb-40 overflow-hidden w-full">
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
                class="order-1 lg:order-5 m-auto grow overflow-hidden border-gray-600 py-0.5 xs:py-1 sm:px-0.5 sm:pb-3 sm:pt-2.5 lg:mb-0 lg:border-0 lg:border-l lg:border-sharp lg:px-0 lg:py-0 lg:pl-5 md:mb-4 md:border-b"
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
                            class="px-1 py-1 text-sm sm:text-[1rem] xs:px-[3px] bp:px-1.5 sm:px-2 xxxl:px-3"
                          >
                            <span
                              class="block {displayData === interval
                                ? 'text-white'
                                : 'text-gray-400'}">{interval}</span
                            >
                            <div
                              class="{displayData === interval
                                ? `bg-[${colorChange}] `
                                : 'bg-default'} mt-1 h-[3px] w-[1.5rem] m-auto rounded-full"
                            />
                          </button>
                        </li>
                      {/each}
                    </ul>
                  </div>
                </div>
                <div class="h-[250px] sm:h-[350px]">
                  <div
                    class="flex h-full w-full flex-col items-center justify-center rounded-sm border border-gray-800 p-6 text-center md:p-12"
                  >
                    <div
                      class="mb-4 text-white text-[1rem] sm:text-xl font-semibold"
                    >
                      No {displayData} chart data available
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <div
                class="order-1 lg:order-5 grow overflow-hidden border-gray-600 py-0.5 xs:py-1 sm:px-0.5 sm:pb-3 sm:pt-2.5 lg:mb-0 lg:border-0 lg:border-l lg:border-sharp lg:px-0 lg:py-0 lg:pl-5 md:mb-4 md:border-b"
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
                            class="px-1 py-1 text-sm sm:text-[1rem] xs:px-[3px] bp:px-1.5 sm:px-2 xxxl:px-3"
                          >
                            <span
                              class="block {displayData === interval
                                ? 'text-white'
                                : 'text-gray-400'}">{interval}</span
                            >
                            <div
                              class="{displayData === interval
                                ? `bg-[${colorChange}] `
                                : 'bg-default'} mt-1 h-[3px] w-[1.5rem] m-auto rounded-full"
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
                      {displayLegend?.graphChange}%
                    </span>
                    <span class="hidden text-gray-200 sm:block"
                      >({displayData})</span
                    >
                  </div>
                </div>

                {#if output !== null && dataMapping[displayData]?.length !== 0}
                  <Chart
                    {...options}
                    autoSize={true}
                    ref={(api) => (chart = api)}
                  >
                    {#if displayData === "1D"}
                      <AreaSeries
                        reactive={true}
                        data={oneDayPrice?.map(({ time, close }) => ({
                          time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={oneDayPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {:else if displayData === "1W"}
                      <AreaSeries
                        data={oneWeekPrice?.map(({ time, close }) => ({
                          time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={oneWeekPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {:else if displayData === "1M"}
                      <AreaSeries
                        data={oneMonthPrice?.map(({ time, close }) => ({
                          time: time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={oneMonthPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {:else if displayData === "6M"}
                      <AreaSeries
                        data={sixMonthPrice?.map(({ time, close }) => ({
                          time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={sixMonthPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {:else if displayData === "1Y"}
                      <AreaSeries
                        data={oneYearPrice?.map(({ time, close }) => ({
                          time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={oneYearPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {:else if displayData === "MAX"}
                      <AreaSeries
                        data={maxPrice?.map(({ time, close }) => ({
                          time,
                          value: close,
                        }))}
                        lineWidth={1.5}
                        priceScaleId="right"
                        lineColor={colorChange}
                        topColor={topColorChange}
                        bottomColor={bottomColorChange}
                        priceLineVisible={false}
                      >
                        <PriceLine
                          price={maxPrice?.at(0)?.close}
                          lineWidth={1}
                          color="#fff"
                        />
                      </AreaSeries>
                    {/if}
                  </Chart>
                {:else}
                  <div
                    class="flex justify-center w-full sm:w-[650px] h-[350px] items-center"
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
              <table
                class="w-[50%] text-sm text-white sm:text-[1rem] lg:min-w-[250px] 2xl:min-w-[300px]"
              >
                <tbody
                  ><tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >Bid</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{$wsBidPrice !== 0 && $wsBidPrice !== null
                        ? $wsBidPrice
                        : ((data?.getStockQuote?.bid !== 0
                            ? data?.getStockQuote?.bid
                            : "n/a") ?? "n/a")}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      ><a
                        href={`/stocks/${$stockTicker}/statistics/market-cap`}
                        class="sm:hover:text-blue-400 text-white underline underline-offset-4"
                        >Market Cap</a
                      ></td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{@html abbreviateNumber(
                        data?.getStockQuote?.marketCap,
                        false,
                        true,
                      )}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >Revenue (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{@html stockDeck?.revenueTTM !== null &&
                      stockDeck?.revenueTTM !== 0
                        ? abbreviateNumber(stockDeck?.revenueTTM, false, true)
                        : "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >Net Income (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{@html stockDeck?.netIncomeTTM !== null
                        ? abbreviateNumber(stockDeck?.netIncomeTTM, false, true)
                        : "n/a"}</td
                    ></tr
                  >

                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >EPS (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{data?.getStockQuote?.eps ?? "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >PE Ratio (ttm)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{data?.getStockQuote?.pe ?? "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >Forward PE</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{stockDeck?.forwardPE ?? "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      ><a
                        href={data?.getAnalystSummary?.consensusRating !==
                        undefined
                          ? `/stocks/${$stockTicker}/forecast`
                          : ""}
                        class={data?.getAnalystSummary?.consensusRating !==
                        undefined
                          ? "sm:hover:text-blue-400 text-white underline underline-offset-4"
                          : "text-white cursor-text"}>Analyst</a
                      >
                    </td>
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{data?.getAnalystSummary?.consensusRating !== null &&
                      data?.getAnalystSummary?.consensusRating !== "n/a" &&
                      data?.getAnalystSummary?.consensusRating !== undefined
                        ? data?.getAnalystSummary?.consensusRating
                        : "n/a"}</td
                    ></tr
                  >
                </tbody>
              </table>
              <table
                class="w-[50%] text-sm text-white lg:min-w-[250px] 2xl:min-w-[300px]"
              >
                <tbody
                  ><tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >Ask</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{$wsAskPrice !== 0 && $wsAskPrice !== null
                        ? $wsAskPrice
                        : ((data?.getStockQuote?.ask !== 0
                            ? data?.getStockQuote?.ask
                            : "n/a") ?? "n/a")}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >Volume</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{data?.getStockQuote?.volume?.toLocaleString(
                        "en-us",
                      )}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >Avg. Volume (20D)</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{data?.getStockQuote?.avgVolume !== undefined
                        ? data?.getStockQuote?.avgVolume?.toLocaleString(
                            "en-us",
                          )
                        : "n/a"}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >Open</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{data?.getStockQuote?.open?.toFixed(2)}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >Previous Close</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{data?.getStockQuote?.previousClose?.toFixed(2)}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >Day's Range</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{data?.getStockQuote?.dayLow?.toFixed(2)} - {data?.getStockQuote?.dayHigh?.toFixed(
                        2,
                      )}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >52-Week Range</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
                      >{data?.getStockQuote?.yearLow?.toFixed(2)} - {data?.getStockQuote?.yearHigh?.toFixed(
                        2,
                      )}</td
                    ></tr
                  >
                  <tr
                    class="flex flex-col border-b border-gray-600 py-1 sm:table-row sm:py-0"
                    ><td
                      class="whitespace-nowrap px-0.5 py-[1px] xs:px-1 sm:py-2 text-[1rem]"
                      >Beta</td
                    >
                    <td
                      class="whitespace-nowrap px-0.5 py-[1px] text-left text-sm font-semibold xs:px-1 sm:py-2 sm:text-right sm:text-[1rem]"
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
              class="lg:space-y-6 lg:order-2 lg:pt-1 sm:pl-7 lg:pl-0 w-full lg:w-[45%] sm:ml-auto lg:max-w-[400px]"
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

<!--End-Indicator-Modal-->

<style lang="scss">
  canvas {
    width: 100%;
    height: 100%;
    max-width: 800px;
    max-height: 450px;
  }

  .pulse {
    position: relative;
    animation: pulse-animation 1s forwards cubic-bezier(0.5, 0, 0.5, 1);
  }

  @keyframes pulse-animation {
    0% {
      transform: scale(0.9);
      opacity: 1;
    }
    100% {
      transform: scale(0.9);
      opacity: 0;
    }
  }

  :root {
    --date-picker-background: #09090b;
    --date-picker-foreground: #f7f7f7;
  }
</style>
