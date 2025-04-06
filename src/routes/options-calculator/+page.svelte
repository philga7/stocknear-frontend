<script lang="ts">
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import SEO from "$lib/components/SEO.svelte";
  import { onMount } from "svelte";
  import { buildOptionSymbol } from "$lib/utils";
  import { setCache, getCache } from "$lib/store";

  import { mode } from "mode-watcher";
  import highcharts from "$lib/highcharts.ts";

  export let data;
  let isLoaded = true;

  let config = null;
  let selectedStrategy = "Long Call";
  let selectedOptionType = "Call";
  let selectedTicker = "TSLA";
  let selectedAction = "Buy";
  let selectedOptionPrice;

  let optionData = data?.getData[selectedOptionType];
  let dateList = Object?.keys(optionData);
  let selectedDate = Object?.keys(optionData)[0];
  let strikeList = optionData[selectedDate] || [];
  let selectedStrike = strikeList?.at(0) || [];
  let optionSymbol;

  let strategies = [
    { name: "Long Call", sentiment: "Bullish" },
    { name: "Long Put", sentiment: "Bearish" },
    { name: "Short Call", sentiment: "Bearish" },
    { name: "Short Put", sentiment: "Bullish" },
    /*
    { name: "Custom Strategy", sentiment: "" },
    { name: "Covered Call", sentiment: "Bullish" },
    { name: "Protective Put", sentiment: "Bullish" },
    { name: "Cash Secured Put", sentiment: "Bullish" },
    { name: "Bull Call Spread", sentiment: "Bullish" },
    { name: "Bull Put Spread", sentiment: "Bullish" },
    { name: "Bear Call Spread", sentiment: "Bearish" },
    { name: "Bear Put Spread", sentiment: "Bearish" },
    { name: "Collar", sentiment: "Neutral" },
    { name: "Iron Condor", sentiment: "Neutral" },
    { name: "Calendar Spread", sentiment: "Neutral" },
    { name: "Covered Combination", sentiment: "Neutral" },
    { name: "Long Call Butterfly", sentiment: "Neutral" },
    { name: "Long Straddle", sentiment: "Neutral" },
    { name: "Short Straddle", sentiment: "Neutral" },
     */
  ];

  const tradeInfo = {
    type: "Long Call",
    details: "BUY +1 TSLA Apr 11, 2025 280.0 call @$30.0",
    currentPrice: "$239.34",
    breakEvenPrice: "$310.00",
    costOfTrade: "$3,000.00",
    maxProfit: "Unlimited",
    maxLoss: "-$3,000.00",
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  function plotData() {
    const action = "Buy";
    const optionType = "Call";

    const strikePrice = 230;
    const numOfQuantities = 1;
    const currentStockPrice = 239;
    const cost = 30.13;
    const premium = cost * 100 * numOfQuantities; // total premium paid for 1 contract
    const breakEven = strikePrice + cost;

    // 1) Build payoff data from 0 to 600 (in steps of 10)
    const dataPoints = [];
    const xMin = 0;
    const xMax = 600;
    const step = 10;

    for (let s = xMin; s <= xMax; s += step) {
      // Payoff for a long call:
      // If underlying price < strike, payoff = -premium
      // Else payoff = (underlying - strike)*100 - premium
      const payoff =
        s < strikePrice ? -premium : (s - strikePrice) * 100 - premium;

      dataPoints.push([s, payoff]);
    }

    const options = {
      credits: {
        enabled: false,
      },
      chart: {
        type: "area", // or "line"
        backgroundColor: $mode === "light" ? "#fff" : "#09090B",
        plotBackgroundColor: $mode === "light" ? "#fff" : "#09090B",
        height: 400,
        animation: false,
      },
      title: {
        text: null,
      },
      xAxis: {
        // numeric axis from 0 to 600
        min: xMin,
        max: xMax,
        tickInterval: 50,
        title: {
          text: "TSLA Price at Expiration ($)",
          style: { color: $mode === "light" ? "#545454" : "white" },
        },
        labels: {
          style: { color: $mode === "light" ? "#545454" : "white" },
        },
        plotLines: [
          // Strike Price
          {
            value: currentStockPrice,
            color: "black",
            dashStyle: "Dash",
            width: 1.2,
            label: {
              text: `<span class="text-black dark:text-white">Underlying Price $${currentStockPrice}</span>`,
            },
            zIndex: 5,
          },
          // Break-Even
          {
            value: breakEven,
            color: "#10B981",
            dashStyle: "Dash",
            width: 1.2,
            label: {
              text: `<span class="text-black dark:text-white">Breakeven $${breakEven?.toFixed(2)}</span>`,
            },
            zIndex: 5,
          },
        ],
      },
      yAxis: {
        title: {
          text: "Expected Profit/Loss ($)",
          style: { color: $mode === "light" ? "#545454" : "white" },
        },
        gridLineWidth: 1,
        gridLineColor: $mode === "light" ? "#e5e7eb" : "#111827",
        labels: {
          style: { color: $mode === "light" ? "#545454" : "white" },
          formatter: function () {
            return "$" + this.value.toFixed(0);
          },
        },
        // If you want symmetrical around zero, set min/max or startOnTick/endOnTick
        // startOnTick: false,
        // endOnTick: false,
      },
      tooltip: {
        shared: true,
        backgroundColor: $mode === "light" ? "#f9fafb" : "#1f2937",
        borderColor: "#6b7280",
        style: {
          color: $mode === "light" ? "black" : "white",
        },
        formatter: function () {
          return `
            <b>TSLA Price: $${this.x}</b><br/>
            P/L: $${this.y?.toLocaleString("en-US")}
          `;
        },
      },
      plotOptions: {
        area: {
          // Fill the area below the line
          fillOpacity: 0.2,
          marker: {
            enabled: false,
          },
          animation: false,
        },
        series: {
          // Zone coloring based on profit/loss
          zoneAxis: "y",
          zones: [
            {
              value: 0, // below $0 -> red
              color: "#E02424",
              fillColor: "rgba(224,36,36,0.5)",
            },
            {
              color: "#10B981", // above $0 -> green
              fillColor: "rgba(16,185,129,0.5)",
            },
          ],
        },
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: "Payoff",
          data: dataPoints,
        },
      ],
    };

    return options;
  }

  const getContractHistory = async (contractId) => {
    let output;
    const cachedData = getCache(contractId, "getContractHistory");
    if (cachedData) {
      output = cachedData;
    } else {
      const postData = {
        ticker: selectedTicker,
        contract: contractId,
      };

      // make the POST request to the endpoint
      const response = await fetch("/api/options-contract-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      output = await response.json();

      setCache(contractId, output, "getContractHistory");
    }

    return output;
  };

  async function loadData(state: string) {
    isLoaded = false;
    optionData = data?.getData[selectedOptionType];

    dateList = [...Object?.keys(optionData)];

    strikeList = [...optionData[selectedDate]];

    if (!strikeList?.includes(selectedStrike)) {
      selectedStrike = strikeList?.at(0); // Set to first element if not found
    }

    optionSymbol = buildOptionSymbol(
      selectedTicker,
      selectedDate,
      selectedOptionType,
      selectedStrike,
    );
    const output = await getContractHistory(optionSymbol);

    selectedOptionPrice = output?.history?.at(-1)?.mark;
    isLoaded = true;
  }

  function handleOptionType() {
    if (selectedOptionType === "Call") {
      selectedOptionType = "Put";
    } else {
      selectedOptionType = "Call";
    }
  }
  function handleAction() {
    if (selectedAction === "Buy") {
      selectedAction = "Sell";
    } else {
      selectedAction = "But";
    }
  }

  onMount(async () => {
    await loadData("default");
  });

  config = plotData();
</script>

<SEO
  title="Options Calculator: Real-Time Presidential Schedule, Executive Orders & Legislation"
  description="Track the President of the United States in real-time. Get updates on the POTUS schedule, executive orders, signed legislation, and official events."
/>

<section
  class="w-full max-w-3xl sm:max-w-[1400px] overflow-hidden min-h-screen pb-20 pt-5 px-4 lg:px-3 text-muted dark:text-white"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-muted dark:text-gray-300">Home</a></li>
      <li class="text-muted dark:text-gray-300">Options Calculator</li>
    </ul>
  </div>

  <div class="w-full flex h-full overflow-hidden">
    <div
      class="w-full relative flex justify-center items-center overflow-hidden"
    >
      <div
        class="relative flex flex-row justify-center items-start overflow-hidden w-full"
      >
        <div class="w-full mt-5">
          <div class="w-full">
            <div class="border-b-[2px] border-[#2C6288] dark:border-white">
              <h1 class="mb-1 text-2xl sm:text-3xl font-bold">
                Options Calculator
              </h1>
            </div>
          </div>

          <div class="mt-5 mb-5 w-fulll">
            <div class="flex flex-wrap gap-3 mt-4">
              {#each strategies as strategy}
                <div
                  on:click={() => (selectedStrategy = strategy?.name)}
                  class="{selectedStrategy === strategy?.name
                    ? 'bg-blue-100'
                    : ''} flex items-center space-x-2 border rounded-full px-3 py-1 text-sm font-medium border border-gray-300 cursor-pointer sm:hover:bg-blue-100 ease-out transition"
                >
                  <span>{strategy.name}</span>
                  {#if strategy?.sentiment}
                    <span
                      class="badge px-2 text-xs rounded-full bg-green-100 text-green-800"
                      >{strategy.sentiment}</span
                    >
                  {/if}
                </div>
              {/each}
            </div>
            <div class="border-b border-gray-400 mt-5"></div>
            <h2 class="mt-5 mb-1 text-xl sm:text-2xl font-bold">Long Call</h2>
            <p class="mt-3">
              In a long call strategy, an investor buys a call option,
              anticipating that the price of the underlying asset will increase
              and generate a profit from the option's higher value. Investors
              typically use a long call strategy when they have a bullish
              outlook on the stock.
            </p>

            <div class="mt-4">
              <!-- Table header -->

              <!-- Table container -->
              <div class="overflow-x-auto border rounded-md">
                <table class="min-w-full divide-y divide-gray-200">
                  <!-- Table head -->
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-4 py-1.5 text-left text-sm font-semibold"
                      >
                        Ticker
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-1.5 text-left text-sm font-semibold"
                      >
                        Action
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-1.5 text-left text-sm font-semibold"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-1.5 text-left text-sm font-semibold"
                      >
                        Expiration Date
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-1.5 text-left text-sm font-semibold"
                      >
                        Strike
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-1.5 text-left text-sm font-semibold"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-1.5 text-left text-sm font-semibold"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-1.5 text-left text-sm font-semibold"
                      >
                        Delta
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-1.5 text-left text-sm font-semibold"
                      >
                        Adjustment
                      </th>
                      <th
                        scope="col"
                        class="px-4 py-1.5 text-left text-sm font-semibold"
                      ></th>
                    </tr>
                  </thead>

                  <!-- Table body -->
                  <tbody class="bg-[#F8F9FA] divide-y divide-gray-200 text-sm">
                    <!-- Example Option Leg Row -->
                    <tr>
                      <td class="px-4 py-3 whitespace-nowrap font-bold">
                        TSLA
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <label
                          on:click={handleAction}
                          class="badge px-2 select-none rounded-md {selectedAction ===
                          'Buy'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'} font-semibold cursor-pointer"
                          >{selectedAction}</label
                        >
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value="1"
                          class="border border-gray-300 rounded px-2 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild let:builder>
                            <Button
                              builders={[builder]}
                              class="mb-1 border border-gray-300 dark:border-none  bg-white dark:bg-[#000] h-[35px] flex flex-row justify-between items-center min-w-[130px] w-[140px] sm:w-auto  px-3  rounded-md truncate"
                            >
                              <span class="truncate text-sm"
                                >{formatDate(selectedDate)}</span
                              >
                              <svg
                                class="-mr-1 ml-2 h-5 w-5 inline-block"
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
                            class="w-auto max-w-60 max-h-[400px] overflow-y-auto scroller relative"
                          >
                            <!-- Dropdown items -->
                            <DropdownMenu.Group class="pb-2"
                              >{#each dateList as item}
                                <DropdownMenu.Item
                                  on:click={() => {
                                    selectedDate = item;
                                    loadData("default");
                                  }}
                                  class="sm:hover:bg-gray-200 dark:sm:hover:bg-primary cursor-pointer "
                                >
                                  {formatDate(item)}
                                </DropdownMenu.Item>
                              {/each}</DropdownMenu.Group
                            >
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild let:builder>
                            <Button
                              builders={[builder]}
                              class="mb-1 border border-gray-300 dark:border-none  bg-white dark:bg-[#000] h-[35px] flex flex-row justify-between items-center min-w-[130px] w-[140px] sm:w-auto  px-3  rounded-md truncate"
                            >
                              <span class="truncate text-sm"
                                >{selectedStrike}</span
                              >
                              <svg
                                class="-mr-1 ml-2 h-5 w-5 inline-block"
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
                            class="w-auto max-w-60 max-h-[400px] overflow-y-auto scroller relative"
                          >
                            <!-- Dropdown items -->
                            <DropdownMenu.Group class="pb-2">
                              <!-- Added padding to avoid overlapping with Reset button -->
                              {#each strikeList as item}
                                <DropdownMenu.Item
                                  on:click={() => {
                                    selectedStrike = item;
                                    loadData("default");
                                  }}
                                  class="sm:hover:bg-gray-200 dark:sm:hover:bg-primary cursor-pointer "
                                >
                                  {item}
                                </DropdownMenu.Item>
                              {/each}
                            </DropdownMenu.Group>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <label
                          on:click={handleOptionType}
                          class="select-none badge px-2 rounded-md bg-blue-100 text-blue-800 font-semibold cursor-pointer"
                          >{selectedOptionType}</label
                        >
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          value={selectedOptionPrice}
                          class="border border-gray-300 rounded px-2 py-1 w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.01"
                          value="0.30"
                          class="border border-gray-300 rounded px-2 py-1 w-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <!-- Example slider -->
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value="0.30"
                          class="accent-blue-500 w-24"
                        />
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <!-- Example delete or settings icon (SVG) -->
                        <button class="text-gray-500 hover:text-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>

                    <!-- Add more rows as needed -->
                  </tbody>
                </table>
              </div>
              {#if isLoaded}
                {#if config}
                  <div
                    class="shadow-sm mt-5 border border-gray-300 dark:border-gray-800 rounded"
                    use:highcharts={config}
                  ></div>
                {/if}

                <div class="mt-5">
                  <h1 class="text-2xl font-bold text-gray-800 mb-6">
                    Trade Information
                  </h1>

                  <!-- Trade Information Card -->
                  <div
                    class="border border-gray-300 dark:border-gray-800 rounded-lg p-4 mb-6 shadow-sm max-w-sm"
                  >
                    <div>Long Call</div>
                    <div class="text-green-800 font-semibold">
                      BUY +1 TSLA Apr 11, 2025 280.0 call @$30.0
                    </div>
                  </div>

                  <!-- Stock Section -->
                  <h2 class="text-xl font-bold text-gray-800 mb-4">Stock</h2>
                  <div class="grid grid-cols-2 sm:grid-cols-4 mb-6">
                    <div>
                      <div class="text-gray-600">TSLA Current Price</div>
                      <div class="flex items-baseline">
                        <span class="text-lg font-semibold"
                          >{tradeInfo.currentPrice}</span
                        >
                      </div>
                    </div>

                    <div>
                      <div class="flex items-center text-gray-600">
                        TSLA Breakeven Price
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div class="flex items-baseline">
                        <span class="text-lg font-semibold"
                          >{tradeInfo.breakEvenPrice}</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Trade Details Section -->
                  <h2 class="text-xl font-bold text-gray-800 mb-4">
                    Trade Details
                  </h2>
                  <div
                    class="grid grid-cols-2 md:grid-cols-4 gap-y-6 sm:gap-y-0 mb-6"
                  >
                    <div>
                      <div class="flex items-center text-gray-600">
                        Cost of Trade
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div class="flex items-baseline">
                        <span class="text-lg font-semibold"
                          >{tradeInfo.costOfTrade}</span
                        >
                      </div>
                    </div>

                    <div>
                      <div class="flex items-center text-gray-600">
                        Maximum Profit
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div class="text-lg font-semibold text-green-800">
                        {tradeInfo.maxProfit}
                      </div>
                    </div>

                    <div>
                      <div class="flex items-center text-gray-600">
                        Maximum Loss
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div class="text-lg font-semibold text-red-600">
                        {tradeInfo.maxLoss}
                      </div>
                    </div>
                  </div>
                  <!--
                <h2 class="text-xl font-bold text-gray-800 mb-4">
                  Probability Analysis
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-4 mb-6">
                  <div>
                    <div class="flex items-center text-gray-600">
                      Probability of Profit (PoP)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div class="text-xl text-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center text-gray-600">
                      Probability of Max Profit
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div class="text-xl text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center text-gray-600">
                      Probability of Max Loss
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div class="text-xl text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <h2 class="text-xl font-bold text-gray-800 mb-4">
                  Risk Reward Analysis
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div class="flex items-center text-gray-600">
                      Expected Value (EV)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div class="text-xl text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center text-gray-600">
                      Expected Return (EV/risk)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div class="text-xl text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center text-gray-600">
                      Reward/Risk
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div class="text-xl text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <h2
                  class="text-xl font-bold text-gray-800 mb-4 flex items-center"
                >
                  Position Greeks
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <div class="flex items-center text-gray-600">
                      Delta (Δ)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div class="text-xl text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center text-gray-600">
                      Gamma (Γ)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div class="text-xl text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center text-gray-600">
                      Theta (Θ)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div class="text-xl text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center text-gray-600">
                      Vega (v)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div class="text-xl text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                -->
                </div>
              {:else}
                <div class="flex justify-center items-center h-80">
                  <div class="relative">
                    <label
                      class="shadow-sm bg-gray-300 dark:bg-secondary rounded h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <span
                        class="loading loading-spinner loading-md text-muted dark:text-gray-400"
                      ></span>
                    </label>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
