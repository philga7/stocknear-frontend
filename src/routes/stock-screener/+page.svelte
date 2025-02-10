<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { clearCache, screenWidth, getCache, setCache } from "$lib/store";
  import toast from "svelte-french-toast";
  import {
    abbreviateNumber,
    sectorList,
    industryList,
    listOfRelevantCountries,
    groupScreenerRules,
  } from "$lib/utils";
  import * as DropdownMenu from "$lib/components/shadcn/dropdown-menu/index.js";
  import { Button } from "$lib/components/shadcn/button/index.js";
  import TableHeader from "$lib/components/Table/TableHeader.svelte";
  import DownloadData from "$lib/components/DownloadData.svelte";
  import Infobox from "$lib/components/Infobox.svelte";
  import Input from "$lib/components/Input.svelte";
  import SEO from "$lib/components/SEO.svelte";

  //const userConfirmation = confirm('Unsaved changes detected. Leaving now will discard your strategy. Continue?');

  import { writable } from "svelte/store";

  let shouldLoadWorker = writable(false);
  export let data;
  export let form;
  let showFilters = true;
  let isLoaded = false;
  let syncWorker: Worker | undefined;
  let downloadWorker: Worker | undefined;
  let searchQuery = "";
  let infoText = {};
  let tooltipTitle;

  $: testList = [];

  let strategyList = data?.getAllStrategies;
  let selectedStrategy = strategyList?.at(0)?.id ?? "";
  let ruleOfList = strategyList?.at(0)?.rules ?? [];
  let groupedRules = {};
  let displayRules = [];
  let selectedPopularStrategy = "";
  let displayTableTab = "general";
  let otherTabRules = [];

  let stockScreenerData = data?.getStockScreenerData?.filter((item) =>
    Object?.values(item)?.every(
      (value) =>
        value !== null &&
        value !== undefined &&
        (typeof value !== "object" ||
          Object?.values(value)?.every(
            (subValue) => subValue !== null && subValue !== undefined,
          )),
    ),
  );

  // Define all possible rules and their properties
  const allRules = {
    avgVolume: {
      label: "Average Volume",
      step: ["100M", "10M", "1M", "100K", "10K", "1K", "0"],

      defaultCondition: "over",
      defaultValue: "any",
      category: ["Most Popular", "Price & Volume"],
    },
    volume: {
      label: "Volume",
      step: ["100M", "10M", "1M", "100K", "10K", "1K", "0"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Price & Volume",
    },
    rsi: {
      label: "Relative Strength Index",
      step: [90, 80, 70, 60, 50, 40, 30, 20],
      category: "Technical Analysis",
      defaultCondition: "over",
      defaultValue: "any",
    },
    stochRSI: {
      label: "Stochastic RSI Fast",
      step: [90, 80, 70, 60, 50, 40, 30, 20],
      category: "Technical Analysis",
      defaultCondition: "over",
      defaultValue: "any",
    },
    mfi: {
      label: "Money Flow Index",
      step: [90, 80, 70, 60, 50, 40, 30, 20],
      category: "Technical Analysis",
      defaultCondition: "over",
      defaultValue: "any",
    },
    cci: {
      label: "Commodity Channel Index",
      step: [250, 200, 100, 50, 20, 0, -20, -50, -100, -200, -250],
      category: "Technical Analysis",
      defaultCondition: "over",
      defaultValue: "any",
    },
    atr: {
      label: "Average True Range",
      step: [20, 15, 10, 5, 3, 1],
      category: "Technical Analysis",
      defaultCondition: "over",
      defaultValue: "any",
    },
    sma20: {
      label: "SMA20",
      step: [
        "Stock Price > SMA20",
        "SMA20 > SMA50",
        "SMA20 > SMA100",
        "SMA20 > SMA200",
      ],
      category: "Technical Analysis",
      defaultValue: "any",
    },
    sma50: {
      label: "SMA50",
      step: [
        "Stock Price > SMA50",
        "SMA50 > SMA20",
        "SMA50 > SMA100",
        "SMA50 > SMA200",
      ],
      category: "Technical Analysis",
      defaultValue: "any",
    },
    sma100: {
      label: "SMA100",
      step: [
        "Stock Price > SMA100",
        "SMA100 > SMA20",
        "SMA100 > SMA50",
        "SMA100 > SMA200",
      ],
      category: "Technical Analysis",
      defaultValue: "any",
    },
    sma200: {
      label: "SMA200",
      step: [
        "Stock Price > SMA200",
        "SMA200 > SMA20",
        "SMA200 > SMA50",
        "SMA200 > SMA100",
      ],
      category: "Technical Analysis",
      defaultValue: "any",
    },
    ema20: {
      label: "EMA20",
      step: [
        "Stock Price > EMA20",
        "EMA20 > EMA50",
        "EMA20 > EMA100",
        "EMA20 > EMA200",
      ],
      category: "Technical Analysis",
      defaultValue: "any",
    },
    ema50: {
      label: "EMA50",
      step: [
        "Stock Price > EMA50",
        "EMA50 > EMA20",
        "EMA50 > EMA100",
        "EMA50 > EMA200",
      ],
      category: "Technical Analysis",
      defaultValue: "any",
    },
    ema100: {
      label: "EMA100",
      step: [
        "Stock Price > EMA100",
        "EMA100 > EMA20",
        "EMA100 > EMA50",
        "EMA100 > EMA200",
      ],
      category: "Technical Analysis",
      defaultValue: "any",
    },
    ema200: {
      label: "EMA200",
      step: [
        "Stock Price > EMA200",
        "EMA200 > EMA20",
        "EMA200 > EMA50",
        "EMA200 > EMA100",
      ],
      category: "Technical Analysis",
      defaultValue: "any",
    },
    grahamNumber: {
      label: "Graham Number",
      step: ["Price > Graham Number", "Price < Graham Number"],
      defaultValue: "any",
    },
    price: {
      label: "Stock Price",
      step: [1000, 500, 400, 300, 200, 150, 100, 80, 60, 50, 20, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Price & Volume",
    },

    change1W: {
      label: "Price Change 1W",
      step: ["20%", "10%", "5%", "1%", "-1%", "-5%", "-10%", "-20%"],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Performance",
    },
    change1M: {
      label: "Price Change 1M",
      step: [
        "100%",
        "50%",
        "20%",
        "10%",
        "5%",
        "1%",
        "-1%",
        "-5%",
        "-10%",
        "-20%",
        "-50%",
      ],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Performance",
    },
    change3M: {
      label: "Price Change 3M",
      step: [
        "100%",
        "50%",
        "20%",
        "10%",
        "5%",
        "1%",
        "-1%",
        "-5%",
        "-10%",
        "-20%",
        "-50%",
      ],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Performance",
    },
    change6M: {
      label: "Price Change 6M",
      step: [
        "100%",
        "50%",
        "20%",
        "10%",
        "5%",
        "1%",
        "-1%",
        "-5%",
        "-10%",
        "-20%",
        "-50%",
      ],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Performance",
    },
    change1Y: {
      label: "Price Change 1Y",
      step: [
        "100%",
        "50%",
        "20%",
        "10%",
        "5%",
        "1%",
        "-1%",
        "-5%",
        "-10%",
        "-20%",
        "-50%",
      ],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Performance",
    },
    change3Y: {
      label: "Price Change 3Y",
      step: [
        "100%",
        "50%",
        "20%",
        "10%",
        "5%",
        "1%",
        "-1%",
        "-5%",
        "-10%",
        "-20%",
        "-50%",
      ],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Performance",
    },
    marketCap: {
      label: "Market Cap",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
      category: ["Most Popular", "Valuation & Ratios"],
    },
    workingCapital: {
      label: "Working Capital",
      step: ["20B", "10B", "5B", "1B", "500M", "100M", "50M", "10M", "1M", "0"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    totalAssets: {
      label: "Total Assets",
      step: ["500B", "200B", "100B", "50B", "10B", "1B", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    tangibleAssetValue: {
      label: "Tangible Assets",
      step: ["500B", "200B", "100B", "50B", "10B", "1B", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    revenue: {
      label: "Revenue",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Revenue / Sales",
    },
    revenueGrowthYears: {
      label: "Revenue Growth Years",
      step: ["10", "5", "3", "1"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Revenue / Sales",
    },
    epsGrowthYears: {
      label: "EPS Growth Years",
      step: ["10", "5", "3", "1"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    netIncomeGrowthYears: {
      label: "Net Income Growth Years",
      step: ["10", "5", "3", "1"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Net Income",
    },
    grossProfitGrowthYears: {
      label: "Gross Profit Growth Years",
      step: ["10", "5", "3", "1"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Other Profits",
    },
    growthRevenue: {
      label: "Revenue Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: ["Most Popular", "Revenue / Sales"],
    },
    costOfRevenue: {
      label: "Cost of Revenue",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    growthCostOfRevenue: {
      label: "Cost of Revenue Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    costAndExpenses: {
      label: "Cost & Expenses",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    growthCostAndExpenses: {
      label: "Cost & Expenses Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    netIncome: {
      label: "Net Income",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Net Income",
    },
    growthNetIncome: {
      label: "Net Income Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Net Income",
    },
    grossProfit: {
      label: "Gross Profit",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Other Profits",
    },
    growthGrossProfit: {
      label: "Gross Profit Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Other Profits",
    },
    researchAndDevelopmentExpenses: {
      label: "Research & Development",
      step: ["10B", "1B", "100M", "10M", "1M", 0],

      defaultCondition: "over",
      defaultValue: "any",
    },
    growthResearchAndDevelopmentExpenses: {
      label: "R&D Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    payoutRatio: {
      label: "Payout Ratio",
      step: ["100%", "80%", "60%", "40%", "20%", "0%", "-20%", "-40%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Dividends",
    },
    dividendYield: {
      label: "Dividend Yield",
      step: ["50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: ["Most Popular", "Dividends"],
    },
    annualDividend: {
      label: "Annual Dividend",
      step: [10, 5, 3, 2, 1, 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Dividends",
    },
    dividendGrowth: {
      label: "Dividend Growth",
      step: ["50%", "20%", "10%", "5%", "3%", "2%", "1%", "0%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Dividends",
    },
    eps: {
      label: "EPS",
      step: [20, 15, 10, 5, 3, 2, 1, 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    growthEPS: {
      label: "EPS Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    interestIncome: {
      label: "Interest Income",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    interestExpense: {
      label: "Interest Expenses",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    growthInterestExpense: {
      label: "Interest Expenses Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    operatingExpenses: {
      label: "Operating Expenses",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    growthOperatingExpenses: {
      label: "Operating Expenses Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    ebit: {
      label: "EBIT",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    operatingIncome: {
      label: "Operating Income",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Other Profits",
    },
    growthOperatingIncome: {
      label: "Operating Income Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Other Profits",
    },
    growthFreeCashFlow: {
      label: "Free Cash Flow Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Cash Flow",
    },
    growthOperatingCashFlow: {
      label: "Operating Cash Flow Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Cash Flow",
    },
    growthStockBasedCompensation: {
      label: "Stock-Based Compensation Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    growthTotalLiabilities: {
      label: "Total Liabilities Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Debt",
    },
    growthTotalDebt: {
      label: "Total Debt Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Debt",
    },
    growthTotalStockholdersEquity: {
      label: "Shareholders Equity Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Shares Statistics",
    },
    researchDevelopmentRevenueRatio: {
      label: "R&D / Revenue",
      step: ["20%", "10%", "5%", "1%", "0%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Revenue / Sales",
    },

    cagr3YearRevenue: {
      label: "Revenue CAGR 3Y",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Revenue / Sales",
    },
    cagr5YearRevenue: {
      label: "Revenue CAGR 5Y",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Revenue / Sales",
    },
    cagr3YearEPS: {
      label: "EPS CAGR 3Y",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    cagr5YearEPS: {
      label: "EPS CAGR 5Y",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    returnOnInvestedCapital: {
      label: "Return On Invested Capital",
      step: ["100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    relativeVolume: {
      label: "Relative Volume",
      step: ["500%", "200%", "100%", "50%", "10%", "0%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Price & Volume",
    },
    institutionalOwnership: {
      label: "Institutional Ownership",
      step: ["90%", "80%", "70%", "60%", "50%", "40%", "30%", "20%", "10%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Shares Statistics",
    },
    pe: {
      label: "Price / Earnings (ttm)",
      step: [50, 40, 30, 20, 10, 5, 1],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    peg: {
      label: "PEG Ratio",
      step: [100, 10, 5, 3, 1, 0.5, 0],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    forwardPE: {
      label: "Forward PE",
      step: [50, 20, 10, 5, 1, 0, -1, -5, -10, -20, -50],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    forwardPS: {
      label: "Forward PS",
      step: [50, 20, 10, 5, 1, 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },

    priceToBookRatio: {
      label: "PB Ratio",
      step: [50, 40, 30, 20, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    priceToSalesRatio: {
      label: "PS Ratio",
      step: [50, 40, 30, 20, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    beta: {
      label: "Beta",
      step: [10, 5, 1, -5, -10],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Price & Volume",
    },
    ebitda: {
      label: "EBITDA",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    growthEBITDA: {
      label: "EBITDA Growth",
      step: ["200%", "100%", "50%", "20%", "10%", "5%", "1%"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    var: {
      label: "Value-at-Risk",
      step: ["-1%", "-5%", "-10%", "-15%", "-20%"],

      defaultCondition: "over",
      defaultValue: "-5%",
      category: "Performance",
    },
    //trendAnalysis: { label: 'AI Trend Analysis', step: ['80%','70%','60%','50%'], category: 'ai', defaultCondition: 'over', defaultValue: '50%' },
    //fundamentalAnalysis: { label: 'AI Fundamental Analysis', step: ['80%','70%','60%','50%'], category: 'ai', defaultCondition: 'over', defaultValue: '50%' },
    currentRatio: {
      label: "Current Ratio",
      step: [50, 40, 30, 20, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    quickRatio: {
      label: "Quick Ratio",
      step: [50, 40, 30, 20, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
    },
    debtEquityRatio: {
      label: "Debt / Equity",
      step: [50, 40, 30, 20, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Debt",
    },
    debtRatio: {
      label: "Debt Ratio",
      step: [1, 0.5, 0, -0.5, -1],

      defaultCondition: "over",
      defaultValue: -0.5,
      category: "Debt",
    },
    inventoryTurnover: {
      label: "Inventory Turnover",
      step: [200, 100, 50, 20, 10, 5, 3, 2, 1, 0],

      defaultCondition: "over",
      defaultValue: "any",
    },
    returnOnAssets: {
      label: "Return on Assets",
      step: [10, 8, 6, 4, 2, 1, 0, -2, -4, -6, -8, -10],

      defaultCondition: "over",
      defaultValue: "any",
    },
    returnOnEquity: {
      label: "Return on Equity",
      step: [10, 8, 6, 4, 2, 1, 0, -2, -4, -6, -8, -10],

      defaultCondition: "over",
      defaultValue: "any",
    },
    returnOnTangibleAssets: {
      label: "Return on Tangible Assets",
      step: [10, 8, 6, 4, 2, 1, 0, -2, -4, -6, -8, -10],

      defaultCondition: "over",
      defaultValue: "any",
    },
    enterpriseValue: {
      label: "Enterprise Value",
      step: ["100B", "50B", "10B", "1B", "300M", "100M", "10M"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    evSales: {
      label: "EV / Sales",
      step: [50, 20, 10, 5, 1, 0],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    evEarnings: {
      label: "EV / Earnings",
      step: [50, 20, 10, 5, 1, 0],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    evEBITDA: {
      label: "EV / EBITDA",
      step: [50, 20, 10, 5, 1, 0],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    evEBIT: {
      label: "EV / EBIT",
      step: [50, 20, 10, 5, 1, 0],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    evFCF: {
      label: "EV / FCF",
      step: [50, 20, 10, 5, 1, 0],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    freeCashFlowPerShare: {
      label: "FCF / Share",
      step: [10, 8, 6, 4, 2, 1, 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Cash Flow",
    },
    cashPerShare: {
      label: "Cash / Share",
      step: [50, 20, 10, 5, 1, 0, -1, -5, -10, -20, -50],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    priceToFreeCashFlowsRatio: {
      label: "Price / FCF",
      step: [50, 20, 10, 5, 1, 0, -1, -5, -10, -20, -50],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Cash Flow",
    },
    interestCoverage: {
      label: "Interest Coverage",
      step: [10, 5, 3, 2, 1, 0],

      defaultCondition: "over",
      defaultValue: "any",
    },
    sharesShort: {
      label: "Short Interest",
      step: ["50M", "20M", "10M", "5M", "1M", "500K"],

      defaultCondition: "over",
      defaultValue: "500K",
      category: "Short Selling Statistics",
    },
    shortRatio: {
      label: "Short Ratio",
      step: [10, 5, 3, 2, 1, 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Short Selling Statistics",
    },
    shortFloatPercent: {
      label: "Short % Float",
      step: ["50%", "30%", "20%", "10%", "5%", "1%", "0%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Short Selling Statistics",
    },
    shortOutStandingPercent: {
      label: "Short % Shares",
      step: ["50%", "30%", "20%", "10%", "5%", "1%", "0%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Short Selling Statistics",
    },
    failToDeliver: {
      label: "Fail to Deliver (FTD)",
      step: ["1M", "500K", "200K", "100K", "50K", "10K", "1K"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Short Selling Statistics",
    },
    relativeFTD: {
      label: "FTD / Avg. Volume",
      step: ["300%", "200%", "100%", "50%", "20%", "10%", "0%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Short Selling Statistics",
    },

    freeCashFlow: {
      label: "Free Cash Flow",
      step: ["50B", "10B", "1B", "100M", "10M", "1M", 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Cash Flow",
    },
    operatingCashFlow: {
      label: "Operating Cash Flow",
      step: ["50B", "10B", "1B", "100M", "10M", "1M", 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Cash Flow",
    },
    operatingCashFlowPerShare: {
      label: "Operating Cash Flow / Share",
      step: [50, 40, 30, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Cash Flow",
    },
    revenuePerShare: {
      label: "Revenue / Share",
      step: [50, 40, 30, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    netIncomePerShare: {
      label: "Net Income / Share",
      step: [50, 40, 30, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    shareholdersEquityPerShare: {
      label: "Shareholders Equity / Share",
      step: [50, 40, 30, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    interestDebtPerShare: {
      label: "Interest Debt / Share",
      step: [50, 40, 30, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Debt",
    },
    capexPerShare: {
      label: "CapEx / Share",
      step: [50, 40, 30, 10, 5, 1],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },

    freeCashFlowMargin: {
      label: "FCF Margin",
      step: [
        "80%",
        "50%",
        "20%",
        "10%",
        "5%",
        "0%",
        "-5%",
        "-10%",
        "-20%",
        "-50%",
      ],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Margins",
    },
    totalDebt: {
      label: "Total Debt",
      step: ["200B", "100B", "50B", "10B", "1B", "100M", "10M", "1M"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Debt",
    },
    cashFlowToDebtRatio: {
      label: "Cash Flow / Debt",
      step: [50, 40, 30, 20, 10, 5, 1],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Debt",
    },
    operatingCashFlowSalesRatio: {
      label: "Operating Cash Flow / Sales",
      step: [5, 3, 1, 0.5, 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    priceCashFlowRatio: {
      label: "Price / Cash Flow",
      step: [20, 15, 10, 5, 3, 1, 0],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    priceEarningsRatio: {
      label: "Price / Earnings",
      step: [100, 50, 20, 10, 5, 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: ["Most Popular", "Valuation & Ratios"],
    },
    priceEarningsToGrowthRatio: {
      label: "Price / Earnings Growth",
      step: [10, 5, 3, 2, 1, 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    stockBasedCompensation: {
      label: "Stock-Based Compensation",
      step: ["10B", "1B", "100M", "10M", "1M", 0],

      defaultCondition: "over",
      defaultValue: "any",
    },
    totalStockholdersEquity: {
      label: "Shareholders Equity",
      step: ["100B", "50B", "10B", "1B", "100M", "50M", "10M", "1M", 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Shares Statistics",
    },
    sharesQoQ: {
      label: "Shares Change (QoQ)",
      step: ["80%", "60%", "50%", "20%", "10%", "5%", "1%", "0.5%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Shares Statistics",
    },
    sharesYoY: {
      label: "Shares Change (YoY)",
      step: ["80%", "60%", "50%", "20%", "10%", "5%", "1%", "0.5%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Shares Statistics",
    },
    grossProfitMargin: {
      label: "Gross Margin",
      step: ["80%", "60%", "50%", "20%", "10%", "5%", "1%", "0.5%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Margins",
    },
    netProfitMargin: {
      label: "Profit Margin",
      step: ["80%", "60%", "50%", "20%", "10%", "5%", "1%", "0.5%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Margins",
    },
    pretaxProfitMargin: {
      label: "Pretax Margin",
      step: ["80%", "60%", "50%", "20%", "10%", "5%", "1%", "0.5%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Margins",
    },
    ebitdaMargin: {
      label: "EBITDA Margin",
      step: ["80%", "60%", "50%", "20%", "10%", "5%", "1%", "0.5%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Margins",
    },
    ebitMargin: {
      label: "EBIT Margin",
      step: ["80%", "60%", "50%", "20%", "10%", "5%", "1%", "0.5%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Margins",
    },
    operatingMargin: {
      label: "Operating Margin",
      step: ["80%", "60%", "50%", "20%", "10%", "5%", "1%", "0.5%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Margins",
    },
    longTermDebtToCapitalization: {
      label: "Long Term Debt / Market Cap",
      step: ["80%", "60%", "50%", "30%", "20%", "10%", "5%", "1%", "0.5%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Debt",
    },
    shortTermDebtToCapitalization: {
      label: "Short Term Debt / Market Cap",
      step: ["80%", "60%", "50%", "30%", "20%", "10%", "5%", "1%", "0.5%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Debt",
    },
    interestIncomeToCapitalization: {
      label: "Interest Income / Market Cap",
      step: ["80%", "60%", "50%", "30%", "20%", "10%", "5%", "1%", "0.5%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    assetTurnover: {
      label: "Asset Turnover",
      step: [5, 3, 2, 1, 0],

      defaultCondition: "over",
      defaultValue: "any",
    },
    earningsYield: {
      label: "Earnings Yield",
      step: ["20%", "15%", "10%", "5%", "0%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    freeCashFlowYield: {
      label: "FCF Yield",
      step: ["20%", "15%", "10%", "5%", "0%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Valuation & Ratios",
    },
    effectiveTaxRate: {
      label: "Effective Tax Rate",
      step: ["20%", "15%", "10%", "5%", "0%"],

      defaultCondition: "over",
      defaultValue: "any",
    },
    fixedAssetTurnover: {
      label: "Fixed Asset Turnover",
      step: [10, 5, 3, 2, 1, 0],

      defaultCondition: "over",
      defaultValue: "any",
    },
    sharesOutStanding: {
      label: "Shares Outstanding",
      step: ["10B", "5B", "1B", "100M", "50M", "10M", "1M"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Shares Statistics",
    },
    employees: {
      label: "Employees",
      step: ["500K", "300K", "200K", "100K", "10K", "1K", "100"],

      defaultCondition: "over",
      defaultValue: "100K",
      category: "Company Info",
    },
    revenuePerEmployee: {
      label: "Revenue Per Employee",
      step: ["5M", "3M", "2M", "1M", "500K", "100K", 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Company Info",
    },

    profitPerEmployee: {
      label: "Profit Per Employee",
      step: ["5M", "3M", "2M", "1M", "500K", "100K", 0],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Company Info",
    },
    totalLiabilities: {
      label: "Total Liabilities",
      step: ["500B", "200B", "100B", "50B", "10B", "1B", "100M", "10M", "1M"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Debt",
    },
    altmanZScore: {
      label: "Altman-Z-Score",
      step: [10, 5, 3, 1],

      defaultCondition: "over",
      defaultValue: "any",
    },
    piotroskiScore: {
      label: "Piotroski F-Score",
      step: [9, 8, 7, 6, 5, 4, 3, 2, 1],

      defaultCondition: "over",
      defaultValue: "any",
    },
    analystRating: {
      label: "Analyst Rating",
      step: ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"],
      defaultCondition: "",
      defaultValue: "any",
      category: ["Most Popular", "Forecasts, Analysts & Price Targets"],
    },
    analystCounter: {
      label: "Analyst Count",
      step: ["40", "30", "20", "10", "5", "0"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Forecasts, Analysts & Price Targets",
    },
    priceTarget: {
      label: "Price Target",
      step: ["1000", "500", "100", "10", "5", "1"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Forecasts, Analysts & Price Targets",
    },
    upside: {
      label: "Price Target Upside",
      step: ["100%", "50%", "20%", "10%", "5%", "0%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Forecasts, Analysts & Price Targets",
    },
    topAnalystRating: {
      label: "Top Analyst Rating",
      step: ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"],
      defaultCondition: "",
      defaultValue: "any",
      category: "Forecasts, Analysts & Price Targets",
    },
    topAnalystCounter: {
      label: "Top Analyst Count",
      step: ["10", "5", "3", "1"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Forecasts, Analysts & Price Targets",
    },
    topAnalystUpside: {
      label: "Top Analyst Price Target Upside",
      step: ["100%", "50%", "20%", "10%", "5%", "0%"],

      defaultCondition: "over",
      defaultValue: "any",
      category: "Forecasts, Analysts & Price Targets",
    },
    topAnalystPriceTarget: {
      label: "Top Analyst Price Target",
      step: ["1000", "500", "100", "10", "5", "1"],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Forecasts, Analysts & Price Targets",
    },
    halalStocks: {
      label: "Halal Stocks",
      step: ["Compliant", "Non-Compliant"],
      defaultCondition: "",
      defaultValue: "any",
    },
    score: {
      label: "AI Score",
      step: ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"],

      defaultCondition: "",
      defaultValue: "any",
      category: ["Most Popular", "Forecasts, Analysts & Price Targets"],
    },
    sector: {
      label: "Sector",
      step: sectorList,

      defaultCondition: "",
      defaultValue: "any",
      category: "Company Info",
    },
    industry: {
      label: "Industry",
      step: industryList,

      defaultCondition: "",
      defaultValue: "any",
      category: "Company Info",
    },
    country: {
      label: "Country",
      step: listOfRelevantCountries,

      defaultCondition: "",
      defaultValue: "any",
      category: "Company Info",
    },
    ivRank: {
      label: "IV Rank",
      step: [50, 30, 20, 10, 5, 1, 0],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Options Activity",
    },
    iv30d: {
      label: "IV 30d",
      step: [1, 0.5, 0.3, 0.1, 0],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Options Activity",
    },
    totalOI: {
      label: "Total OI",
      step: ["500K", "300K", "200K", "100K", "50K", "10K", "1K"],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Options Activity",
    },
    changeOI: {
      label: "Change OI",
      step: ["5K", "3K", "1K", "500", "300", "100"],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Options Activity",
    },
    callVolume: {
      label: "Call Volume",
      step: ["100K", "50K", "20K", "10K", "5K", "1K"],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Options Activity",
    },
    putVolume: {
      label: "Put Volume",
      step: ["100K", "50K", "20K", "10K", "5K", "1K"],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Options Activity",
    },
    pcRatio: {
      label: "P/C Ratio",
      step: [10, 5, 3, 2, 1, 0.5],
      defaultCondition: "over",
      defaultValue: "any",
      category: "Options Activity",
    },
  };

  let filteredData = [];
  let displayResults = [];
  let isSaved = false;

  // Generate allRows from allRules
  $: allRows = Object?.entries(allRules)
    ?.sort(([, a], [, b]) => a.label.localeCompare(b.label)) // Sort by label
    ?.map(([ruleName, ruleProps]) => ({
      rule: ruleName,
      ...ruleProps,
    }));

  let filteredGroupedRules;
  let searchTerm = "";

  let ruleName = "";

  // Define your default values

  let ruleCondition = {};
  let valueMappings = {};

  Object.keys(allRules).forEach((ruleName) => {
    ruleCondition[ruleName] = allRules[ruleName].defaultCondition;

    // Check if the default condition is "between"
    if (allRules[ruleName].defaultCondition === "between") {
      valueMappings[ruleName] = allRules[ruleName].defaultValue || [null, null];
    } else {
      valueMappings[ruleName] = allRules[ruleName].defaultValue;
    }
  });

  // Update ruleCondition and valueMappings based on existing rules
  ruleOfList?.forEach((rule) => {
    ruleCondition[rule.name] =
      rule.condition || allRules[rule.name].defaultCondition;
    valueMappings[rule.name] = rule.value || allRules[rule.name].defaultValue;
  });

  async function getInfoText(parameter, title) {
    tooltipTitle = title;
    const cachedData = getCache(parameter, "getInfoText");
    if (cachedData) {
      infoText = cachedData;
    } else {
      const postData = { parameter };
      const response = await fetch("/api/info-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      infoText = await response.json();
      setCache(parameter, infoText, "getInfoText");
    }
  }

  async function handleCreateStrategy() {
    if (data?.user?.tier === "Pro") {
      const closePopup = document.getElementById("addStrategy");
      closePopup?.dispatchEvent(new MouseEvent("click"));
    } else {
      goto("/pricing");
    }
  }

  async function handleDeleteStrategy() {
    const postData = { strategyId: selectedStrategy };

    const response = await fetch("/api/delete-strategy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();

    if (output === "success") {
      toast.success("Strategy deleted successfully!", {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });

      strategyList =
        strategyList?.filter((item) => item?.id !== selectedStrategy) ?? [];
      selectedStrategy = strategyList?.at(0)?.id ?? "";
      ruleOfList =
        strategyList?.find((item) => item.id === selectedStrategy)?.rules ?? [];
      ruleOfList.forEach((rule) => {
        ruleCondition[rule.name] =
          rule.condition || allRules[rule.name].defaultCondition;
        valueMappings[rule.name] =
          rule.value || allRules[rule.name].defaultValue;
      });
      if (ruleOfList?.length === 0) {
        filteredData = [];
        displayResults = [];
      }
      await updateStockScreenerData();
      checkedItems = new Map(
        ruleOfList
          ?.filter((rule) =>
            [
              "analystRating",
              "topAnalystRating",
              "halalStocks",
              "sector",
              "country",
              "score",
              "industry",
              "grahamNumber",
            ]?.includes(rule.name),
          ) // Only include specific rules
          ?.map((rule) => [rule.name, new Set(rule.value)]), // Create Map from filtered rules
      );
    } else if (output === "failure") {
      toast.error("Something went wrong. Please try again", {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });
    }
  }

  async function createStrategy(event) {
    event.preventDefault();

    const formData = new FormData(event.target); // create a FormData object from the form

    formData.append("user", data?.user?.id);
    formData.append("rules", "[]");
    const title = formData.get("title");

    if (!title || title.length === 0) {
      toast.error("Title cannot be empty!", {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });
      return;
    }

    if (title?.length > 100) {
      toast.error("Title is too long. Keep it simple and concise bruv!", {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });
      return;
    }

    const postData = {};

    // Iterate through the FormData entries and populate the object
    for (const [key, value] of formData.entries()) {
      postData[key] = value;
    }

    const response = await fetch("/api/create-strategy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const output = await response?.json();
    if (output?.id && output?.id?.length !== 0) {
      toast.success("Strategy created successfully!", {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });

      const closePopup = document.getElementById("addStrategy");
      closePopup?.dispatchEvent(new MouseEvent("click"));
      selectedStrategy = output?.id;
      if (strategyList?.length !== 0) {
        ruleOfList = [];
      }
      strategyList?.unshift(output);
      selectedPopularStrategy = "";
    } else {
      toast.error("Something went wrong. Please try again later!", {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });
    }

    return output;
  }

  async function switchStrategy(item) {
    displayTableTab = "general";
    ruleName = "";
    selectedPopularStrategy = "";
    selectedStrategy = item?.id ?? "";

    ruleOfList =
      strategyList?.find((item) => item.id === selectedStrategy)?.rules ?? [];

    ruleOfList.forEach((rule) => {
      ruleCondition[rule.name] =
        rule.condition || allRules[rule.name].defaultCondition;
      valueMappings[rule.name] = rule.value || allRules[rule.name].defaultValue;
    });

    if (ruleOfList?.length === 0) {
      filteredData = [];
      displayResults = [];
    }
    await updateStockScreenerData();
    checkedItems = new Map(
      ruleOfList
        ?.filter((rule) =>
          [
            "analystRating",
            "topAnalystRating",
            "halalStocks",
            "sector",
            "country",
            "score",
            "industry",
            "grahamNumber",
          ]?.includes(rule.name),
        ) // Only include specific rules
        ?.map((rule) => [rule.name, new Set(rule.value)]), // Create Map from filtered rules
    );
  }

  function changeRule(state: string) {
    if (
      data?.user?.tier !== "Pro" &&
      [
        "gexRatio",
        "ivRank",
        "iv30d",
        "totalOI",
        "changeOI",
        "netCallPrem",
        "netPutPrem",
        "callVolume",
        "putVolume",
        "pcRatio",
        "topAnalystRating",
        "topAnalystCounter",
        "topAnalystPriceTarget",
        "topAnalystUpside",
        "score",
      ]?.includes(state)
    ) {
      goto("/pricing");
    } else {
      selectedPopularStrategy = "";
      ruleName = state;
      handleAddRule();
    }
  }

  const handleMessage = (event) => {
    displayRules = allRows?.filter((row) =>
      ruleOfList?.some((rule) => rule.name === row.rule),
    );

    filteredData = event.data?.filteredData ?? [];
    displayResults = filteredData?.slice(0, 50);
  };

  const handleScreenerMessage = (event) => {
    stockScreenerData = event?.data?.stockScreenerData;
    shouldLoadWorker.set(true);
  };

  const loadWorker = async () => {
    if (["performance", "analysts"]?.includes(displayTableTab) || hoverStatus) {
      syncWorker.postMessage({
        stockScreenerData,
        ruleOfList: [...ruleOfList, ...otherTabRules],
      });
    } else {
      syncWorker.postMessage({
        stockScreenerData,
        ruleOfList,
      });
    }
  };

  const updateStockScreenerData = async () => {
    if (["performance", "analysts"]?.includes(displayTableTab) || hoverStatus) {
      downloadWorker.postMessage({
        ruleOfList: [...ruleOfList, ...otherTabRules],
      });
    } else {
      downloadWorker.postMessage({ ruleOfList: ruleOfList });
    }
  };

  function handleAddRule() {
    if (ruleName === "") {
      toast.error("Please select a rule", {
        style:
          "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
      });
      return;
    }

    let newRule;

    switch (ruleName) {
      case "analystRating":
      case "topAnalystRating":
      case "halalStocks":
      case "score":
      case "sector":
      case "industry":
      case "country":
      case "ema20":
      case "ema50":
      case "ema100":
      case "ema200":
      case "sma20":
      case "grahamNumber":
      case "sma50":
      case "sma100":
      case "sma200":
        newRule = {
          name: ruleName,
          value: Array.isArray(valueMappings[ruleName])
            ? valueMappings[ruleName]
            : [valueMappings[ruleName]],
        }; // Ensure value is an array
        break;
      default:
        newRule = {
          name: ruleName,
          condition: ruleCondition[ruleName],
          value: valueMappings[ruleName],
        };
        break;
    }
    handleRule(newRule);
  }

  async function handleRule(newRule) {
    const existingRuleIndex = ruleOfList.findIndex(
      (rule) => rule.name === newRule.name,
    );

    if (existingRuleIndex !== -1) {
      const existingRule = ruleOfList[existingRuleIndex];
      if (existingRule.name === newRule.name) {
        // Remove the rule instead of showing an error
        ruleOfList.splice(existingRuleIndex, 1);
        ruleOfList = [...ruleOfList]; // Trigger reactivity
      } else {
        ruleOfList[existingRuleIndex] = newRule;
        ruleOfList = [...ruleOfList]; // Trigger reactivity
      }
    } else {
      ruleOfList = [...ruleOfList, newRule];
      /*
    toast.success('Rule added', {
      style: 'border-radius: 200px; background: #2A2E39; color: #fff;'
    });
    */

      await updateStockScreenerData();
    }
  }

  async function handleResetAll() {
    selectedPopularStrategy = "";
    displayTableTab = "general";
    ruleOfList = [];
    Object?.keys(allRules)?.forEach((ruleName) => {
      ruleCondition[ruleName] = allRules[ruleName].defaultCondition;
      valueMappings[ruleName] = allRules[ruleName].defaultValue;
    });
    ruleName = "";
    filteredData = [];
    displayResults = [];
    checkedItems = new Map();
    ruleOfList = [...ruleOfList];
    await updateStockScreenerData();
    //await handleSave(false);
  }

  async function handleDeleteRule(state) {
    selectedPopularStrategy = "";

    // Find the index of the rule to be deleted or updated
    const index = ruleOfList?.findIndex((rule) => rule.name === state);
    if (index !== -1) {
      // Get the rule and its default values
      const rule = ruleOfList[index];
      const defaultCondition = allRules[state].defaultCondition;
      const defaultValue = allRules[state].defaultValue;

      // Check if current values differ from defaults
      const isAtDefaultValues =
        ruleCondition[state] === defaultCondition &&
        (Array.isArray(valueMappings[state]) && Array.isArray(defaultValue)
          ? JSON.stringify(valueMappings[state]) ===
            JSON.stringify(defaultValue)
          : valueMappings[state] === defaultValue);

      if (!isAtDefaultValues) {
        // If not at defaults, reset to defaults
        ruleCondition[state] = defaultCondition;
        valueMappings[state] = defaultValue;

        // Update the rule in ruleOfList
        ruleOfList[index] = {
          ...rule,
          condition: defaultCondition,
          value: defaultValue,
        };
        ruleOfList = [...ruleOfList]; // Trigger reactivity
      } else {
        // If already at defaults, remove the rule
        ruleOfList.splice(index, 1);
        ruleOfList = [...ruleOfList];

        // Reset checkedItems for multi-select rules
        if (checkedItems.has(state)) {
          checkedItems.delete(state);
        }

        // Handle cases when the list is empty or matches the current rule name
        if (ruleOfList?.length === 0) {
          ruleName = "";
          filteredData = [];
          displayResults = [];
        } else if (state === ruleName) {
          ruleName = "";
        }
      }

      await updateStockScreenerData();
    }
  }

  async function handleScroll() {
    const scrollThreshold = document.body.offsetHeight * 0.8; // 80% of the website height
    const isBottom = window.innerHeight + window.scrollY >= scrollThreshold;
    if (isBottom && displayResults?.length !== filteredData?.length) {
      const nextIndex = displayResults?.length;
      const filteredNewResults = filteredData?.slice(nextIndex, nextIndex + 30);
      displayResults = [...displayResults, ...filteredNewResults];
    }
  }

  /*
const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault(); // prevent the browser's default save action
      handleSave();
    }
  };

*/

  let LoginPopup;

  onMount(async () => {
    if (!syncWorker) {
      const SyncWorker = await import("./workers/filterWorker?worker");
      syncWorker = new SyncWorker.default();
      syncWorker.onmessage = handleMessage;
    }

    if (!downloadWorker) {
      const DownloadWorker = await import("./workers/downloadWorker?worker");
      downloadWorker = new DownloadWorker.default();
      downloadWorker.onmessage = handleScreenerMessage;
    }

    if (!data?.user) {
      LoginPopup = (await import("$lib/components/LoginPopup.svelte")).default;
    }

    shouldLoadWorker.subscribe(async (value) => {
      if (value) {
        isLoaded = false;
        await loadWorker();
        shouldLoadWorker.set(false); // Reset after worker is loaded
        isLoaded = true;
      }
    });

    groupedRules = groupScreenerRules(allRows);
  });

  onDestroy(() => {
    syncWorker?.terminate();
    syncWorker = undefined;
    clearCache();
  });

  async function handleSave(printToast) {
    if (data?.user) {
      if (isSaved === false && strategyList?.length > 0) {
        strategyList.find((item) => item.id === selectedStrategy).rules =
          ruleOfList;

        const postData = {
          strategyId: selectedStrategy,
          rules: ruleOfList,
        };

        const response = await fetch("/api/save-strategy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });

        if (printToast === true) {
          toast.success("Strategy saved!", {
            style:
              "border-radius: 5px; background: #fff; color: #000; border-color: #4B5563; font-size: 15px;",
          });
        }

        //isSaved = true;
      }
    }
  }

  $: {
    if (ruleOfList) {
      const ruleToUpdate = ruleOfList?.find((rule) => rule.name === ruleName);
      if (ruleToUpdate) {
        ruleToUpdate.value = valueMappings[ruleToUpdate.name];
        ruleToUpdate.condition = ruleCondition[ruleToUpdate.name];
        ruleOfList = [...ruleOfList];
      }
      shouldLoadWorker.set(true);
    }
  }

  $: {
    if (searchTerm?.length > 0) {
      // Filter rows by search term
      const filteredRows = allRows?.filter((row) =>
        row?.label?.toLowerCase()?.includes(searchTerm?.toLowerCase()),
      );

      // Group the filtered rows by category
      filteredGroupedRules = groupScreenerRules(filteredRows);
    } else {
      // If no search term, return all rows grouped by category
      filteredGroupedRules = groupScreenerRules(allRows);
    }
  }

  $: isSaved = !ruleOfList;

  $: charNumber = $screenWidth < 640 ? 20 : 40;

  function changeRuleCondition(name: string, state: string) {
    ruleName = name;
    const newState = state?.toLowerCase();

    // Initialize array for "between" condition
    if (newState === "between") {
      valueMappings[ruleName] = ["", ""];
    } else if (
      ruleCondition[ruleName] === "between" &&
      ["over", "under", "exactly"].includes(newState)
    ) {
      valueMappings[ruleName] = "any";
    }

    ruleCondition[ruleName] = newState;
  }

  let checkedItems = new Map(
    ruleOfList
      ?.filter((rule) =>
        [
          "analystRating",
          "topAnalystRating",
          "halalStocks",
          "sector",
          "country",
          "score",
          "industry",
          "grahamNumber",
        ]?.includes(rule.name),
      ) // Only include specific rules
      ?.map((rule) => [rule.name, new Set(rule.value)]), // Create Map from filtered rules
  );

  function isChecked(item, ruleName) {
    return checkedItems?.has(ruleName) && checkedItems?.get(ruleName).has(item);
  }

  // Utility function to convert values to comparable numbers
  function parseValue(val) {
    if (typeof val === "string") {
      // Handle percentage values
      if (val.endsWith("%")) {
        return parseFloat(val);
      }

      // Handle values with suffixes like K (thousand), M (million), B (billion)
      const suffixMap = {
        K: 1e3,
        M: 1e6,
        B: 1e9,
      };

      const suffix = val.slice(-1).toUpperCase();
      const numberPart = parseFloat(val);

      if (suffix in suffixMap) {
        return numberPart * suffixMap[suffix];
      }
    }

    return parseFloat(val);
  }

  // Custom sorting function
  function customSort(a, b) {
    return parseValue(a) - parseValue(b);
  }

  async function handleChangeValue(value, { shouldSort = true } = {}) {
    // Add this check at the beginning of the function
    if (ruleCondition[ruleName] === "between") {
      // Ensure valueMappings[ruleName] is always an array for "between" condition
      if (!Array.isArray(valueMappings[ruleName])) {
        valueMappings[ruleName] = ["", ""];
      }

      // If value is a single value (from input), update only the specified index
      if (!Array.isArray(value) && typeof currentIndex === "number") {
        valueMappings[ruleName][currentIndex] = value;
        value = valueMappings[ruleName];
      } else if (Array.isArray(value)) {
        // Only for preset ranges from dropdown
        valueMappings[ruleName] = value;
      }
    }

    if (checkedItems.has(ruleName)) {
      const itemsSet = checkedItems.get(ruleName);

      // Apply sorting only if shouldSort is true
      const sortedValue =
        shouldSort && Array.isArray(value) ? value.sort(customSort) : value;

      const valueKey = Array.isArray(sortedValue)
        ? sortedValue.join("-")
        : sortedValue;

      if (itemsSet?.has(valueKey)) {
        itemsSet?.delete(valueKey);
      } else {
        itemsSet?.add(valueKey);
      }
    } else {
      // Apply sorting only if shouldSort is true
      const sortedValue =
        shouldSort && Array.isArray(value) ? value.sort(customSort) : value;

      const valueKey = Array.isArray(sortedValue)
        ? sortedValue.join("-")
        : sortedValue;

      checkedItems?.set(ruleName, new Set([valueKey]));
    }

    if (
      [
        "sma20",
        "sma50",
        "sma100",
        "sma200",
        "ema20",
        "ema50",
        "ema100",
        "ema200",
        "grahamNumber",
        "analystRating",
        "topAnalystRating",
        "halalStocks",
        "score",
        "sector",
        "industry",
        "country",
      ]?.includes(ruleName)
    ) {
      searchQuery = "";
      if (!Array.isArray(valueMappings[ruleName])) {
        valueMappings[ruleName] = [];
      }

      // Apply sorting only if shouldSort is true
      const sortedValue =
        shouldSort && Array?.isArray(value) ? value?.sort(customSort) : value;

      const valueKey = Array?.isArray(sortedValue)
        ? sortedValue.join("-")
        : sortedValue;

      const index = valueMappings[ruleName].indexOf(valueKey);
      if (index === -1) {
        valueMappings[ruleName].push(valueKey);
      } else {
        valueMappings[ruleName].splice(index, 1);
      }

      if (valueMappings[ruleName].length === 0) {
        valueMappings[ruleName] = "any";
      }

      await updateStockScreenerData();
    } else if (ruleName in valueMappings) {
      if (ruleCondition[ruleName] === "between" && Array?.isArray(value)) {
        // Apply sorting only if shouldSort is true
        valueMappings[ruleName] = shouldSort ? value?.sort(customSort) : value;
      } else {
        valueMappings[ruleName] = value;
      }
    } else {
      console.warn(`Unhandled rule: ${ruleName}`);
    }

    // Add this at the end of the function to ensure the filter is applied
    if (ruleCondition[ruleName] === "between" && value.some((v) => v !== "")) {
      await updateStockScreenerData();
    }
  }

  async function stepSizeValue(value, condition) {
    if (value === "any") {
      value = 0;
    }
    const match = value.toString().match(/^(-?[\d.]+)([KMB%]?)$/);
    if (!match) return value;

    let [_, number, suffix] = match;
    number = parseFloat(number);

    let step = 1;

    number += condition === "add" ? step : -step;

    // Round to 2 decimal places for consistency
    number = parseFloat(number?.toFixed(2));
    const newValue = suffix ? `${number}${suffix}` : Math?.round(number);
    await handleChangeValue(newValue);
  }

  let currentIndex = null;

  async function handleValueInput(event, ruleName, index = null) {
    const newValue = event.target.value;

    if (ruleCondition[ruleName] === "between") {
      // Ensure valueMappings[ruleName] is initialized as an array
      if (!Array.isArray(valueMappings[ruleName])) {
        valueMappings[ruleName] = ["", ""];
      }

      // Store the current index being modified
      currentIndex = index;

      if (newValue?.length === 0) {
        valueMappings[ruleName][index] = "";
      }

      await handleChangeValue(newValue, { shouldSort: false });

      // Reset currentIndex after handling the value
      currentIndex = null;
    } else {
      if (newValue?.length === 0) {
        const ruleIndex = ruleOfList?.findIndex(
          (rule) => rule.name === ruleName,
        );
        if (ruleIndex !== -1) {
          ruleOfList[ruleIndex].value = "any";
        }
      }
      await handleChangeValue(newValue);
    }
  }

  async function popularStrategy(state: string) {
    ruleOfList = [];
    const strategies = {
      dividendGrowth: {
        name: "Dividend Growth",
        rules: [
          { condition: "over", name: "dividendGrowth", value: "5%" },
          { condition: "over", name: "dividendYield", value: "1%" },
          { condition: "under", name: "payoutRatio", value: "60%" },
          { condition: "over", name: "growthRevenue", value: "5%" },
        ],
      },
      topGainers1Y: {
        name: "Top Gainers 1Y",
        rules: [
          { condition: "over", name: "change1Y", value: "50%" },
          { condition: "over", name: "marketCap", value: "10B" },
          { condition: "over", name: "eps", value: 5 },
        ],
      },
      topShortedStocks: {
        name: "Top Shorted Stocks",
        rules: [
          { condition: "over", name: "shortFloatPercent", value: "20%" },
          { condition: "over", name: "shortRatio", value: 1 },
          { condition: "over", name: "shortOutStandingPercent", value: "10%" },
          { condition: "over", name: "sharesShort", value: "20M" },
          { condition: "over", name: "marketCap", value: "100M" },
        ],
      },

      momentumTAStocks: {
        name: "Momentum TA Stocks",
        rules: [
          { condition: "under", name: "rsi", value: 40 },
          { condition: "under", name: "stochRSI", value: 40 },
          { condition: "over", name: "marketCap", value: "1B" },
          { condition: "under", name: "mfi", value: 40 },
        ],
      },
      underValuedStocks: {
        name: "Undervalued Stocks",
        rules: [
          { condition: "under", name: "marketCap", value: "100M" },
          { condition: "over", name: "debtEquityRatio", value: 1 },
          { condition: "over", name: "debtRatio", value: -0.5 },
          { condition: "over", name: "eps", value: 0 },
        ],
      },
      strongCashFlow: {
        // New Strategy Added
        name: "Strong Cash Flow",
        rules: [
          { condition: "over", name: "marketCap", value: "1B" },
          { condition: "over", name: "freeCashFlow", value: "50B" },
          { condition: "over", name: "operatingCashFlowPerShare", value: 5 },
          { condition: "over", name: "operatingCashFlow", value: "50B" },
          { condition: "over", name: "freeCashFlowPerShare", value: 2 },
          { condition: "over", name: "freeCashFlowMargin", value: "50%" },
        ],
      },
    };

    const strategy = strategies[state];
    if (strategy) {
      selectedPopularStrategy = strategy.name;
      ruleOfList = strategy?.rules;
      ruleOfList?.forEach((row) => {
        ruleName = row?.name;
        ruleCondition[ruleName] = row?.condition;
        handleChangeValue(row?.value);
      });

      await updateStockScreenerData();
    }
  }

  function handleInput(event) {
    const searchQuery = event.target.value?.toLowerCase() || "";

    setTimeout(() => {
      testList = [];

      if (searchQuery.length > 0) {
        const rawList =
          ruleName === "country"
            ? listOfRelevantCountries
            : ruleName === "sector"
              ? sectorList
              : ruleName === "industry"
                ? industryList
                : ["analystRating", "topAnalystRating", "score"]?.includes(
                      ruleName,
                    )
                  ? ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"]
                  : ["Compliant", "Non-Compliant"];
        testList =
          rawList?.filter((item) => {
            const index = item?.toLowerCase();
            // Check if country starts with searchQuery
            return index?.startsWith(searchQuery);
          }) || [];
      }
    }, 50);
  }

  const sortData = (key) => {
    // Reset all other keys to 'none' except the current key
    for (const k in sortOrders) {
      if (k !== key) {
        sortOrders[k].order = "none";
      }
    }

    // Cycle through 'none', 'asc', 'desc' for the clicked key
    const orderCycle = ["none", "asc", "desc"];

    let originalData = filteredData;

    const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
    sortOrders[key].order =
      orderCycle[(currentOrderIndex + 1) % orderCycle.length];
    const sortOrder = sortOrders[key].order;

    // Reset to original data when 'none' and stop further sorting
    if (sortOrder === "none") {
      displayResults = [...originalData]?.slice(0, 50); // Reset to original data (spread to avoid mutation)
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
    displayResults = [...originalData].sort(compareValues)?.slice(0, 50);
  };

  let columns;
  let sortOrders;

  // Initial columns and sort orders for the "general" tab
  const generalColumns = [
    { key: "symbol", label: "Symbol", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "marketCap", label: "Market Cap", align: "right" },
    { key: "price", label: "Price", align: "right" },
    { key: "changesPercentage", label: "% Change", align: "right" },
    { key: "volume", label: "Volume", align: "right" },
    { key: "pe", label: "PE Ratio", align: "right" },
  ];

  const generalSortOrders = {
    symbol: { order: "none", type: "string" },
    name: { order: "none", type: "string" },
    marketCap: { order: "none", type: "number" },
    changesPercentage: { order: "none", type: "number" },
    price: { order: "none", type: "number" },
    volume: { order: "none", type: "number" },
    pe: { order: "none", type: "number" },
  };

  const stringTypeRules = [
    "country",
    "industry",
    "score",
    "sector",
    "analystRating",
    "topAnalystRating",
    "halalStocks",
  ];

  // Helper to determine the type based on stringTypeRules
  const getType = (key) =>
    stringTypeRules.includes(key) ? "string" : "number";

  $: {
    if (displayTableTab) {
      const baseColumnsMap = {
        performance: [
          { key: "symbol", label: "Symbol", align: "left" },
          { key: "name", label: "Name", align: "left" },
          { key: "marketCap", label: "Market Cap", align: "right" },
        ],
        analysts: [
          { key: "symbol", label: "Symbol", align: "left" },
          { key: "name", label: "Name", align: "left" },
          { key: "marketCap", label: "Market Cap", align: "right" },
        ],
        filters: [
          { key: "symbol", label: "Symbol", align: "left" },
          { key: "name", label: "Name", align: "left" },
          { key: "marketCap", label: "Market Cap", align: "right" },
        ],
      };

      const baseSortOrdersMap = {
        performance: {
          symbol: { order: "none", type: "string" },
          name: { order: "none", type: "string" },
          marketCap: { order: "none", type: "number" },
        },
        analysts: {
          symbol: { order: "none", type: "string" },
          name: { order: "none", type: "string" },
          marketCap: { order: "none", type: "number" },
        },
        filters: {
          symbol: { order: "none", type: "string" },
          name: { order: "none", type: "string" },
          marketCap: { order: "none", type: "number" },
        },
      };

      if (displayTableTab === "general") {
        columns = [...generalColumns];
        sortOrders = { ...generalSortOrders };
      } else {
        columns = [...(baseColumnsMap[displayTableTab] || [])];
        sortOrders = { ...(baseSortOrdersMap[displayTableTab] || {}) };

        const rulesList = ["performance", "analysts"]?.includes(displayTableTab)
          ? tabRuleList
          : displayRules;
        rulesList?.forEach((rule) => {
          if (rule.rule !== "marketCap") {
            columns.push({
              key: rule.rule,
              label: rule.label,
              align: "right",
            });
            sortOrders[rule.rule] = { order: "none", type: getType(rule.rule) };
          }
        });
      }
    }
  }

  let tabRuleList = [];
  let hoverStatus = false;
  async function changeTab(state) {
    displayTableTab = state;

    if (displayTableTab === "performance") {
      hoverStatus = false;
      otherTabRules = [
        { name: "marketCap", value: "any" },
        { name: "change1W", value: "any" },
        { name: "change1M", value: "any" },
        { name: "change3M", value: "any" },
        { name: "change1Y", value: "any" },
      ];
      tabRuleList = otherTabRules
        .map((rule) => allRows.find((row) => row.rule === rule.name))
        .filter(Boolean);

      await updateStockScreenerData();
    } else if (displayTableTab === "analysts") {
      hoverStatus = false;
      otherTabRules = [
        { name: "marketCap", value: "any" },
        { name: "analystRating", value: "any" },
        { name: "analystCounter", value: "any" },
        { name: "priceTarget", value: "any" },
        { name: "upside", value: "any" },
      ];
      tabRuleList = otherTabRules
        .map((rule) => allRows.find((row) => row.rule === rule.name))
        .filter(Boolean);

      await updateStockScreenerData();
    }
  }
  /*
  async function handleMouseOver() {
    if (displayTableTab !== "performance") {
      hoverStatus = true;
      otherTabRules = [
        { name: "marketCap", value: "any" },
        { name: "change1W", value: "any" },
        { name: "change1M", value: "any" },
        { name: "change3M", value: "any" },
        { name: "change1Y", value: "any" },
      ];
      tabRuleList = otherTabRules
        ?.map((rule) => allRows.find((row) => row.rule === rule.name))
        ?.filter(Boolean);

      await updateStockScreenerData();
    } else if (displayTableTab !== "analysts") {
      hoverStatus = true;
      otherTabRules = [
        { name: "marketCap", value: "any" },
        { name: "analystRating", value: "any" },
        { name: "analystCounter", value: "any" },
        { name: "priceTarget", value: "any" },
        { name: "upside", value: "any" },
      ];
      tabRuleList = otherTabRules
        ?.map((rule) => allRows.find((row) => row.rule === rule.name))
        ?.filter(Boolean);

      await updateStockScreenerData();
    }
  }
  */
</script>

<SEO
  title="Free Stock Screener - Search, Filter and Analyze Stocks"
  description={`A free stock screener to search, filter and analyze stocks by ${allRows?.length} different indicators and metrics. The screener data is updated once per minute.`}
/>

<svelte:window on:scroll={handleScroll} />

<section
  class="w-full max-w-3xl sm:max-w-screen-xl overflow-hidden min-h-screen pt-5 pb-40 px-5"
>
  <div class="text-sm sm:text-[1rem] breadcrumbs">
    <ul>
      <li><a href="/" class="text-gray-300">Home</a></li>
      <li><span class="text-gray-300">Stock Screener</span></li>
    </ul>
  </div>

  <!--Start Build Strategy-->
  <div class="mt-5 sm:rounded-md">
    <div class="flex flex-col md:flex-row items-start md:items-center mb-5">
      <div class="w-full flex flex-row items-center sm:mt-4">
        <h1 class="text-white text-3xl font-semibold">Stock Screener</h1>
        <span
          class="inline-block text-xs sm:text-sm font-semibold text-white ml-2 mt-3"
        >
          {filteredData?.length} Matches Found
        </span>
      </div>

      <div class="flex flex-row items-center w-full mt-5">
        <div class="flex w-full sm:w-[50%] md:block md:w-auto sm:ml-auto">
          <div
            class="hidden text-sm sm:text-[1rem] font-semibold text-white md:block sm:mb-1"
          >
            Popular Screens
          </div>
          <div class="relative inline-block text-left grow">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild let:builder>
                <Button
                  builders={[builder]}
                  class="w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out  flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                >
                  <span class="truncate text-white"
                    >{selectedPopularStrategy?.length !== 0
                      ? selectedPopularStrategy
                      : "Select popular"}</span
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
                  Popular Strategies
                </DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Group>
                  <DropdownMenu.Item
                    on:click={() => popularStrategy("dividendGrowth")}
                    class="cursor-pointer hover:bg-primary"
                  >
                    Dividend Growth
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    on:click={() => popularStrategy("topGainers1Y")}
                    class="cursor-pointer hover:bg-primary"
                  >
                    Top Gainers 1Y
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    on:click={() => popularStrategy("topShortedStocks")}
                    class="cursor-pointer hover:bg-primary"
                  >
                    Top Shorted Stocks
                  </DropdownMenu.Item>

                  <DropdownMenu.Item
                    on:click={() => popularStrategy("momentumTAStocks")}
                    class="cursor-pointer hover:bg-primary"
                  >
                    Momentum TA Stocks
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    on:click={() => popularStrategy("underValuedStocks")}
                    class="cursor-pointer hover:bg-primary"
                  >
                    Undervalued Stocks
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    on:click={() => popularStrategy("strongCashFlow")}
                    class="cursor-pointer hover:bg-primary"
                  >
                    Strong Cash Flow
                  </DropdownMenu.Item>
                </DropdownMenu.Group>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>

        <div class="flex w-full sm:w-[50%] sm:ml-3 md:block md:w-auto ml-3">
          <div
            class="hidden text-sm sm:text-[1rem] font-semibold text-white md:block sm:mb-1"
          >
            Saved Screens
          </div>
          <div class="relative inline-block text-left grow">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild let:builder>
                <Button
                  builders={[builder]}
                  class="min-w-[110px] w-full border-gray-600 border bg-default sm:hover:bg-primary ease-out flex flex-row justify-between items-center px-3 py-2 text-white rounded-md truncate"
                >
                  <span class="truncate text-white"
                    >{selectedStrategy?.length !== 0
                      ? strategyList?.find(
                          (item) => item.id === selectedStrategy,
                        )?.title
                      : "Select screen"}</span
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
                  <DropdownMenu.Trigger asChild let:builder>
                    <Button
                      on:click={handleCreateStrategy}
                      builders={[builder]}
                      class="p-0 -mb-2 -mt-2 text-sm inline-flex cursor-pointer items-center justify-center space-x-1 whitespace-nowrap text-base text-white bg-[#0909B] focus:outline-none sm:text-smaller"
                    >
                      <svg
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style="max-width:40px"
                        aria-hidden="true"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      <div class="text-sm text-start">New Screen</div>
                    </Button>
                  </DropdownMenu.Trigger>
                </DropdownMenu.Label>
                <DropdownMenu.Separator />
                <DropdownMenu.Group>
                  {#each strategyList as item}
                    <DropdownMenu.Item
                      on:click={() => switchStrategy(item)}
                      class="{item?.id === selectedStrategy
                        ? 'bg-primary'
                        : ''} cursor-pointer sm:hover:bg-primary"
                    >
                      {item?.title} ({item?.rules?.length})
                    </DropdownMenu.Item>
                  {/each}
                </DropdownMenu.Group>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-md border border-gray-700 bg-primary p-2">
      <div class="items-end border-b border-gray-600">
        <div
          class="mr-1 flex items-center justify-between lg:mr-2 pb-1.5 border-b border-gray-600 mt-1.5"
        >
          <button
            on:click={() => (showFilters = !showFilters)}
            class="flex cursor-pointer items-center text-lg sm:text-xl font-semibold text-gray-200"
            title="Hide Filter Area"
          >
            <svg
              class="-mb-0.5 h-6 w-6 {showFilters ? '' : '-rotate-90'} "
              viewBox="0 0 20 20"
              fill="currentColor"
              style="max-width:40px"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
            {ruleOfList?.length} Filters
          </button>
        </div>
      </div>
      {#if showFilters}
        <div class="mt-3 flex flex-col gap-y-2.5 sm:flex-row lg:gap-y-2">
          <label
            for="ruleModal"
            class="inline-flex cursor-pointer items-center justify-center space-x-1 whitespace-nowrap rounded-md border border-transparent bg-blue-brand_light py-2 pl-3 pr-4 text-base font-semibold text-white shadow-sm bg-[#000] sm:hover:bg-default/60 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-smaller"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              style="max-width:40px"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <div>Add Filters</div>
          </label>

          {#if data?.user && selectedStrategy?.length !== 0}
            <label
              for={!data?.user ? "userLogin" : ""}
              on:click={() => handleSave(true)}
              class="sm:ml-3 cursor-pointer inline-flex items-center justify-center space-x-1 whitespace-nowrap rounded-md border border-transparent bg-blue-brand_light py-2 pl-3 pr-4 text-base font-semibold text-white shadow-sm bg-[#000] sm:hover:bg-default/60 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-smaller"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                ><path
                  fill="#fff"
                  d="M5 5v22h22V9.594l-.281-.313l-4-4L22.406 5zm2 2h3v6h12V7.437l3 3V25h-2v-9H9v9H7zm5 0h4v2h2V7h2v4h-8zm-1 11h10v7H11z"
                /></svg
              >
              <div>Save</div>
            </label>

            <label
              for="deleteStrategy"
              class="sm:ml-3 cursor-pointer inline-flex items-center justify-center space-x-1 whitespace-nowrap rounded-md border border-transparent bg-blue-brand_light py-2 pl-3 pr-4 text-base font-semibold text-white shadow-sm bg-[#000] sm:hover:bg-default/60 ease-out sm:hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-smaller"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
                ><path
                  fill="currentColor"
                  d="M360 184h-8c4.4 0 8-3.6 8-8zh304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32M731.3 840H292.7l-24.2-512h487z"
                /></svg
              >
              <div>Delete</div>
            </label>
          {/if}

          {#if ruleOfList?.length !== 0}
            <label
              on:click={handleResetAll}
              class="sm:ml-3 cursor-pointer inline-flex items-center justify-center space-x-1 whitespace-nowrap rounded-md border border-transparent bg-blue-brand_light py-2 pl-3 pr-4 text-base font-semibold text-white shadow-sm bg-[#000] sm:hover:text-red-500 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-smaller"
            >
              <svg
                class="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 21 21"
                ><g
                  fill="none"
                  fill-rule="evenodd"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><path d="M3.578 6.487A8 8 0 1 1 2.5 10.5" /><path
                    d="M7.5 6.5h-4v-4"
                  /></g
                ></svg
              >
              <div>Reset All</div>
            </label>
          {/if}

          <!--
                    <div class="relative sm:ml-2">
                        <div class="absolute inset-y-0 left-0 flex items-center pl-2.5">
                            <svg class="h-4 w-4 text-gray-400 xs:h-5 xs:w-5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" stroke="currentColor" viewBox="0 0 24 24" style="max-width: 40px" aria-hidden="true">
                                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        
                        <input type="text" placeholder="Search {allRows?.length} filters..." class="controls-input rounded-md w-full py-2 pl-10 placeholder:text-gray-300 bg-secondary sm:w-72"> 
                        <div class="absolute inset-y-0 right-0 flex items-center pr-2"></div> 
                      
                    </div> 
                  -->
        </div>

        <div
          class="sm:grid sm:gap-x-2.5 md:grid-cols-2 lg:grid-cols-3 w-full mt-3 border-t border-b border-gray-600"
        >
          {#each displayRules as row (row?.rule)}
            <!--Start Added Rules-->
            <div
              class="flex items-center justify-between space-x-2 px-1 py-1.5 text-smaller leading-tight text-white"
            >
              <div class="hide-scroll text-white">
                {row?.label?.length > 20
                  ? row?.label?.slice(0, 20)?.replace("[%]", "") + "..."
                  : row?.label?.replace("[%]", "")}
                <span class="relative" role="tooltip"
                  ><label
                    for="mobileTooltip"
                    on:click={() =>
                      getInfoText(row?.rule, row?.label?.replace("[%]", ""))}
                    class="relative"
                    role="tooltip"
                  >
                    <span
                      class="absolute -right-[15px] -top-[3px] cursor-pointer p-1 text-gray-300 sm:hover:text-white"
                    >
                      <svg
                        class="h-[10.5px] w-[10.5px]"
                        viewBox="0 0 4 16"
                        fill="currentColor"
                        style="max-width:20px"
                        ><path
                          d="M0 6h4v10h-4v-10zm2-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
                        ></path></svg
                      >
                    </span>
                  </label></span
                >
              </div>

              <div class="flex items-center">
                <button
                  on:click={() => handleDeleteRule(row?.rule)}
                  class="mr-1.5 cursor-pointer text-gray-300 sm:hover:text-red-500 focus:outline-none"
                  title="Remove filter"
                  >{#if ruleOfList?.find((item) => item.name === row?.rule)?.value !== "any"}
                    <svg
                      class="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style="max-width:40px"
                      ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path></svg
                    >
                  {:else}
                    <svg
                      class="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="CurrentColor"
                      style="max-width:40px"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>{/if}
                </button>
                <div class="relative inline-block text-left">
                  <div on:click={() => (ruleName = row?.rule)}>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild let:builder>
                        <Button
                          builders={[builder]}
                          class="bg-[#000] h-[40px] flex flex-row justify-between items-center w-[150px] xs:w-[140px] sm:w-[150px] px-3 text-white rounded-md truncate"
                        >
                          <span class="truncate ml-2 text-sm sm:text-[1rem]">
                            {#if valueMappings[row?.rule] === "any"}
                              Any
                            {:else if ruleCondition[row?.rule] === "between"}
                              {Array.isArray(valueMappings[row?.rule])
                                ? `${valueMappings[row?.rule][0]}-${valueMappings[row?.rule][1] ?? "Any"}`
                                : "Any"}
                            {:else}
                              {ruleCondition[row?.rule]
                                ?.replace("under", "Under")
                                ?.replace("over", "Over")
                                ?.replace("exactly", "Exactly") ?? ""}
                              {valueMappings[row?.rule]}
                            {/if}
                          </span>
                          <svg
                            class=" ml-1 h-6 w-6 xs:ml-2 inline-block"
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
                        class="w-64 min-h-auto max-h-72 overflow-y-auto scroller"
                      >
                        {#if !["sma20", "sma50", "sma100", "sma200", "ema20", "ema50", "ema100", "ema200", "grahamNumber", "analystRating", "topAnalystRating", "halalStocks", "score", "sector", "industry", "country"]?.includes(row?.rule)}
                          <DropdownMenu.Label
                            class="absolute mt-2 h-11 border-gray-800 border-b -top-1 z-20 fixed sticky bg-default"
                          >
                            <div
                              class="flex items-center justify-start gap-x-1"
                            >
                              <!--Start Dropdown for Condition-->
                              <div
                                class="-ml-2 relative inline-block text-left"
                              >
                                <DropdownMenu.Root>
                                  <DropdownMenu.Trigger asChild let:builder
                                    ><Button
                                      builders={[builder]}
                                      class="w-fit -mt-1 -ml-2 bg-default flex flex-row justify-between items-center text-white"
                                    >
                                      <span
                                        class="truncate ml-2 text-sm sm:text-[1rem]"
                                      >
                                        {ruleCondition[ruleName]
                                          ?.replace("under", "Under")
                                          ?.replace("over", "Over")
                                          ?.replace("between", "Between")
                                          ?.replace("exactly", "Exactly")}
                                      </span>
                                      <svg
                                        class="mt-1 -mr-1 ml-1 h-5 w-5 xs:ml-2 !ml-0 sm:ml-0 inline-block"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        style="max-width:40px"
                                        aria-hidden="true"
                                        ><path
                                          fill-rule="evenodd"
                                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                          clip-rule="evenodd"
                                        ></path></svg
                                      >
                                    </Button>
                                  </DropdownMenu.Trigger>
                                  <DropdownMenu.Content>
                                    <DropdownMenu.Group>
                                      {#each ["Over", "Under", "Between", "Exactly"] as item}
                                        <DropdownMenu.Item
                                          on:click={() =>
                                            changeRuleCondition(
                                              row?.rule,
                                              item,
                                            )}
                                          class="cursor-pointer text-[1rem] font-normal"
                                          >{item}</DropdownMenu.Item
                                        >
                                      {/each}
                                    </DropdownMenu.Group>
                                  </DropdownMenu.Content>
                                </DropdownMenu.Root>
                              </div>

                              {#if ruleCondition[row?.rule] === "between"}
                                <div class="flex gap-x-1 -ml-2 z-10 -mt-1">
                                  <input
                                    type="text"
                                    placeholder="Min"
                                    value={Array?.isArray(
                                      valueMappings[row?.rule],
                                    )
                                      ? valueMappings[row?.rule]?.at(0)
                                      : ""}
                                    on:input={(e) =>
                                      handleValueInput(e, row?.rule, 0)}
                                    class="ios-zoom-fix block max-w-[3.5rem] rounded-sm placeholder:text-gray-200 font-normal p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-secondary"
                                  />
                                  <span
                                    class="text-white text-[1rem] font-normal mt-1"
                                  >
                                    &
                                  </span>
                                  <input
                                    type="text"
                                    placeholder="Max"
                                    value={Array?.isArray(
                                      valueMappings[row?.rule],
                                    )
                                      ? valueMappings[row?.rule]?.at(1)
                                      : ""}
                                    on:input={(e) =>
                                      handleValueInput(e, row?.rule, 1)}
                                    class="ios-zoom-fix block max-w-[3.5rem] rounded-sm placeholder:text-gray-200 font-normal p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-secondary"
                                  />
                                </div>
                              {:else}
                                <input
                                  type="text"
                                  placeholder="Value"
                                  value={valueMappings[row?.rule] !== "any"
                                    ? valueMappings[row?.rule]
                                    : ""}
                                  on:input={(e) =>
                                    handleValueInput(e, row?.rule)}
                                  class="ios-zoom-fix block max-w-[4.8rem] rounded-sm placeholder:text-gray-200 font-normal p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-secondary"
                                />
                              {/if}

                              {#if ["over", "under", "exactly"]?.includes(ruleCondition[ruleName]?.toLowerCase())}
                                <div
                                  class="ml-2 flex touch-manipulation flex-row items-center gap-x-1.5"
                                >
                                  <button
                                    on:click={() =>
                                      stepSizeValue(
                                        valueMappings[row?.rule],
                                        "add",
                                      )}
                                    ><svg
                                      class="size-6 cursor-pointer text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      style="max-width:40px"
                                      ><path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                      ></path></svg
                                    ></button
                                  >
                                  <button
                                    on:click={() =>
                                      stepSizeValue(
                                        valueMappings[row?.rule],
                                        "minus",
                                      )}
                                    ><svg
                                      class="size-6 cursor-pointer text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      style="max-width:40px"
                                      ><path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                      ></path></svg
                                    ></button
                                  >
                                </div>
                              {/if}
                              <!--End Dropdown for Condition-->
                            </div>
                          </DropdownMenu.Label>
                        {:else}
                          <div
                            class="relative sticky z-40 focus:outline-none -top-1"
                            tabindex="0"
                            role="menu"
                            style=""
                          >
                            <input
                              bind:value={searchQuery}
                              on:input={handleInput}
                              autocomplete="off"
                              class="{![
                                'analystRating',
                                'topAnalystRating',
                                'halalStocks',
                                'score',
                                'sector',
                                'industry',
                                'country',
                              ]?.includes(row?.rule)
                                ? 'hidden'
                                : ''} absolute fixed sticky w-full border-0 bg-default border-b border-gray-200
                                      focus:border-gray-200 focus:ring-0 text-white placeholder:text-gray-300"
                              type="search"
                              placeholder="Search..."
                            />
                          </div>
                        {/if}
                        <DropdownMenu.Group class="min-h-10 mt-2">
                          {#if !["sma20", "sma50", "sma100", "sma200", "ema20", "ema50", "ema100", "ema200", "grahamNumber", "analystRating", "topAnalystRating", "halalStocks", "score", "sector", "industry", "country"]?.includes(row?.rule)}
                            {#each row?.step as newValue, index}
                              {#if ruleCondition[row?.rule] === "between"}
                                {#if newValue && row?.step[index + 1]}
                                  <DropdownMenu.Item
                                    class="sm:hover:bg-primary"
                                  >
                                    <button
                                      on:click={() => {
                                        handleChangeValue([
                                          row?.step[index],
                                          row?.step[index + 1],
                                        ]);
                                      }}
                                      class="block w-full border-b border-gray-600 px-4 py-1.5 text-left text-sm sm:text-[1rem] rounded text-white last:border-0 sm:hover:bg-primary focus:bg-blue-100 focus:text-gray-900 focus:outline-none"
                                    >
                                      {ruleCondition[row?.rule]?.replace(
                                        "between",
                                        "Between",
                                      )}
                                      {row?.step[index + 1]} - {row?.step[
                                        index
                                      ]}
                                    </button>
                                  </DropdownMenu.Item>
                                {/if}
                              {:else}
                                <DropdownMenu.Item class="sm:hover:bg-primary">
                                  <button
                                    on:click={() => {
                                      handleChangeValue(newValue);
                                    }}
                                    class="block w-full border-b border-gray-600 px-4 py-1.5 text-left text-sm sm:text-[1rem] rounded text-white last:border-0 sm:hover:bg-primary focus:bg-blue-100 focus:text-gray-900 focus:outline-none"
                                  >
                                    {ruleCondition[row?.rule]
                                      ?.replace("under", "Under")
                                      ?.replace("over", "Over")
                                      ?.replace("exactly", "Exactly")}
                                    {newValue}
                                  </button>
                                </DropdownMenu.Item>
                              {/if}
                            {/each}
                          {:else if ["sma20", "sma50", "sma100", "sma200", "ema20", "ema50", "ema100", "ema200", "grahamNumber"]?.includes(row?.rule)}
                            {#each row?.step as item}
                              <DropdownMenu.Item class="sm:hover:bg-primary">
                                <div
                                  class="flex items-center"
                                  on:click|capture={(event) =>
                                    event.preventDefault()}
                                >
                                  <label
                                    on:click={() => {
                                      handleChangeValue(item);
                                    }}
                                    class="cursor-pointer text-white"
                                    for={item}
                                  >
                                    <input
                                      type="checkbox"
                                      class="rounded"
                                      checked={isChecked(item, row?.rule)}
                                    />
                                    <span class="ml-2">{item}</span>
                                  </label>
                                </div>
                              </DropdownMenu.Item>
                            {/each}
                          {:else}
                            {#each testList.length > 0 && searchQuery?.length > 0 ? testList : searchQuery?.length > 0 && testList?.length === 0 ? [] : row?.rule === "country" ? listOfRelevantCountries : row?.rule === "sector" ? sectorList : row?.rule === "industry" ? industryList : ["analystRating", "topAnalystRating", "score"]?.includes(ruleName) ? ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"] : ["Compliant", "Non-Compliant"] as item}
                              <DropdownMenu.Item class="sm:hover:bg-primary">
                                <div
                                  class="flex items-center"
                                  on:click|capture={(event) =>
                                    event.preventDefault()}
                                >
                                  <label
                                    on:click={() => {
                                      handleChangeValue(item);
                                    }}
                                    class="cursor-pointer text-white"
                                    for={item}
                                  >
                                    <input
                                      type="checkbox"
                                      class="rounded"
                                      checked={isChecked(item, row?.rule)}
                                    />
                                    <span class="ml-2">{item}</span>
                                  </label>
                                </div>
                              </DropdownMenu.Item>
                            {/each}
                          {/if}
                        </DropdownMenu.Group>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>
                </div>
              </div>
            </div>
            <!--End Added Rules-->
          {/each}
        </div>
      {/if}
    </div>

    <!--End Adding Rules-->
  </div>
  <!--End Build Strategy-->

  <div
    class="mt-10 sm:mt-6 grid-cols-2 items-center sm:grid lg:flex lg:space-x-1 lg:overflow-visible lg:px-1 lg:py-2"
  >
    <h2
      class="mb-1 whitespace-nowrap text-xl font-semibold text-white bp:text-[1.3rem] sm:mb-0"
    >
      {filteredData?.length} Stocks
    </h2>
    <div
      class="col-span-2 flex flex-row items-center border-t border-gray-600 lg:order-2 lg:grow lg:border-0 lg:pl-1 xl:pl-3"
    >
      <nav class="w-full flex flex-row items-center py-2.5 sm:py-3 lg:py-1">
        <ul
          class="flex flex-row overflow-x-auto items-center space-x-2 whitespace-nowrap text-base"
        >
          <li>
            <button
              on:click={() => (displayTableTab = "general")}
              class="text-[1rem] sm:text-lg block text-white rounded-md px-2 py-1 focus:outline-none sm:hover:bg-primary {displayTableTab ===
              'general'
                ? 'font-semibold bg-primary'
                : ''}"
            >
              General
            </button>
          </li>
          <li>
            <button
              on:click={() => (displayTableTab = "filters")}
              class="text-[1rem] sm:text-lg flex flex-row items-center relative block rounded-md px-2 py-1 sm:hover:bg-primary {displayTableTab ===
              'filters'
                ? 'font-semibold bg-primary'
                : ''} focus:outline-none"
            >
              <span class="text-white">Filters</span>
              <span
                class="ml-2 rounded-full avatar w-5 h-5 text-xs font-semibold text-white text-center flex-shrink-0
                                                  flex items-center justify-center {ruleOfList?.length !==
                0
                  ? 'bg-red-500'
                  : 'bg-gray-600'}"
              >
                {ruleOfList?.length}
              </span>
            </button>
          </li>
          <li>
            <button
              on:click={() => changeTab("performance")}
              class="text-[1rem] sm:text-lg block text-white rounded-md px-2 py-1 focus:outline-none sm:hover:bg-primary {displayTableTab ===
              'performance'
                ? 'font-semibold bg-primary'
                : ''}"
            >
              Performance
            </button>
          </li>
          <li>
            <button
              on:click={() => changeTab("analysts")}
              class="text-[1rem] sm:text-lg block text-white rounded-md px-2 py-1 focus:outline-none sm:hover:bg-primary {displayTableTab ===
              'analysts'
                ? 'font-semibold bg-primary'
                : ''}"
            >
              Analysts
            </button>
          </li>
        </ul>
        <div class="w-fit ml-auto hidden sm:inline-block">
          <DownloadData
            {data}
            rawData={filteredData}
            title={"stock_screener_data"}
          />
        </div>
      </nav>
    </div>
  </div>

  <!--Start Matching Preview-->
  {#if isLoaded}
    {#if filteredData?.length !== 0}
      {#if displayTableTab === "general"}
        <div class="w-full rounded-md overflow-x-scroll">
          <table
            class="table table-sm table-compact w-full bg-table border border-gray-800"
          >
            <thead>
              <TableHeader {columns} {sortOrders} {sortData} />
            </thead>
            <tbody>
              {#each displayResults as item}
                <tr
                  class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] border-b border-gray-800 odd:bg-odd"
                >
                  <td class=" whitespace-nowrap">
                    <a
                      href={"/stocks/" + item?.symbol}
                      class="sm:hover:text-white text-blue-400 text-sm sm:text-[1rem]"
                      >{item?.symbol}</a
                    >
                  </td>

                  <td class="whitespace-nowrap text-[1rem] text-white">
                    {item?.name?.length > charNumber
                      ? item?.name?.slice(0, charNumber) + "..."
                      : item?.name}
                  </td>

                  <td class="text-white text-sm sm:text-[1rem] text-end">
                    {item?.marketCap < 100
                      ? "< 100"
                      : abbreviateNumber(item?.marketCap)}
                  </td>

                  <td class="text-white text-sm sm:text-[1rem] text-end">
                    {item?.price < 0.01 ? "< 0.01" : item?.price?.toFixed(2)}
                  </td>

                  <td
                    class="text-white text-end text-sm sm:text-[1rem] font-medium"
                  >
                    {#if item?.changesPercentage >= 0}
                      <span class="text-[#00FC50]"
                        >+{item?.changesPercentage >= 1000
                          ? abbreviateNumber(item?.changesPercentage)
                          : item?.changesPercentage?.toFixed(2)}%</span
                      >
                    {:else}
                      <span class="text-[#FF2F1F]"
                        >{item?.changesPercentage <= -1000
                          ? abbreviateNumber(item?.changesPercentage)
                          : item?.changesPercentage?.toFixed(2)}%
                      </span>
                    {/if}
                  </td>

                  <td class="text-white text-sm sm:text-[1rem] text-end">
                    {item?.volume === 0 ? "-" : abbreviateNumber(item?.volume)}
                  </td>

                  <td class="text-white text-sm sm:text-[1rem] text-end">
                    {item?.pe}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else if displayTableTab === "filters"}
        <div class="w-full rounded-md overflow-x-scroll">
          <table
            class="table table-sm table-compact w-full bg-table border border-gray-800"
          >
            <thead>
              <TableHeader {columns} {sortOrders} {sortData} />
            </thead>
            <tbody>
              {#each displayResults as item (item?.symbol)}
                <tr
                  class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] border-b border-gray-800 odd:bg-odd"
                >
                  <td class=" whitespace-nowrap">
                    <a
                      href={"/stocks/" + item?.symbol}
                      class="sm:hover:text-white text-blue-400 text-sm sm:text-[1rem]"
                      >{item?.symbol}</a
                    >
                  </td>
                  <td class=" whitespace-nowrap text-[1rem] text-white">
                    {item?.name?.length > charNumber
                      ? item?.name?.slice(0, charNumber) + "..."
                      : item?.name}
                  </td>
                  <td
                    class="whitespace-nowrap text-sm sm:text-[1rem] text-end text-white"
                  >
                    {abbreviateNumber(item?.marketCap)}
                  </td>
                  {#each displayRules as row (row?.rule)}
                    {#if row?.rule !== "marketCap"}
                      <td
                        class="whitespace-nowrap text-sm sm:text-[1rem] text-end text-white"
                      >
                        {#if ["ema20", "ema50", "ema100", "ema200", "analystRating", "topAnalystRating", "halalStocks", "score", "sector", "industry", "country"]?.includes(row?.rule)}
                          {item[row?.rule]}
                        {:else}
                          {abbreviateNumber(item[row?.rule])}
                        {/if}
                      </td>
                    {/if}
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else if displayTableTab === "performance"}
        <div class="w-full rounded-md overflow-x-scroll">
          <table
            class="table table-sm table-compact w-full bg-table border border-gray-800"
          >
            <thead>
              <TableHeader {columns} {sortOrders} {sortData} />
            </thead>
            <tbody>
              {#each displayResults as item (item?.symbol)}
                <tr
                  class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] border-b border-gray-800 odd:bg-odd"
                >
                  <td class=" whitespace-nowrap">
                    <a
                      href={"/stocks/" + item?.symbol}
                      class="sm:hover:text-white text-blue-400 text-sm sm:text-[1rem]"
                      >{item?.symbol}</a
                    >
                  </td>
                  <td class="whitespace-nowrap text-[1rem] text-white">
                    {item?.name?.length > charNumber
                      ? item?.name?.slice(0, charNumber) + "..."
                      : item?.name}
                  </td>

                  {#each tabRuleList as row (row?.rule)}
                    <td
                      class="whitespace-nowrap text-sm sm:text-[1rem] text-end text-white"
                    >
                      {#if row?.rule === "marketCap"}
                        {abbreviateNumber(item[row?.rule])}
                      {:else if item[row?.rule] > 0}
                        <span class="text-[#00FC50]"
                          >+{abbreviateNumber(
                            item[row?.rule]?.toFixed(2),
                          )}%</span
                        >
                      {:else if item[row?.rule] < 0}
                        <span class="text-[#FF2F1F]"
                          >{abbreviateNumber(
                            item[row?.rule]?.toFixed(2),
                          )}%</span
                        >
                      {:else}
                        <span class="text-[#fff]">-</span>
                      {/if}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else if displayTableTab === "analysts"}
        <div class="w-full rounded-md overflow-x-scroll">
          <table
            class="table table-sm table-compact w-full bg-table border border-gray-800"
          >
            <thead>
              <TableHeader {columns} {sortOrders} {sortData} />
            </thead>
            <tbody>
              {#each displayResults as item (item?.symbol)}
                <tr
                  class="sm:hover:bg-[#245073] sm:hover:bg-opacity-[0.2] border-b border-gray-800 odd:bg-odd"
                >
                  <td class=" whitespace-nowrap">
                    <a
                      href={"/stocks/" + item?.symbol}
                      class="sm:hover:text-white text-blue-400 text-sm sm:text-[1rem]"
                      >{item?.symbol}</a
                    >
                  </td>
                  <td class="whitespace-nowrap text-[1rem] text-white">
                    {item?.name?.length > charNumber
                      ? item?.name?.slice(0, charNumber) + "..."
                      : item?.name}
                  </td>

                  {#each tabRuleList as row (row?.rule)}
                    <td
                      class="whitespace-nowrap text-sm sm:text-[1rem] text-end text-white"
                    >
                      {#if row?.rule === "marketCap"}
                        {abbreviateNumber(item[row?.rule])}
                      {:else if ["analystCounter", "priceTarget"]?.includes(row?.rule)}
                        <span class="text-white"
                          >{abbreviateNumber(item[row?.rule])}</span
                        >
                      {:else if row?.rule === "upside"}
                        {#if item[row?.rule] > 0}
                          <span class="text-[#00FC50]"
                            >+{item[row?.rule]?.toFixed(2)}%</span
                          >
                        {:else if item[row?.rule] < 0}
                          <span class="text-[#FF2F1F]"
                            >{item[row?.rule]?.toFixed(2)}%</span
                          >
                        {:else}
                          <span class="text-[#fff]">n/a</span>
                        {/if}
                      {:else if ["analystRating", "topAnalystRating"]?.includes(row?.rule)}
                        {#if ["Strong Buy", "Buy"].includes(item[row?.rule])}
                          <span class="text-[#00FC50]">{item[row?.rule]}</span>
                        {:else if ["Strong Sell", "Sell"].includes(item[row?.rule])}
                          <span class="text-[#FF2F1F]">{item[row?.rule]}</span>
                        {:else if item[row?.rule] === "Hold"}
                          <span class="text-[#FFA838]">{item[row?.rule]}</span>
                        {:else}
                          -
                        {/if}
                      {/if}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {:else}
      <Infobox
        text="Looks like your taste is one-of-a-kind! No matches found... yet!"
      />
    {/if}
  {:else}
    <div class="flex justify-center items-center h-80">
      <div class="relative">
        <label
          class="bg-primary rounded-xl h-14 w-14 flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <span class="loading loading-spinner loading-md text-gray-400"></span>
        </label>
      </div>
    </div>
  {/if}

  <!--End Matching Preview-->
</section>

<!--
  <div class="tabs w-screen mb-5 ">
    <label on:click={() => handleRuleTab('all')} class="tab mr-2 text-white font-medium transition duration-150 ease-out hover:ease-out rounded-md hover:bg-[#333333] {displayTab === 'all' ? 'bg-[#333333]' : ''}">
      All
    </label> 
    <label on:click={() => handleRuleTab('ta')} class="tab mr-2 text-white font-medium transition duration-150 ease-out hover:ease-out rounded-md hover:bg-[#333333] {displayTab === 'ta' ? 'bg-[#333333]' : ''}">
      Technical Indicators
    </label> 
    <label on:click={() => handleRuleTab('fund')} class="tab mr-2 text-white font-medium transition duration-150 ease-out hover:ease-out rounded-md hover:bg-[#333333] {displayTab === 'fund' ? 'bg-[#333333]' : ''}">
      Fundamental Data
    </label> 
  </div>
-->

<!--Start Choose Rule Modal-->
<input type="checkbox" id="ruleModal" class="modal-toggle" />
<dialog id="ruleModal" class="modal p-2 lg:p-0">
  <label
    id="ruleModal"
    for="ruleModal"
    on:click={() => (searchTerm = "")}
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.8]"
  ></label>

  <div
    class="modal-box relative bg-primary z-20 mx-2 min-h-[30vh] h-[800px] rounded bg-default opacity-100 border border-gray-600 bp:mx-3 sm:mx-4 w-full max-w-6xl overflow-y-auto"
  >
    <div class="relative flex flex-col w-full">
      <!-- Sticky Header -->

      <div
        class="fixed w-full h-fit sticky -top-6 z-40 bg-primary shadow-sm opacity-100 pb-6 pt-5 border-gray-600 border-b"
      >
        <div class="flex flex-row items-center justify-between mb-2">
          <h2 class="text-white text-[1rem] sm:text-xl font-semibold">
            Select screener filters ({allRows?.length} total)
          </h2>
          <label
            for="ruleModal"
            class="inline-block cursor-pointer absolute right-0 top-3 text-[1.3rem] sm:text-[1.8rem] text-white"
          >
            <svg
              class="w-6 h-6 sm:w-8 sm:h-8"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              ><path
                fill="white"
                d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"
              /></svg
            >
          </label>
        </div>

        <!-- Start Search bar -->
        <form
          class="w-full h-8"
          on:keydown={(e) => (e?.key === "Enter" ? e.preventDefault() : "")}
        >
          <label for="search" class="text-sm font-medium text-gray-200 sr-only"
            >Search</label
          >
          <div class="relative w-full max-w-sm">
            <div
              class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
            >
              <svg
                class="w-4 h-4 text-gray-200"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>

            <div
              class="absolute inset-y-0 right-0 flex items-center pr-2 {searchTerm?.length >
              0
                ? ''
                : 'hidden'}"
            >
              <button
                on:click={() => (searchTerm = "")}
                class="cursor-pointer text-gray-200 sm:hover:text-white"
                tabindex="0"
                ><svg
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="max-width:40px"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path></svg
                ></button
              >
            </div>

            <input
              autocomplete="off"
              type="search"
              id="search"
              class="placeholder-gray-300 block w-full p-2 ps-10 text-sm text-gray-200 border border-gray-600 rounded-md bg-secondary border border-blue-500"
              placeholder="Search"
              bind:value={searchTerm}
            />
          </div>
        </form>
        <!-- End Search bar -->
      </div>

      <!-- Content -->
      <div class="text-white">
        {#each searchTerm?.length !== 0 ? Object?.entries(filteredGroupedRules) : Object?.entries(groupedRules) as [category, rules]}
          <h4 class="mb-1 font-semibold text-lg mt-5">{category}</h4>
          <div class="flex flex-wrap">
            {#each rules as row}
              <div
                class="flex w-full items-center space-x-1.5 py-1.5 md:w-1/2 lg:w-1/3 lg:py-1"
              >
                {#if ["gexRatio", "ivRank", "iv30d", "totalOI", "changeOI", "netCallPrem", "netPutPrem", "callVolume", "putVolume", "pcRatio", "topAnalystRating", "topAnalystCounter", "topAnalystPriceTarget", "topAnalystUpside", "score"]?.includes(row?.rule) && data?.user?.tier !== "Pro"}
                  <label id={row?.rule} on:click={() => changeRule(row?.rule)}>
                    <svg
                      class="w-4 h-4 mb-1 inline-block text-[#A3A3A3] sm:hover:text-white cursor-pointer"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      ><path
                        fill="currentColor"
                        d="M17 9V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2c-1.7 0-3 1.3-3 3v7c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3v-7c0-1.7-1.3-3-3-3M9 7c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9z"
                      /></svg
                    >
                  </label>
                {:else}
                  <input
                    on:click={() => changeRule(row?.rule)}
                    id={row?.rule}
                    type="checkbox"
                    checked={ruleOfList?.find(
                      (rule) => rule?.name === row?.rule,
                    )}
                    class="h-[18px] w-[18px] rounded-sm ring-offset-0 lg:h-4 lg:w-4"
                  />
                {/if}
                <div class="-mt-0.5">
                  <label for={row?.rule} class="cursor-pointer text-[1rem]"
                    >{row?.label}</label
                  >
                </div>
              </div>
            {/each}
          </div>
        {/each}
        {#if searchTerm?.length > 0 && Object?.entries(filteredGroupedRules)?.length === 0}
          <div class="text-white mt-5 font-semibold text-[1rem] sm:text-lg">
            Nothing found
          </div>
        {/if}
      </div>
    </div>
  </div>
</dialog>

<!--End Choose Rule Modal-->

<!--Start Add Strategy Modal-->
<input type="checkbox" id="addStrategy" class="modal-toggle" />

<dialog id="addStrategy" class="modal modal-bottom sm:modal-middle">
  <label
    for="addStrategy"
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.5]"
  ></label>

  <div class="modal-box w-full bg-primary border border-gray-600">
    <h1 class="text-white text-2xl font-bold">New Strategy</h1>

    <form
      on:submit={createStrategy}
      method="POST"
      class="space-y-2 pt-5 pb-10 sm:pb-5"
    >
      <Input
        id="title"
        type="text"
        errors=""
        label="Strategy Name"
        required={true}
      />

      <button
        type="submit"
        class="mt-10 btn bg-[#fff] sm:hover:bg-gray-300 duration-100 btn-md w-full rounded-md m-auto text-black font-semibold text-md"
      >
        Create Strategy
      </button>
    </form>
  </div>
</dialog>

<!--End Add Strategy Modal-->

<!--Start Delete Strategy Modal-->
<input type="checkbox" id="deleteStrategy" class="modal-toggle" />

<dialog id="deleteStrategy" class="modal modal-bottom sm:modal-middle">
  <label
    for="deleteStrategy"
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.5]"
  ></label>

  <div
    class="modal-box w-full bg-primary border border-gray-600 overflow-hidden"
  >
    <h3
      class="font-bold text-md sm:text-lg flex justify-center items-center mt-10 text-white"
    >
      Are you sure you want to delete the strategy?
    </h3>

    <div
      class="modal-action w-full m-auto p-5 flex flex-col sm:flex-row items-center"
    >
      <label
        for="deleteStrategy"
        on:click={handleDeleteStrategy}
        class="mt-5 btn bg-[#fff] sm:hover:bg-gray-300 btn-md w-full rounded-md m-auto text-black font-semibold text-md"
      >
        Proceed
      </label>
    </div>
  </div>
</dialog>

<!--End Delete Strategy Modal-->

<input type="checkbox" id="mobileTooltip" class="modal-toggle" />

<dialog id="mobileTooltip" class="modal p-3">
  <label
    for="mobileTooltip"
    class="cursor-pointer modal-backdrop bg-[#000] bg-opacity-[0.8]"
  ></label>

  <!-- Desktop modal content -->
  <div
    class="modal-box rounded-md border border-gray-600 w-full bg-secondary flex flex-col items-center"
  >
    <div class="text-white mb-5 text-center">
      <h3 class="font-bold text-2xl mb-5">{tooltipTitle}</h3>
      <span class="text-white text-[1rem] font-normal"
        >{infoText?.text ?? "n/a"}</span
      >
      {#if infoText?.equation !== undefined}
        <div class="w-5/6 m-auto mt-5"></div>
        <div class="text-[1rem] w-full pt-3 pb-3 m-auto text-white">
          {infoText?.equation}
        </div>
      {/if}
    </div>

    <div class="border-t border-gray-600 mt-2 w-full">
      <label
        for="mobileTooltip"
        class="cursor-pointer mt-4 font-semibold text-white text-xl m-auto flex justify-center"
      >
        Close
      </label>
    </div>
  </div>
</dialog>

<!--Start Login Modal-->
{#if LoginPopup}
  <LoginPopup {form} />
{/if}

<!--End Login Modal-->

<style>
  .scroller {
    scrollbar-width: thin;
  }

  .scrollbar {
    display: grid;
    grid-gap: 90px;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    grid-auto-flow: column;
    overflow-x: auto;
    scrollbar-width: thin; /* Hide the default scrollbar in Firefox */
    scrollbar-color: transparent transparent; /* Hide the default scrollbar in Firefox */
  }

  /* Custom scrollbar for Webkit (Chrome, Safari) */
  .scrollbar::-webkit-scrollbar {
    width: 0; /* Hide the width of the scrollbar */
    height: 0; /* Hide the height of the scrollbar */
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: transparent; /* Make the thumb transparent */
  }
</style>
