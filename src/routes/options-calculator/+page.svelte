<script lang="ts">
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import SEO from "$lib/components/SEO.svelte";
  import { onMount, onDestroy } from "svelte";
  import { abbreviateNumber, buildOptionSymbol } from "$lib/utils";
  import { setCache, getCache, screenWidth } from "$lib/store";
  import { Combobox } from "bits-ui";
  import InfoModal from "$lib/components/InfoModal.svelte";
  import Link from "lucide-svelte/icons/square-arrow-out-up-right";
  import Trash from "lucide-svelte/icons/trash";
  import { toast } from "svelte-sonner";

  import { mode } from "mode-watcher";
  import highcharts from "$lib/highcharts.ts";

  // Types
  type Strategy = {
    name: string;
    sentiment: string;
    description: string;
  };

  type OptionLeg = {
    action: string;
    quantity: number;
    date: string;
    strike: number;
    optionType: string;
    optionPrice: number;
  };

  type SearchResult = {
    symbol: string;
    type: string;
  };

  export let data;

  // State variables with proper types
  let isLoaded = false;
  let shouldUpdate = false;
  let config: any = null;

  // Strategy selection
  let selectedStrategy = "Long Call";
  let selectedOptionType = "Call";
  let selectedTicker = "TSLA";
  let assetType = "stocks";
  let selectedAction = "Buy";
  let selectedOptionPrice: number;
  let selectedQuantity = 1;
  let debounceTimeout: ReturnType<typeof setTimeout>;

  // Market data
  let currentStockPrice: number;
  let optionData: Record<string, any> = {};
  let dateList: string[] = [];
  let selectedDate: string;
  let strikeList: number[] = [];
  let selectedStrike: number;

  // Option information
  let optionSymbol: string;
  let breakEvenPrice: number | null = null;
  let totalPremium: number;
  let limits: Record<string, string> = {};
  let rawData: Record<string, any> = {};

  // Search variables
  let searchBarData: SearchResult[] = [];
  let timeoutId: ReturnType<typeof setTimeout>;
  let inputValue = "";
  let touchedInput = false;

  // Strategy definitions
  const prebuiltStrategy: Strategy[] = [
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
        "In a long put strategy, an investor purchases a put option, expecting that the price of the underlying asset will decrease and generate a profit from the option's increased value. Investors typically use a long put strategy when they have a bearish outlook on the stock.",
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
        "In this strategy, an investor sells a put option, expecting that the price of the underlying asset will remain stable or increase, allowing the investor to keep the premium received from selling the option. Investors typically use a short put strategy when they have a neutral to bullish outlook on the stock and and views a potential assignment as an opportunity to buy the asset at a desirable price.",
    },
    // Other strategies commented out in original code
  ];

  let userStrategy: OptionLeg[] = [];
  let description = prebuiltStrategy[0]?.description;

  // STRATEGY FUNCTIONS

  async function changeStrategy(strategy: Strategy) {
    selectedStrategy = strategy?.name;
    description = strategy?.description;

    // Set appropriate option type and action based on strategy
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

    await loadData("default");
    shouldUpdate = true;
  }

  // PAYOFF CALCULATION FUNCTIONS

  const payoffFunctions = {
    "Buy Call": (s: number, strike: number, premium: number) =>
      s < strike ? -premium : (s - strike) * 100 * selectedQuantity - premium,

    "Sell Call": (s: number, strike: number, premium: number) =>
      s < strike ? premium : premium - (s - strike) * 100 * selectedQuantity,

    "Buy Put": (s: number, strike: number, premium: number) =>
      s > strike ? -premium : (strike - s) * 100 * selectedQuantity - premium,

    "Sell Put": (s: number, strike: number, premium: number) =>
      s > strike ? premium : premium - (strike - s) * 100 * selectedQuantity,
  };

  // Define break-even calculators for each scenario (using per-share price)
  const breakEvenCalculators = {
    "Buy Call": (strike: number, optionPrice: number) => strike + optionPrice,
    "Sell Call": (strike: number, optionPrice: number) => strike + optionPrice,
    "Buy Put": (strike: number, optionPrice: number) => strike - optionPrice,
    "Sell Put": (strike: number, optionPrice: number) => strike - optionPrice,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  function plotData() {
    // Determine x-axis range based on current stock price and max leg strike
    if (!userStrategy || userStrategy.length === 0) {
      return null;
    }

    const maxLegStrike = Math.max(...userStrategy.map((leg) => leg.strike));
    const xMin = 0;
    const xMax = Math.floor(Math.max(currentStockPrice, maxLegStrike) * 3);
    const step = 10;

    // Calculate the total premium across all legs
    totalPremium = userStrategy.reduce((sum, leg) => {
      return sum + leg.optionPrice * 100 * leg.quantity;
    }, 0);

    // Compute the aggregated payoff at each underlying price
    const dataPoints = [];
    for (let s = xMin; s <= xMax; s += step) {
      let aggregatedPayoff = 0;
      userStrategy.forEach((leg) => {
        const legPremium = leg.optionPrice * 100 * leg.quantity;
        const scenarioKey = `${leg.action} ${leg.optionType}`;
        if (payoffFunctions[scenarioKey]) {
          aggregatedPayoff += payoffFunctions[scenarioKey](
            s,
            leg.strike,
            legPremium,
          );
        } else {
          console.error(
            "Payoff function not implemented for scenario:",
            scenarioKey,
          );
        }
      });
      dataPoints.push([s, aggregatedPayoff]);
    }

    // Calculate break-even and limits for single-leg strategies
    calculateBreakEvenAndLimits();

    // Build the chart options
    const options = {
      credits: { enabled: false },
      chart: {
        type: "area",
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
        labels: { style: { color: $mode === "light" ? "#545454" : "white" } },
        plotLines: [
          // Underlying Price line
          {
            value: currentStockPrice,
            color: $mode === "light" ? "black" : "white",
            dashStyle: "Dash",
            width: 1.5,
            label: {
              text: `<span class="text-black dark:text-white text-sm">Underlying Price $${currentStockPrice}</span>`,
              style: { color: $mode === "light" ? "black" : "white" },
            },
            zIndex: 5,
          },
          // Only add a breakeven line if there is a single leg
          breakEvenPrice !== null
            ? {
                value: breakEvenPrice,
                color: "#10B981",
                dashStyle: "Dash",
                width: $screenWidth < 640 ? 0 : 1.5,
                label: {
                  text: `<span class="hidden sm:block text-black dark:text-white text-sm">Breakeven $${breakEvenPrice.toFixed(
                    2,
                  )}</span>`,
                  style: { color: $mode === "light" ? "black" : "white" },
                },
                zIndex: 5,
              }
            : null,
        ].filter((line) => line !== null),
      },
      yAxis: {
        title: {
          text: "<span class='hidden sm:block'>Expected Profit/Loss ($)</span>",
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
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        style: { color: "#fff", fontSize: "16px", padding: "10px" },
        borderRadius: 2,
        formatter: function () {
          const underlyingPrice = this.x;
          const profitLoss = this.y;
          const underlyingPctChange =
            ((underlyingPrice - currentStockPrice) / currentStockPrice) * 100;
          const profitLossPctChange =
            totalPremium !== 0 ? (profitLoss / totalPremium) * 100 : 0;
          return `
          <div class="flex flex-col items-start text-sm">
            <div>
              <span class="text-start font-semibold">Underlying Price:</span> 
              $${underlyingPrice} 
              (<span>${underlyingPctChange.toFixed(2)}%</span>)
            </div>
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
          marker: { enabled: false },
          animation: false,
        },
        series: {
          zoneAxis: "y",
          zones: [
            {
              value: 0,
              color: "#E02424",
              fillColor: "rgba(224,36,36,0.5)",
            },
            {
              color: "#10B981",
              fillColor: "rgba(16,185,129,0.5)",
            },
          ],
        },
      },
      legend: { enabled: false },
      series: [
        {
          name: "Payoff",
          data: dataPoints,
        },
      ],
    };

    return options;
  }

  function calculateBreakEvenAndLimits() {
    let totalPremium = 0;
    let overallMaxProfit = 0;
    let overallMaxLoss = 0;
    let unlimitedProfit = false;
    let unlimitedLoss = false;

    // Loop through each leg in the strategy
    for (let i = 0; i < userStrategy.length; i++) {
      const leg = userStrategy[i];
      totalPremium += leg.optionPrice; // accumulate total premium
      const scenarioKey = `${leg?.action} ${leg?.optionType}`;

      let legProfit = 0;
      let legLoss = 0;

      // Determine limits for each leg based on its scenario
      if (scenarioKey === "Buy Call") {
        // Profit is unlimited for a long call, loss limited to the premium paid.
        legProfit = Infinity;
        legLoss = -leg.optionPrice;
        unlimitedProfit = true;
      } else if (scenarioKey === "Sell Call") {
        // Profit is limited to the premium received; loss is unlimited.
        legProfit = leg.optionPrice;
        legLoss = -Infinity;
        unlimitedLoss = true;
      } else if (scenarioKey === "Buy Put") {
        // For a long put, profit is (strike * 100) minus the premium, loss is the premium paid.
        legProfit = leg.strike * 100 - leg.optionPrice;
        legLoss = -leg.optionPrice;
      } else if (scenarioKey === "Sell Put") {
        // For a short put, profit is the premium received, loss is (strike * 100 - premium).
        legProfit = leg.optionPrice;
        legLoss = -(leg.strike * 100 - leg.optionPrice);
      } else {
        console.error("Limits not defined for scenario:", scenarioKey);
        // Defaulting to zero contribution if unknown
        legProfit = 0;
        legLoss = 0;
      }

      // Sum only the finite numbers. If any leg is unlimited, the corresponding flag is set.
      if (isFinite(legProfit)) {
        overallMaxProfit += legProfit;
      }
      if (isFinite(legLoss)) {
        overallMaxLoss += legLoss;
      }
    }

    // Format the aggregated limits: if any leg was unlimited, set overall accordingly.
    limits = {
      maxProfit: unlimitedProfit
        ? "Unlimited"
        : `$${formatCurrency(overallMaxProfit)}`,
      maxLoss: unlimitedLoss
        ? "Unlimited"
        : `$${formatCurrency(overallMaxLoss)}`,
    };

    // For break-even price, if there's exactly one leg, compute it; otherwise, set it to null.
    if (userStrategy.length === 1) {
      const leg = userStrategy[0];
      const scenarioKey = `${leg?.action} ${leg?.optionType}`;
      if (breakEvenCalculators[scenarioKey]) {
        breakEvenPrice = breakEvenCalculators[scenarioKey](
          leg.strike,
          leg.optionPrice,
        );
      }
    }
  }

  // Helper function for currency formatting
  function formatCurrency(value: number): string {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // DATA LOADING FUNCTIONS

  const getContractHistory = async (contractId: string) => {
    const cacheKey = contractId;
    const cachedData = getCache(cacheKey, "getContractHistory");

    if (cachedData) {
      return cachedData;
    }

    try {
      const postData = {
        ticker: selectedTicker,
        contract: contractId,
      };

      const response = await fetch("/api/options-contract-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch contract history: ${response.statusText}`,
        );
      }

      const output = await response.json();
      setCache(cacheKey, output, "getContractHistory");
      return output;
    } catch (error) {
      console.error("Error fetching contract history:", error);
      return { history: [{ mark: 0 }] };
    }
  };

  async function loadData(state: string) {
    if (!rawData?.getData) {
      console.error("rawData is undefined or invalid in loadData");
      return;
    }

    isLoaded = false;

    try {
      if (userStrategy?.length > 0) {
        for (const item of userStrategy) {
          optionData = rawData?.getData[item?.optionType] || {};
          selectedOptionType = item?.optionType || "Call";
          selectedQuantity = item?.quantity || 1;
          dateList = Object.keys(optionData);
          item.dateList = dateList;

          // Make sure selectedDate exists in the data
          if (!dateList.includes(item?.date) && dateList.length > 0) {
            selectedDate = dateList[0];
            item.date = selectedDate;
          }

          strikeList = optionData[selectedDate] || [];
          item.strikeList = strikeList;

          // Find closest strike to current stock price
          if (!strikeList.includes(selectedStrike) && strikeList.length > 0) {
            selectedStrike = strikeList.reduce((closest, strike) => {
              return Math.abs(strike - currentStockPrice) <
                Math.abs(closest - currentStockPrice)
                ? strike
                : closest;
            }, strikeList[0]);
          }

          item.strike = selectedStrike;

          // Get option price
          optionSymbol = buildOptionSymbol(
            selectedTicker,
            selectedDate,
            selectedOptionType,
            selectedStrike,
          );

          const output = await getContractHistory(optionSymbol);
          selectedOptionPrice = output?.history?.at(-1)?.mark || 0;
          item.optionPrice = selectedOptionPrice;
        }
      } else {
        optionData = rawData?.getData[selectedOptionType] || {};
        dateList = Object.keys(optionData);

        // Make sure selectedDate exists in the data
        if (!dateList.includes(selectedDate) && dateList.length > 0) {
          selectedDate = dateList[0];
        }

        strikeList = optionData[selectedDate] || [];

        // Find closest strike to current stock price
        if (!strikeList.includes(selectedStrike) && strikeList.length > 0) {
          selectedStrike = strikeList.reduce((closest, strike) => {
            return Math.abs(strike - currentStockPrice) <
              Math.abs(closest - currentStockPrice)
              ? strike
              : closest;
          }, strikeList[0]);
        }

        // Get option price
        optionSymbol = buildOptionSymbol(
          selectedTicker,
          selectedDate,
          selectedOptionType,
          selectedStrike,
        );

        const output = await getContractHistory(optionSymbol);
        selectedOptionPrice = output?.history?.at(-1)?.mark || 0;

        // Update user strategy if necessary
        if (state === "default") {
          userStrategy = [
            {
              date: selectedDate,
              strike: selectedStrike,
              optionType: selectedOptionType,
              optionPrice: selectedOptionPrice,
              action: selectedAction,
              quantity: selectedQuantity,
              strikeList: strikeList,
              dateList: dateList,
            },
          ];
        }
      }

      shouldUpdate = true;
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      isLoaded = true;
    }
  }

  async function getStockData() {
    try {
      const postData = { ticker: selectedTicker };
      const response = await fetch("/api/options-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stock data: ${response.statusText}`);
      }

      rawData = (await response.json()) || {};
      currentStockPrice = rawData?.getStockQuote?.price || 0;

      // Initialize option data
      if (rawData?.getData) {
        optionData = rawData.getData[selectedOptionType] || {};
        dateList = Object.keys(optionData);

        if (dateList.length > 0) {
          selectedDate = dateList[0];
          strikeList = optionData[selectedDate] || [];

          // Select strike closest to current stock price
          if (strikeList.length > 0) {
            selectedStrike = strikeList.reduce((closest, strike) => {
              return Math.abs(strike - currentStockPrice) <
                Math.abs(closest - currentStockPrice)
                ? strike
                : closest;
            }, strikeList[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  }

  async function handleAddOptionLeg() {
    if (userStrategy.length === 0) {
      userStrategy = [
        {
          action: selectedAction,
          quantity: selectedQuantity,
          date: selectedDate,
          strike: selectedStrike,
          optionType: selectedOptionType,
          optionPrice: selectedOptionPrice,
        },
      ];
    } else {
      const lastLeg = userStrategy[userStrategy.length - 1];
      const newLeg = { ...lastLeg }; // Create a shallow copy
      userStrategy = [...userStrategy, newLeg];
    }
    shouldUpdate = true;
  }

  function handleDeleteOptionLeg(index) {
    if (userStrategy?.length === 1) {
      toast.error("At least one option leg is required!", {
        style: `border-radius: 5px; background: #fff; color: #000; border-color: ${$mode === "light" ? "#F9FAFB" : "#4B5563"}; font-size: 15px;`,
      });
    } else {
      userStrategy = [
        ...userStrategy.slice(0, index),
        ...userStrategy.slice(index + 1),
      ];
      if (userStrategy?.length === 0) {
        changeStrategy(prebuiltStrategy?.at(0));
      }
      shouldUpdate = true;
    }
  }

  async function handleOptionType(index) {
    if (index !== undefined && userStrategy[index]) {
      // Update the specific leg in userStrategy
      const updatedStrategy = [...userStrategy];
      updatedStrategy[index].optionType =
        updatedStrategy[index].optionType === "Call" ? "Put" : "Call";
      userStrategy = updatedStrategy;
    } else {
      // Update the selectedAction (for new legs)
      selectedOptionType = selectedOptionType === "Call" ? "Put" : "Call";
    }
    shouldUpdate = true;
  }

  async function handleAction(index: number) {
    if (index !== undefined && userStrategy[index]) {
      // Update the specific leg in userStrategy
      const updatedStrategy = [...userStrategy];
      updatedStrategy[index].action =
        updatedStrategy[index].action === "Buy" ? "Sell" : "Buy";
      userStrategy = updatedStrategy;
    } else {
      // Update the selectedAction (for new legs)
      selectedAction = selectedAction === "Buy" ? "Sell" : "Buy";
    }
    shouldUpdate = true;
  }

  async function handleExpirationDate(date, index) {
    selectedDate = date;
    if (index !== undefined && userStrategy[index]) {
      // Update the specific leg in userStrategy
      const updatedStrategy = [...userStrategy];
      updatedStrategy[index].date = selectedDate;
      userStrategy = updatedStrategy;
      shouldUpdate = true;
    }
  }
  async function handleStrikePrice(strikePrice, index: number) {
    selectedStrike = strikePrice;
    if (index !== undefined && userStrategy[index]) {
      // Update the specific leg in userStrategy
      const updatedStrategy = [...userStrategy];
      updatedStrategy[index].strike = selectedStrike;
      userStrategy = updatedStrategy;
      shouldUpdate = true;
    }
  }

  function handleOptionPriceInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    selectedOptionPrice = value === "" ? null : +value;

    // Clear any existing debounce timeout
    if (debounceTimeout) clearTimeout(debounceTimeout);

    // Set a new debounce timeout
    debounceTimeout = setTimeout(() => {
      if (userStrategy.length > 0) {
        userStrategy = userStrategy.map((leg) => ({
          ...leg,
          optionPrice: selectedOptionPrice,
        }));
        shouldUpdate = true;
      }
    }, 300);
  }

  function handleQuantityInput(event, index) {
    if (index !== undefined && userStrategy[index]) {
      const value = (event.target as HTMLInputElement).value;

      selectedQuantity = value === "" ? null : +value;
      const updatedStrategy = [...userStrategy];
      updatedStrategy[index].quantity = updatedStrategy[index].quantity =
        selectedQuantity;
      userStrategy = updatedStrategy;
    }

    // Clear any existing debounce timeout
    if (debounceTimeout) clearTimeout(debounceTimeout);

    // Set a new debounce timeout
    debounceTimeout = setTimeout(() => {
      shouldUpdate = true;
    }, 300);
  }

  async function search() {
    clearTimeout(timeoutId); // Clear any existing timeout

    if (!inputValue.trim()) {
      // Skip if query is empty or just whitespace
      searchBarData = []; // Clear previous results
      return;
    }

    timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/searchbar?query=${encodeURIComponent(inputValue)}&limit=10`,
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        searchBarData = await response.json();
      } catch (error) {
        console.error("Error during search:", error);
        searchBarData = [];
      }
    }, 50); // delay
  }

  async function changeTicker(data: SearchResult) {
    if (!data?.symbol) return;

    selectedTicker = data.symbol;
    assetType = data?.type?.toLowerCase() || "stocks";

    await getStockData();
    await loadData("default");
    inputValue = "";
  }

  // LIFECYCLE FUNCTIONS

  onMount(async () => {
    await getStockData();
    await loadData("default");

    shouldUpdate = true;
  });

  onDestroy(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    if (timeoutId) clearTimeout(timeoutId);
  });

  // REACTIVE STATEMENTS

  $: {
    if (shouldUpdate) {
      shouldUpdate = false;
      config = plotData();
      isLoaded = true;
    }
  }

  $: {
    if ($mode) {
      config = plotData();
    }
  }

  // Watch for changes to inputValue and trigger search
  $: {
    if (inputValue) {
      search();
    }
  }
</script>

<SEO
  title="Options Calculator: Calculate Options Profit, Breakeven, and Risk-Reward"
  description="Use our free Options Calculator to calculate potential profit, breakeven prices, risk-reward ratios, and more for calls and puts. Perfect for traders and investors."
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
              {#each prebuiltStrategy as strategy}
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
              {#if isLoaded && config}
                <Combobox.Root
                  items={searchBarData}
                  bind:inputValue
                  bind:touchedInput
                >
                  <div class="relative w-full">
                    <Combobox.Input
                      on:input={search}
                      class="mb-3 text-sm controls-input bg-white dark:bg-default focus:outline-hidden  border border-gray-300 dark:border-gray-500 rounded placeholder:text-gray-600 dark:placeholder:text-gray-200 px-2 py-1.5 grow w-full max-w-48"
                      placeholder="Search Ticker"
                      aria-label="Search Ticker"
                    />
                  </div>
                  {#if inputValue?.length !== 0 && inputValue !== selectedTicker}
                    <Combobox.Content
                      class=" z-10 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-default px-1 py-3 shadow-sm outline-hidden"
                      sideOffset={8}
                    >
                      {#each searchBarData as searchItem}
                        <Combobox.Item
                          class="cursor-pointer border-b border-gray-300 dark:border-gray-500 last:border-none flex h-fit w-auto select-none items-center rounded-button py-1 px-2  text-sm capitalize outline-hidden transition-all duration-75 data-highlighted:bg-gray-200 dark:data-highlighted:bg-primary"
                          value={searchItem?.symbol}
                          label={searchItem?.symbol}
                          on:click={(e) => changeTicker(searchItem)}
                        >
                          <div class="flex flex-col items-start">
                            <span
                              class="text-sm text-blue-700 dark:text-blue-400"
                              >{searchItem?.symbol}</span
                            >
                            <span
                              class="text-xs sm:text-sm text-muted dark:text-white"
                              >{searchItem?.name}</span
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

                <!-- Table container -->
                <div
                  class="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded"
                >
                  <table
                    class="min-w-full divide-y divide-gray-200 dark:divide-gray-600 bg-[#F8F9FA] dark:bg-secondary"
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
                        <th
                          scope="col"
                          class="px-4 py-1.5 text-sm font-semibold"
                        ></th>
                      </tr>
                    </thead>

                    <!-- Table body -->
                    <tbody
                      class="bg-[#F8F9FA] dark:bg-secondary divide-y divide-gray-200 dark:divide-gray-800 text-sm"
                    >
                      {#each userStrategy as item, index}
                        <tr>
                          <td class="px-4 whitespace-nowrap font-semibold">
                            {selectedTicker}
                          </td>
                          <td class="px-4 whitespace-nowrap">
                            <label
                              on:click={() => handleAction(index)}
                              class="badge px-2 select-none rounded-md {item?.action ===
                              'Buy'
                                ? 'bg-green-100 text-green-800 dark:bg-green-300 dark:text-muted'
                                : 'bg-red-100 text-red-800 dark:bg-red-300 dark:text-muted'} font-semibold cursor-pointer"
                              >{item?.action}</label
                            >
                          </td>
                          <td class="px-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={userStrategy[index]?.quantity}
                              min="0"
                              on:input={(e) => handleQuantityInput(e, index)}
                              class="border border-gray-300 dark:border-gray-500 rounded px-2 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td class="px-4 whitespace-nowrap">
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild let:builder>
                                <Button
                                  builders={[builder]}
                                  class="mb-1 border border-gray-300 dark:border-none  bg-white dark:bg-[#000] h-[35px] flex flex-row justify-between items-center min-w-[130px] w-[140px] sm:w-auto  px-3  rounded-md truncate"
                                >
                                  <span class="truncate text-sm"
                                    >{formatDate(
                                      userStrategy[index]?.date,
                                    )}</span
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
                                  >{#each userStrategy[index]?.dateList as item}
                                    <DropdownMenu.Item
                                      on:click={() => {
                                        handleExpirationDate(item, index);
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
                          <td class="px-4 whitespace-nowrap">
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild let:builder>
                                <Button
                                  builders={[builder]}
                                  class="mb-1 border border-gray-300 dark:border-none  bg-white dark:bg-[#000] h-[35px] flex flex-row justify-between items-center min-w-[130px] w-[140px] sm:w-auto  px-3  rounded-md truncate"
                                >
                                  <span class="truncate text-sm"
                                    >{userStrategy[index]?.strike}</span
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
                                  {#each userStrategy[index]?.strikeList as item}
                                    <DropdownMenu.Item
                                      on:click={() => {
                                        handleStrikePrice(item, index);
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
                          <td class="px-4 whitespace-nowrap">
                            <label
                              on:click={() => handleOptionType(index)}
                              class="select-none badge px-2 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-300 dark:text-muted font-semibold cursor-pointer"
                              >{item?.optionType}</label
                            >
                          </td>
                          <td class="px-4 whitespace-nowrap">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={userStrategy[index]?.optionPrice}
                              on:input={handleOptionPriceInput}
                              class="border border-gray-300 dark:border-gray-500 rounded px-2 py-1 w-24 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td class="px-4 whitespace-nowrap">
                            <div
                              class="flex flex-row items-center m-auto text-center justify-center"
                            >
                              <a
                                class="inline-block"
                                href={`/${["stocks", "stock"]?.includes(assetType) ? "stocks" : assetType === "etf" ? "etf" : "index"}/${selectedTicker}/options/contract-lookup?query=${optionSymbol}`}
                              >
                                <Link
                                  class="w-4 h-4 text-gray-800 dark:text-gray-100 mt-0.5"
                                />
                              </a>
                              <label
                                on:click={() => handleDeleteOptionLeg(index)}
                                class="ml-3 inline-block cursor-pointer"
                              >
                                <Trash
                                  class="w-4 h-4 text-gray-800 dark:text-gray-100"
                                />
                              </label>
                            </div>
                          </td>
                        </tr>
                      {/each}

                      <button
                        type="button"
                        on:click={() => handleAddOptionLeg()}
                        class=" cursor-pointer mt-3 mb-3 ml-3 align-middle inline-flex items-center gap-x-1.5 rounded bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition duration-150 ease-in-out whitespace-nowrap"
                      >
                        <svg
                          class="-ml-0.5 h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                        Add Option Leg
                      </button>
                    </tbody>
                  </table>
                </div>

                <div
                  class="shadow-sm mt-5 border border-gray-300 dark:border-gray-800 rounded"
                  use:highcharts={config}
                ></div>

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
                    {#each userStrategy as item}
                      <div>
                        {userStrategy?.length > 2
                          ? "Custom Strategy"
                          : selectedStrategy}
                      </div>
                      <div
                        class="{item?.action === 'Buy'
                          ? 'text-green-800'
                          : 'text-red-800'} dark:text-white font-semibold"
                      >
                        {item?.action?.toUpperCase()} +{item?.quantity}
                        {selectedTicker}
                        {formatDate(item?.date)}
                        {item?.strike}
                        {item?.optionType} @${item?.optionPrice}
                      </div>
                    {/each}
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
                          >${breakEvenPrice?.toFixed(2)}</span
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
                          >${totalPremium?.toLocaleString("en-US", {
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
