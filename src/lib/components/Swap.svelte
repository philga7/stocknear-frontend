<script lang="ts">
  import { abbreviateNumber } from "$lib/utils";
  import {
    swapComponent,
    stockTicker,
    screenWidth,
    getCache,
    setCache,
  } from "$lib/store";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { ScatterChart } from "echarts/charts";
  import { GridComponent, TooltipComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  export let data: any; // Add type for `data` if possible

  use([ScatterChart, GridComponent, TooltipComponent, CanvasRenderer]);

  let isLoaded = false;

  const tabs = [{ title: "Effective Date" }, { title: "Expiration Date" }];

  let activeIdx = 0;

  function changeTab(index: number) {
    activeIdx = index;
    optionsData = getPlotOptions(
      activeIdx === 0 ? "effectiveDate" : "expirationDate",
    );
  }

  let rawData: any[] = [];
  let optionsData: any;
  let avgNotionalAmount: number | undefined;
  let avgNotionalQuantity: number | undefined;

  function getPlotOptions(state: "effectiveDate" | "expirationDate") {
    const combinedData = rawData?.map((item) => ({
      date:
        state === "effectiveDate"
          ? item["Effective Date"]
          : item["Expiration Date"],
      notionalAmount: item["Notional amount-Leg 1"],
      notionalQuantity: item["Total notional quantity-Leg 1"],
    }));

    // Group data by date and sum the values
    const groupedData = combinedData.reduce(
      (acc, curr) => {
        const { date, notionalAmount, notionalQuantity } = curr;

        if (acc[date]) {
          acc[date].notionalAmount += notionalAmount;
          acc[date].notionalQuantity += notionalQuantity;
        } else {
          acc[date] = {
            date,
            notionalAmount,
            notionalQuantity,
          };
        }

        return acc;
      },
      {} as Record<string, any>,
    );

    const result = Object.values(groupedData);

    result?.sort(
      (a, b) => new Date(a?.date).getTime() - new Date(b?.date).getTime(),
    );

    const dates = result?.map((item) => item?.date);
    const notionalAmount = result?.map((item) => item?.notionalAmount);
    const notionalQuantity = result?.map((item) => item?.notionalQuantity);

    const totalNotionalAmount = notionalAmount?.reduce(
      (acc, item) => acc + item,
      0,
    );
    avgNotionalAmount = totalNotionalAmount / notionalAmount?.length;

    const totalNotionalQuantity = notionalQuantity?.reduce(
      (acc, item) => acc + item,
      0,
    );
    avgNotionalQuantity = totalNotionalQuantity / notionalQuantity?.length;

    const option = {
      silent: true,
      tooltip: {
        trigger: "axis",
        hideDelay: 100,
      },
      animation: false,
      grid: {
        left: "3%",
        right: "3%",
        bottom: "0%",
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLabel: {
          color: "#fff",
        },
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
        },
        {
          type: "value",
          splitLine: {
            show: false,
          },
          position: "right",
          axisLabel: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: "Notional Amount",
          type: "scatter",
          data: dates?.map((date, index) => [date, notionalAmount[index]]),
          itemStyle: {
            color: "#8F54F4",
          },
        },
        {
          name: "Notional Quantity",
          type: "scatter",
          data: dates?.map((date, index) => [date, notionalQuantity[index]]),
          yAxisIndex: 1,
          itemStyle: {
            color: "#fff",
          },
        },
      ],
    };

    return option;
  }

  async function getSwapData(ticker: string) {
    const cachedData = getCache(ticker, "getSwapData");
    if (cachedData) {
      rawData = cachedData;
    } else {
      try {
        const postData = { ticker, path: "swap-ticker" };
        const response = await fetch("/api/ticker-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });
        if (!response.ok) throw new Error("API request failed");
        rawData = await response.json();
        setCache(ticker, rawData, "getSwapData");
      } catch (error) {
        console.error("Failed to fetch swap data:", error);
        rawData = [];
      }
    }
    $swapComponent = rawData?.length !== 0; // Correct the use of `$`
  }

  $: if ($stockTicker && typeof window !== "undefined") {
    isLoaded = false;
    activeIdx = 0;
    getSwapData($stockTicker).then(() => {
      optionsData = getPlotOptions("effectiveDate");
      isLoaded = true;
    });
  }

  $: charNumber = $screenWidth < 640 ? 20 : 40;
</script>

<section class="overflow-hidden text-white h-full pb-8">
  <main class="overflow-hidden">
    <div class="flex flex-row items-center">
      <label
        for="swapInfo"
        class="mr-1 cursor-pointer flex flex-row items-center text-white text-xl sm:text-3xl font-bold"
      >
        Swap Data
      </label>
      <InfoModal
        title={"Swap Data"}
        content={"Swaps in the stock market are derivative contracts to exchange cash flows or assets, used for risk management, speculation, and enhancing market liquidity."}
        id={"swapInfo"}
      />
    </div>

    {#if isLoaded}
      {#if rawData?.length !== 0}
        <div class="w-full flex flex-col items-start">
          <div class="text-white text-[1rem] mt-2 mb-2 w-full">
            The swap data from the past 100 days shows an average notional
            amount of {abbreviateNumber(avgNotionalAmount, true)} and an average
            notional quantity of {abbreviateNumber(avgNotionalQuantity)}.
          </div>
        </div>

        <div class="pb-2 rounded-md bg-default">
          <div
            class="bg-secondary w-fit relative flex flex-wrap items-center justify-center rounded-md p-1 mt-4"
          >
            {#each tabs as item, i}
              <button
                on:click={() => changeTab(i)}
                class="group relative z-1 rounded-full px-3 py-1 {activeIdx ===
                i
                  ? 'z-0'
                  : ''} "
              >
                {#if activeIdx === i}
                  <div class="absolute inset-0 rounded-md bg-[#fff]"></div>
                {/if}
                <span class="relative text-sm block duration-200 text-white">
                  {item.title}
                </span>
              </button>
            {/each}
          </div>

          <div class="app w-full h-[300px] mt-5">
            <Chart {init} options={optionsData} class="chart" />
          </div>
        </div>

        <div
          class="flex flex-row items-center justify-between mx-auto mt-5 w-full sm:w-11/12"
        >
          <div
            class="mt-3.5 sm:mt-0 flex flex-col sm:flex-row items-center ml-3 sm:ml-0 w-1/2 justify-center"
          >
            <div
              class="h-full transform -translate-x-1/2"
              aria-hidden="true"
            ></div>
            <div
              class="w-3 h-3 bg-[#8F54F4] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
              aria-hidden="true"
            ></div>
            <span
              class="mt-2 sm:mt-0 text-white text-center sm:text-start text-xs sm:text-md inline-block"
            >
              Notional Amount
            </span>
          </div>

          <div
            class="flex flex-col sm:flex-row items-center ml-3 sm:ml-0 w-1/2 justify-center"
          >
            <div
              class="h-full transform -translate-x-1/2"
              aria-hidden="true"
            ></div>
            <div
              class="w-3 h-3 bg-[#fff] border-4 box-content border-[#27272A] rounded-full transform sm:-translate-x-1/2"
              aria-hidden="true"
            ></div>
            <span
              class="mt-2 sm:mt-0 text-white text-xs sm:text-md sm: inline-block"
            >
              Notional Quantity
            </span>
          </div>
        </div>
      {/if}
    {:else}
      <div class="flex justify-center items-center h-80">
        <div class="relative">
          <label
            class="bg-secondary rounded-md h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <span class="loading loading-spinner loading-md text-gray-400"
            ></span>
          </label>
        </div>
      </div>
    {/if}
  </main>
</section>

<style>
  .app {
    height: 300px;
    max-width: 100%; /* Ensure chart width doesn't exceed the container */
  }

  @media (max-width: 640px) {
    .app {
      height: 210px;
    }
  }

  .chart {
    width: 100%;
  }
</style>
