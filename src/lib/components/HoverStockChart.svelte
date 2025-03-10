<script lang="ts">
  import * as HoverCard from "$lib/components/shadcn/hover-card/index.js";

  import { ColorType } from "lightweight-charts";
  import { Chart, BaselineSeries, PriceLine } from "svelte-lightweight-charts";
  import { screenWidth, getCache, setCache } from "$lib/store";
  import { abbreviateNumber } from "$lib/utils";
  import { afterUpdate } from "svelte";
  export let symbol;
  export let assetType = "stock";
  export let link = null;

  let priceData = [];
  let changesPercentage = 0;
  let change = 0;
  let stockChartData;

  async function getStockData(ticker: string) {
    const cachedData = getCache(ticker, "hoverStockChart");
    if (cachedData) {
      stockChartData = cachedData;
    } else {
      const postData = { ticker: ticker };
      const response = await fetch("/api/hover-stock-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      stockChartData = (await response?.json()) ?? {};

      setCache(ticker, stockChartData, "hoverStockChart");
    }

    changesPercentage = stockChartData?.changesPercentage;
    change = stockChartData?.change;

    priceData = stockChartData?.history;

    priceData = priceData
      ?.map((item) => ({
        time: Date?.parse(item?.time), // Assuming 'time' is the correct property to parse
        value: item?.close ?? null,
      }))
      ?.filter(
        (item) =>
          item?.value !== 0 &&
          item?.value !== null &&
          item?.value !== undefined,
      );
  }

  function getHref(symbol: string) {
    let path = "";
    if (symbol?.length !== 0) {
      if (["stocks", "stock"].includes(assetType?.toLowerCase())) {
        path = `/stocks/${symbol}${link ? `/${link}` : ""}`;
      } else if (assetType?.toLowerCase() === "etf") {
        path = `/etf/${symbol}${link ? `/${link}` : ""}`;
      } else if (["BTC", "USD"].includes(symbol)) {
        path = "";
      } else {
        path = `/index/${symbol}${link ? `/${link}` : ""}`;
      }
    }
    return path;
  }

  $: topLineColor = changesPercentage >= 0 ? "#71CA96" : "#FF7070";

  let width = $screenWidth < 640 ? 80 : 150; //= ($screenWidth <= 1200 && $screenWidth > 900) ? 360 : ($screenWidth <= 900 && $screenWidth > 700) ? 260 : ($screenWidth <= 700 && $screenWidth >=600 ) ? 200 : ($screenWidth < 600 && $screenWidth >=500 ) ? 150 : 80;

  //Initial height of graph
  let height = $screenWidth < 640 ? 50 : 60;

  let observer;
  let ref;
  let chart;

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

  const THEMES = {
    Dark: {
      chart: {
        layout: {
          background: {
            type: ColorType.Solid,
            color: "#11151D",
          },
          lineColor: "#2B2B43",
          textColor: "#D9D9D9",
        },
        crosshair: {
          mode: 2,
        },
        grid: {
          vertLines: {
            visible: false,
          },
          horzLines: {
            visible: false,
          },
        },
      },

      series: {
        baseValue: { type: "price", price: priceData?.at(0)?.value },
        priceLineVisible: false,
        baseLineVisible: true,
        baseLineColor: "#B2B5BE",
        baseLineWidth: 1,
        baseLineStyle: 1,
        lineWidth: 1.5,
      },
    },
  };

  const AVAILABLE_THEMES = Object?.keys(THEMES);

  let selected = AVAILABLE_THEMES[0];
  $: theme = THEMES[selected];

  const options = {
    width: width,
    height: height,
    rightPriceScale: {
      visible: false,
    },
    timeScale: {
      borderColor: "#FFFFFF",
      textColor: "#FFFFFF",
      visible: false,
      fixLeftEdge: true,
      fixRightEdge: true,
    },
    handleScale: {
      mouseWheel: false,
    },
    handleScroll: {
      mouseWheel: false,
      horzTouchDrag: false,
      vertTouchDrag: false,
      pressedMouseMove: false,
    },
  };

  afterUpdate(async () => {
    if (
      $screenWidth &&
      stockChartData &&
      chart &&
      typeof window !== "undefined"
    ) {
      chart?.timeScale()?.fitContent();
    }
  });

  $: charNumber = 20;
</script>

<div on:mouseover={() => getStockData(symbol)} class="inline-block">
  <HoverCard.Root>
    <div on:mouseover>
      <HoverCard.Trigger
        class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
      >
        <a
          href={getHref(symbol)}
          class="sm:hover:text-muted dark:sm:hover:text-white text-blue-500 dark:text-blue-400"
          >{symbol?.length !== 0 ? symbol : "-"}</a
        >
      </HoverCard.Trigger>
    </div>
    <HoverCard.Content class=" w-96 bg-[#11151D] border border-gray-600">
      <div class="flex justify-between space-x-4 w-full text-white">
        <div class="space-y-1 w-full">
          <!--Hover Stock Chart-->
          <label
            class=" text-sm flex flex-row items-center justify-start bg-[#11151D]"
          >
            <div class="flex flex-col items-start w-full">
              <div class=" flex flex-col items-start pb-1">
                <h4 class="text-sm text-blue-400 inline-block">
                  {symbol}
                </h4>
                <h5 class="text-sm inline-block">
                  {stockChartData?.name?.length > charNumber
                    ? stockChartData?.name?.slice(0, charNumber) + "..."
                    : stockChartData?.name}
                </h5>
              </div>
              <p>
                Current Price: {stockChartData?.price?.toFixed(2)} (<span
                  class="text-xs {change >= 0
                    ? "before:content-['+'] text-green-600 dark:text-[#00FC50]"
                    : 'text-red-600 dark:text-[#FF2F1F]'}"
                  >{change?.toFixed(2)}</span
                >)
              </p>
              <p>
                <svg
                  class="-ml-1 inline-block w-4 h-4 {changesPercentage >= 0
                    ? ''
                    : 'rotate-180'}"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill={changesPercentage >= 0 ? "#00FC50" : "#FF2F1F"}
                    d="M12.884 5.116a1.253 1.253 0 0 0-1.768 0l-5 5a1.25 1.25 0 0 0 1.768 1.768l2.866-2.866V18a1.25 1.25 0 1 0 2.5 0V9.018l2.866 2.866a1.25 1.25 0 1 0 1.768-1.768z"
                  />
                </svg>
                {#if changesPercentage != null}
                  <span
                    class="-ml-1"
                    style="color: {changesPercentage >= 0
                      ? '#00FC50'
                      : '#FF2F1F'}"
                  >
                    {changesPercentage >= 1000 || changesPercentage <= -1000
                      ? abbreviateNumber(changesPercentage)
                      : changesPercentage?.toFixed(2)}%
                  </span>
                {:else}
                  -
                {/if}
                today
              </p>
            </div>
            {#if priceData?.length > 0}
              <div class="w-[40%]">
                <Chart
                  {...options}
                  {...theme.chart}
                  autoSize={true}
                  ref={(ref) => (chart = ref)}
                >
                  <BaselineSeries
                    data={priceData}
                    {...theme.series}
                    {topLineColor}
                  >
                    <PriceLine
                      price={priceData?.at(0)?.value}
                      lineWidth={1}
                      color="#fff"
                    />
                  </BaselineSeries>
                </Chart>
              </div>
            {/if}
          </label>

          <!--Hover Stock Chart-->
        </div>
      </div>
    </HoverCard.Content>
  </HoverCard.Root>
</div>
