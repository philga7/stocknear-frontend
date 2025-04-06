<script lang="ts">
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import SEO from "$lib/components/SEO.svelte";
  import { onMount, onDestroy } from "svelte";
  import { abbreviateNumber, buildOptionSymbol } from "$lib/utils";
  import { setCache, getCache, screenWidth } from "$lib/store";
  import { Combobox } from "bits-ui";
  import InfoModal from "$lib/components/InfoModal.svelte";

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
  let selectedQuantity = 1;
  let debounceTimeout;

  let currentStockPrice;

  let optionData = {};
  let dateList = [];
  let selectedDate;
  let strikeList = [];
  let selectedStrike;

  let optionSymbol;
  let breakEvenPrice;
  let premium;
  let limits = {};
  let rawData = {};

  let searchBarData = [];
  let timeoutId;

  let inputValue = selectedTicker;
  let touchedInput = false;

  let strategies = [
    {
      name: "Long Call",
      sentiment: "Bullish",
      description:
        "In a long call strategy, an investor buys a call option, anticipating that the price of the underlying asset will increase and generate a profit from the option's higher value. Investors typically use a long call strategy when they have a bullish outlook on the stock.",
    },
    {
      name: "Long Put",
      sentiment: "Bearish",
      description:
        " In a long put strategy, an investor purchases a put option, expecting that the price of the underlying asset will decrease and generate a profit from the option's increased value. Investors typically use a long put strategy when they have a bearish outlook on the stock.",
    },
    {
      name: "Short Call",
      sentiment: "Bearish",
      description:
        "In this strategy, an investor sells a call option, anticipating that the price of the underlying asset will remain stable or decrease, allowing the investor to keep the premium received from selling the option. Investors typically use a short call strategy when they have a neutral to bearish outlook on the stock and to generate potential income.",
    },
    {
      name: "Short Put",
      sentiment: "Bullish",
      description:
        " In this strategy, an investor sells a put option, expecting that the price of the underlying asset will remain stable or increase, allowing the investor to keep the premium received from selling the option. Investors typically use a short put strategy when they have a neutral to bullish outlook on the stock and and views a potential assignment as an opportunity to buy the asset at a desirable price.",
    },
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
  let description = strategies?.at(0)?.description;

  function changeStrategy(strategy) {
    selectedStrategy = strategy?.name;
    description = strategy?.description;

    switch (selectedStrategy) {
      case "Long Call":
        selectedOptionType = "Call";
        selectedAction = "Buy";
        break;

      case "Short Call":
        selectedOptionType = "Call";
        selectedAction = "Sell";
        break;

      case "Long Put":
        selectedOptionType = "Put";
        selectedAction = "Buy";
        break;

      case "Short Put":
        selectedOptionType = "Put";
        selectedAction = "Sell";
        break;

      default:
        console.warn("Unknown strategy:", strategy);
        selectedOptionType = null;
        selectedAction = null;
    }

    config = plotData();
  }

  const payoffFunctions = {
    "Buy Call": (s, strike, premium) =>
      s < strike ? -premium : (s - strike) * 100 * selectedQuantity - premium,

    "Sell Call": (s, strike, premium) =>
      s < strike ? premium : premium - (s - strike) * 100 * selectedQuantity,

    "Buy Put": (s, strike, premium) =>
      s > strike ? -premium : (strike - s) * 100 * selectedQuantity - premium,

    "Sell Put": (s, strike, premium) =>
      s > strike ? premium : premium - (strike - s) * 100 * selectedQuantity,
  };

  // Define break-even calculators for each scenario (using per-share price)
  const breakEvenCalculators = {
    "Buy Call": (strike, optionPrice) => strike + optionPrice,
    "Sell Call": (strike, optionPrice) => strike + optionPrice,
    "Buy Put": (strike, optionPrice) => strike - optionPrice,
    "Sell Put": (strike, optionPrice) => strike - optionPrice,
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
    // total premium paid for 1 contract (premium is calculated per share times 100 shares)
    premium = selectedOptionPrice * 100 * selectedQuantity;

    // Create a key from the selected action and option type
    const scenarioKey = `${selectedAction} ${selectedOptionType}`;

    // Calculate break-even price per share using the mapping above.
    // Note: For display, we assume optionPrice is per share.
    breakEvenPrice;
    if (breakEvenCalculators[scenarioKey]) {
      breakEvenPrice = breakEvenCalculators[scenarioKey](
        selectedStrike,
        selectedOptionPrice,
      );
    } else {
      console.error("Break-even scenario not implemented:", scenarioKey);
      breakEvenPrice = selectedStrike; // default fallback
    }

    limits = {};
    if (scenarioKey === "Buy Call") {
      limits = {
        maxProfit: "Unlimited",
        maxLoss: `-$${premium?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      };
    } else if (scenarioKey === "Sell Call") {
      limits = {
        maxProfit: `$${premium?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        maxLoss: "Unlimited",
      };
    } else if (scenarioKey === "Buy Put") {
      limits = {
        // Maximum profit when underlying goes to 0
        maxProfit: `$${(selectedStrike * 100 - premium)?.toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        )}`,
        maxLoss: `-$${premium?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      };
    } else if (scenarioKey === "Sell Put") {
      limits = {
        maxProfit: `$${premium?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        // Maximum loss when underlying goes to 0
        maxLoss: `-$${(selectedStrike * 100 - premium)?.toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        )}`,
      };
    } else {
      console.error("Limits not defined for scenario:", scenarioKey);
      limits = { maxProfit: "n/a", maxLoss: "n/a" };
    }

    const dataPoints = [];
    const xMin = 0;
    const xMax = Math.floor(Math.max(currentStockPrice, selectedStrike) * 3);
    const step = 10;

    if (payoffFunctions[scenarioKey]) {
      for (let s = xMin; s <= xMax; s += step) {
        // For each price point, calculate payoff based on the scenario.
        const payoff = payoffFunctions[scenarioKey](s, selectedStrike, premium);
        dataPoints.push([s, payoff]);
      }
    } else {
      console.error(
        "Payoff function not implemented for scenario:",
        scenarioKey,
      );
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
        text: `<h3 class="mt-1"></h3>`,
        useHTML: true,
      },
      xAxis: {
        min: xMin,
        max: xMax,
        tickInterval: 50,
        title: {
          text: `${selectedTicker} Price at Expiration ($)`,
          style: { color: $mode === "light" ? "#545454" : "white" },
        },
        labels: {
          style: { color: $mode === "light" ? "#545454" : "white" },
        },
        plotLines: [
          // Underlying Price line
          {
            value: currentStockPrice,
            color: $mode === "light" ? "black" : "white",
            dashStyle: "Dash",
            width: 1.2,
            label: {
              text: `<span class="text-black dark:text-white">Underlying Price $${currentStockPrice}</span>`,
              style: { color: $mode === "light" ? "black" : "white" },
            },
            zIndex: 5,
          },
          {
            value: breakEvenPrice,
            color: "#10B981",
            dashStyle: "Dash",
            width: $screenWidth < 640 ? 0 : 1.2,
            label: {
              text: `<span class="hidden sm:block text-black dark:text-white">Breakeven $${breakEvenPrice.toFixed(2)}</span>`,
              style: { color: $mode === "light" ? "black" : "white" },
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
            return abbreviateNumber(this.value.toFixed(2));
          },
        },
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
        borderRadius: 2,
        formatter: function () {
          const underlyingPrice = this.x;
          const profitLoss = this.y;
          // Calculate percentage change for underlying price relative to currentStockPrice
          const underlyingPctChange =
            ((underlyingPrice - currentStockPrice) / currentStockPrice) * 100;
          // Calculate profit/loss percentage relative to the total premium paid
          const profitLossPctChange = (profitLoss / premium) * 100;

          return `
          <div class="flex flex-col items-start text-sm">
            <div>
              <span class="text-start font-semibold">Underlying Price:</span> 
              $${underlyingPrice} 
              (<span>${underlyingPctChange.toFixed(2)}%</span>)
            </div>
            <br>
          <div class="">
            <span class="text-start font-semibold">Profit or Loss:</span> 
            ${profitLoss < 0 ? "-$" : "$"}${Math.abs(profitLoss).toLocaleString("en-US")} 
            (<span>${profitLossPctChange.toFixed(2)}%</span>)
          </div>
          </div>
        `;
        },
      },
      plotOptions: {
        area: {
          fillOpacity: 0.2,
          marker: {
            enabled: false,
          },
          animation: false,
        },
        series: {
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

  async function handleOptionType() {
    if (selectedOptionType === "Call") {
      selectedOptionType = "Put";
    } else {
      selectedOptionType = "Call";
    }
    await loadData("optionType");
  }
  async function handleAction() {
    if (selectedAction === "Buy") {
      selectedAction = "Sell";
    } else {
      selectedAction = "Buy";
    }

    config = plotData();
  }

  function handleOptionPriceInput(event) {
    selectedOptionPrice = +event.target.value;
    // Clear any existing debounce timeout
    if (debounceTimeout) clearTimeout(debounceTimeout);

    // Set a new debounce timeout (1 second)
    debounceTimeout = setTimeout(() => {
      config = plotData();
    }, 500);
  }

  function handleQuantityInput(event) {
    selectedQuantity = +event.target.value;
    // Clear any existing debounce timeout
    if (debounceTimeout) clearTimeout(debounceTimeout);

    // Set a new debounce timeout (1 second)
    debounceTimeout = setTimeout(() => {
      config = plotData();
    }, 500);
  }

  async function search() {
    clearTimeout(timeoutId); // Clear any existing timeout

    if (!inputValue.trim()) {
      // Skip if query is empty or just whitespace
      searchBarData = []; // Clear previous results
      return;
    }

    timeoutId = setTimeout(async () => {
      const response = await fetch(
        `/api/searchbar?query=${encodeURIComponent(inputValue)}&limit=10`,
      );
      searchBarData = await response?.json();
    }, 50); // delay
  }

  async function loadData(state: string) {
    if (!rawData || !rawData.getData) {
      console.error("rawData is undefined or invalid in loadData");
      return;
    }

    isLoaded = false;

    optionData = rawData?.getData[selectedOptionType];

    dateList = [...Object?.keys(optionData)];

    strikeList = [...optionData[selectedDate]];

    if (!strikeList?.includes(selectedStrike)) {
      selectedStrike = strikeList.reduce((closest, strike) => {
        return Math.abs(strike - currentStockPrice) <
          Math.abs(closest - currentStockPrice)
          ? strike
          : closest;
      }, strikeList[0]);
    }

    optionSymbol = buildOptionSymbol(
      selectedTicker,
      selectedDate,
      selectedOptionType,
      selectedStrike,
    );
    const output = await getContractHistory(optionSymbol);

    selectedOptionPrice = output?.history?.at(-1)?.mark;

    config = plotData();

    isLoaded = true;
  }

  async function getStockData() {
    const postData = { ticker: selectedTicker };
    const response = await fetch("/api/options-calculator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    rawData = (await response.json()) || {};

    currentStockPrice = rawData?.getStockQuote?.price;

    optionData = rawData?.getData[selectedOptionType];
    dateList = Object?.keys(optionData);
    selectedDate = Object?.keys(optionData)[0];
    strikeList = optionData[selectedDate] || [];
    selectedStrike = strikeList.reduce((closest, strike) => {
      return Math.abs(strike - currentStockPrice) <
        Math.abs(closest - currentStockPrice)
        ? strike
        : closest;
    }, strikeList[0]);
  }

  async function changeTicker(symbol) {
    selectedTicker = symbol;
    await getStockData();
    await loadData("default");
  }
  onMount(async () => {
    await getStockData();
    await loadData("default");
  });

  onDestroy(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
  });

  $: {
    if ($mode) {
      config = plotData();
    }
  }
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
                  on:click={() => changeStrategy(strategy)}
                  class="{selectedStrategy === strategy?.name
                    ? 'bg-blue-100 dark:bg-primary text-muted'
                    : ''} text-sm elect-none flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1 text-blue-700 dark:text-white dark:sm:hover:text-white sm:hover:text-muted cursor-pointer"
                >
                  <span>{strategy.name}</span>
                  {#if strategy?.sentiment}
                    <span
                      class="badge px-2 text-xs rounded-full {strategy.sentiment ===
                      'Bullish'
                        ? 'bg-green-100 text-green-800 dark:bg-green-300 dark:text-black'
                        : 'bg-red-100 text-red-800 dark:bg-red-300 dark:text-black'}"
                      >{strategy.sentiment}</span
                    >
                  {/if}
                </div>
              {/each}
            </div>
            <div class="border-b border-gray-400 mt-5"></div>
            <h2 class="mt-5 mb-1 text-xl sm:text-2xl font-bold">
              {selectedStrategy}
            </h2>
            <p class="mt-3">
              {description}
            </p>

            <div class="mt-4">
              <!-- Table header -->

              <!-- Table container -->
              <div
                class="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded"
              >
                <table
                  class="min-w-full divide-y divide-gray-200 dark:divide-gray-600"
                >
                  <!-- Table head -->
                  <thead class="bg-gray-50 dark:bg-secondary">
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
                    </tr>
                  </thead>

                  <!-- Table body -->
                  <tbody
                    class="bg-[#F8F9FA] dark:bg-secondary divide-y divide-gray-200 dark:divide-gray-800 text-sm"
                  >
                    <!-- Example Option Leg Row -->
                    <tr>
                      <td class="px-4 py-3 whitespace-nowrap font-semibold">
                        <Combobox.Root
                          items={searchBarData}
                          bind:inputValue
                          bind:touchedInput
                        >
                          <div class="relative w-full">
                            <Combobox.Input
                              on:input={search}
                              class="text-sm controls-input bg-white dark:bg-[#2A2E39] focus:outline-hidden  border border-gray-300 dark:border-gray-500 rounded placeholder:text-gray-600 dark:placeholder:text-gray-200 px-2 py-1.5 grow w-full min-w-54"
                              placeholder="Search Ticker"
                              aria-label="Search new stock"
                            />
                          </div>
                          {#if inputValue?.length !== 0 && inputValue !== selectedTicker}
                            <Combobox.Content
                              class=" z-10 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-default px-1 py-3 shadow-sm outline-hidden"
                              sideOffset={8}
                            >
                              {#each searchBarData as item}
                                <Combobox.Item
                                  class="cursor-pointer border-b border-gray-300 dark:border-gray-500 last:border-none flex h-fit w-auto select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm capitalize outline-hidden transition-all duration-75 data-highlighted:bg-gray-200 dark:data-highlighted:bg-primary"
                                  value={item?.symbol}
                                  label={item?.symbol}
                                  on:click={(e) => changeTicker(item?.symbol)}
                                >
                                  <div class="flex flex-col items-start">
                                    <span
                                      class="text-sm text-blue-700 dark:text-blue-400"
                                      >{item?.symbol}</span
                                    >
                                    <span
                                      class="text-xs sm:text-sm text-muted dark:text-white"
                                      >{item?.name}</span
                                    >
                                  </div>
                                </Combobox.Item>
                              {:else}
                                <span class="block px-5 py-2 text-sm">
                                  No results found
                                </span>
                              {/each}
                            </Combobox.Content>
                          {/if}
                        </Combobox.Root>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <label
                          on:click={handleAction}
                          class="badge px-2 select-none rounded-md {selectedAction ===
                          'Buy'
                            ? 'bg-green-100 text-green-800 dark:bg-green-300 dark:text-muted'
                            : 'bg-red-100 text-red-800 dark:bg-red-300 dark:text-muted'} font-semibold cursor-pointer"
                          >{selectedAction}</label
                        >
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          bind:value={selectedQuantity}
                          on:input={handleQuantityInput}
                          class="border border-gray-300 dark:border-gray-500 rounded px-2 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                          class="select-none badge px-2 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-300 dark:text-muted font-semibold cursor-pointer"
                          >{selectedOptionType}</label
                        >
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.1"
                          bind:value={selectedOptionPrice}
                          on:input={handleOptionPriceInput}
                          class="border border-gray-300 dark:border-gray-500 rounded px-2 py-1 w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      <!--
                      <td class="px-4 py-3 whitespace-nowrap">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value="0.30"
                          class="accent-blue-500 w-24"
                        />
                      </td>
                      -->
                      <!--
                      <td class="px-4 py-3 whitespace-nowrap">
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
                      -->
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
                  <h1
                    class="text-2xl font-bold text-gray-800 dark:text-white mb-6"
                  >
                    Trade Information
                  </h1>

                  <!-- Trade Information Card -->
                  <div
                    class="border border-gray-300 dark:border-gray-800 rounded-lg p-4 mb-6 shadow-sm max-w-sm"
                  >
                    <div>{selectedStrategy}</div>
                    <div class="text-green-800 dark:text-white font-semibold">
                      {selectedAction?.toUpperCase()} +{selectedQuantity}
                      {selectedTicker}
                      {formatDate(selectedDate)}
                      {selectedStrike}
                      {selectedOptionType} @${selectedOptionPrice}
                    </div>
                  </div>

                  <!-- Stock Section -->
                  <h2
                    class="text-xl font-bold text-gray-800 dark:text-white mb-4"
                  >
                    Stock
                  </h2>
                  <div class="grid grid-cols-2 sm:grid-cols-4 mb-6">
                    <div>
                      <div class="text-gray-600 dark:text-white">
                        {selectedTicker} Current Price
                      </div>
                      <div class="flex items-baseline">
                        <span class="text-lg font-semibold"
                          >${currentStockPrice}</span
                        >
                      </div>
                    </div>

                    <div>
                      <div
                        class="flex items-center text-gray-600 dark:text-white"
                      >
                        {selectedTicker} Breakeven Price
                        <InfoModal
                          title="Breakeven Price"
                          id="breakevenModal"
                          content="The stock price at which an options position will neither make nor lose money."
                        />
                      </div>
                      <div class="flex items-baseline">
                        <span class="text-lg font-semibold"
                          >${breakEvenPrice}</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Trade Details Section -->
                  <h2
                    class="text-xl font-bold text-gray-800 dark:text-white mb-4"
                  >
                    Trade Details
                  </h2>
                  <div
                    class="grid grid-cols-2 md:grid-cols-4 gap-y-6 sm:gap-y-0 mb-6"
                  >
                    <div>
                      <div
                        class="flex items-center text-gray-600 dark:text-white"
                      >
                        Cost of Trade
                        <InfoModal
                          title="Cost of Trade"
                          id="premModal"
                          content="The Cost of Trade refers to the total amount needed to open a position. For options, buying a contract creates a net debit (positive cost), while selling a contract creates a net credit (negative cost)."
                        />
                      </div>
                      <div class="flex items-baseline">
                        <span class="text-lg font-semibold"
                          >${premium?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div
                        class="flex items-center text-gray-600 dark:text-white"
                      >
                        Maximum Profit
                        <InfoModal
                          title="Maximum Profit"
                          id="maxProfitModal"
                          content="Maximum Profit is the highest possible gain from an options position or strategy. For long positions, profit is unlimited for calls and capped for puts (if the stock drops to zero). For short positions, profit is limited to the premium received, achieved if the option expires worthless or is repurchased at a lower price."
                        />
                      </div>
                      <div
                        class="text-lg font-semibold text-green-800 dark:text-green-400"
                      >
                        {limits?.maxProfit}
                      </div>
                    </div>

                    <div>
                      <div
                        class="flex items-center text-gray-600 dark:text-white"
                      >
                        Maximum Loss
                        <InfoModal
                          title="Maximum Loss"
                          id="maxLossModal"
                          content="Maximum Loss is the worst possible financial outcome of an options position. For long calls or puts, it’s limited to the premium paid. For naked calls, losses can be unlimited due to unlimited upside risk. For naked puts, the maximum loss is the strike price minus the premium if the stock drops to zero. In defined-risk spreads, it’s the difference between strike prices minus net premium received or paid."
                        />
                      </div>
                      <div
                        class="text-lg font-semibold text-red-600 dark:text-red-400"
                      >
                        {limits?.maxLoss}
                      </div>
                    </div>
                  </div>
                  <!--
                <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Probability Analysis
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-4 mb-6">
                  <div>
                    <div class="flex items-center text-gray-600 dark:text-white">
                      Probability of Profit (PoP)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 ml-1"
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
                    <div class="flex items-center text-gray-600 dark:text-white">
                      Probability of Max Profit
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 ml-1"
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
                    <div class="flex items-center text-gray-600 dark:text-white">
                      Probability of Max Loss
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 ml-1"
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

                <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Risk Reward Analysis
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div class="flex items-center text-gray-600 dark:text-white">
                      Expected Value (EV)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 ml-1"
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
                    <div class="flex items-center text-gray-600 dark:text-white">
                      Expected Return (EV/risk)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 ml-1"
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
                    <div class="flex items-center text-gray-600 dark:text-white">
                      Reward/Risk
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 ml-1"
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
                  class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center"
                >
                  Position Greeks
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 ml-1"
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
                    <div class="flex items-center text-gray-600 dark:text-white">
                      Delta (Δ)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 ml-1"
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
                    <div class="flex items-center text-gray-600 dark:text-white">
                      Gamma (Γ)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 ml-1"
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
                    <div class="flex items-center text-gray-600 dark:text-white">
                      Theta (Θ)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 ml-1"
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
                    <div class="flex items-center text-gray-600 dark:text-white">
                      Vega (v)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 ml-1"
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
