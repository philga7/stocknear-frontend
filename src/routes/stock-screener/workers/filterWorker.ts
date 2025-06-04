import { sectorList, industryList, listOfRelevantCountries } from "$lib/utils";

const movingAverageConditions = {
  // EMA conditions
  "Stock Price > EMA20": (item) => item.price > item.ema20,
  "Stock Price > EMA50": (item) => item.price > item.ema50,
  "Stock Price > EMA100": (item) => item.price > item.ema100,
  "Stock Price > EMA200": (item) => item.price > item.ema200,
  "EMA20 > EMA50": (item) => item.ema20 > item.ema50,
  "EMA20 > EMA100": (item) => item.ema20 > item.ema100,
  "EMA20 > EMA200": (item) => item.ema20 > item.ema200,
  "EMA50 > EMA20": (item) => item.ema50 > item.ema20,
  "EMA50 > EMA100": (item) => item.ema50 > item.ema100,
  "EMA50 > EMA200": (item) => item.ema50 > item.ema200,
  "EMA100 > EMA20": (item) => item.ema100 > item.ema20,
  "EMA100 > EMA50": (item) => item.ema100 > item.ema50,
  "EMA100 > EMA200": (item) => item.ema100 > item.ema200,
  "EMA200 > EMA20": (item) => item.ema200 > item.ema20,
  "EMA200 > EMA50": (item) => item.ema200 > item.ema50,
  "EMA200 > EMA100": (item) => item.ema200 > item.ema100,

  // SMA conditions
  "Stock Price > SMA20": (item) => item.price > item.sma20,
  "Stock Price > SMA50": (item) => item.price > item.sma50,
  "Stock Price > SMA100": (item) => item.price > item.sma100,
  "Stock Price > SMA200": (item) => item.price > item.sma200,
  "SMA20 > SMA50": (item) => item.sma20 > item.sma50,
  "SMA20 > SMA100": (item) => item.sma20 > item.sma100,
  "SMA20 > SMA200": (item) => item.sma20 > item.sma200,
  "SMA50 > SMA20": (item) => item.sma50 > item.sma20,
  "SMA50 > SMA100": (item) => item.sma50 > item.sma100,
  "SMA50 > SMA200": (item) => item.sma50 > item.sma200,
  "SMA100 > SMA20": (item) => item.sma100 > item.sma20,
  "SMA100 > SMA50": (item) => item.sma100 > item.sma50,
  "SMA100 > SMA200": (item) => item.sma100 > item.sma200,
  "SMA200 > SMA20": (item) => item.sma200 > item.sma20,
  "SMA200 > SMA50": (item) => item.sma200 > item.sma50,
  "SMA200 > SMA100": (item) => item.sma200 > item.sma100,
  // Add additional SMA conditions here

  "Price > Graham Number": (item) => item.price > item.grahamNumber,
  "Price < Graham Number": (item) => item.price < item.grahamNumber,
};

// Convert the input to a value or return it as-is if it's already an array
function convertUnitToValue(input: string | number | string[]) {
  try {
    if (Array.isArray(input)) {
      return input.map(convertUnitToValue); // Recursively convert array elements
    }
    if (typeof input === "number") return input;
    if (typeof input !== "string") {
      return input; // Return as-is if not a string or number
    }

    const lowerInput = input.toLowerCase();

    // Pre-compute the set for quick lookups
    const nonNumericValues = new Set([
      "any",
      ...sectorList,
      ...industryList,
      ...listOfRelevantCountries,
      'before market open',
      'after market close',
      'quarterly',
      'monthly',
      'annual',
      'semi-annual',
      "hold",
      "sell",
      "buy",
      "strong buy",
      "strong sell",
      "compliant",
      "non-compliant",
      "stock price",
    ]);
    
    if (nonNumericValues.has(lowerInput)) return input;

    // Handle percentage values
    if (input?.endsWith("%")) {
      const numericValue = parseFloat(input?.slice(0, -1));  // Remove '%' and convert to number
      if (isNaN(numericValue)) {
        return input; // Return original input if conversion fails
      }
      return numericValue //numericValue / 100; // Convert percentage to a decimal
    }

    // Handle units (B, M, K)
    const units = { B: 1_000_000_000, M: 1_000_000, K: 1_000 };
    const match = input.match(/^(-?\d+(\.\d+)?)([BMK])?$/); // Allow optional '-' at the beginning
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[3] as keyof typeof units;
      return unit ? value * units[unit] : value;
    }

    // Default numeric conversion (if no unit specified)
    const numericValue = parseFloat(input);
    if (isNaN(numericValue)) {
      return input; // Return original input if conversion fails
    }

    return numericValue;
  } catch (error) {
    console.warn(`Error converting value: ${input}`, error);
    return input; // Return original input in case of any unexpected errors
  }
}

// Centralized rule checking logic
function createRuleCheck(rule, ruleName, ruleValue) {
  // Handle 'any' condition quickly
  if (rule.value === 'any') return () => true;



  if (rule.name === 'earningsDate') {
    // Force ruleValueRaw to a lower‐cased string. If it was passed as a number/array, coerce to string first.
    const label = String(rule.value).trim().toLowerCase();

    // Get “midnight UTC” of “today”
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Helper: format a Date object as "YYYY-MM-DD"
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    // Pre‐compute ranges for each label
    // Each entry is [startDateString, endDateString], inclusive
    const ranges: Record<string, [string, string]> = {
      'today': [fmt(todayUTC), fmt(todayUTC)],
      'tomorrow': [
        fmt(new Date(todayUTC.getTime() + 86400_000)), 
        fmt(new Date(todayUTC.getTime() + 86400_000))
      ],
      'yesterday': [
        fmt(new Date(todayUTC.getTime() - 86400_000)), 
        fmt(new Date(todayUTC.getTime() - 86400_000))
      ],
      'next 7d': [
        fmt(todayUTC),
        fmt(new Date(todayUTC.getTime() + 7 * 86400_000))
      ],
      'next 30d': [
        fmt(todayUTC),
        fmt(new Date(todayUTC.getTime() + 30 * 86400_000))
      ],
      'this month': (() => {
        // first day of this month UTC
        const start = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), 1));
        // last day of this month UTC: month+1, day 0
        const end = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth() + 1, 0));
        return [fmt(start), fmt(end)];
      })(),
      'next month': (() => {
        // first day of next month UTC
        const start = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth() + 1, 1));
        // last day of next month UTC: (month+2, day 0)
        const end = new Date(Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth() + 2, 0));
        return [fmt(start), fmt(end)];
      })()
    };

    // If the label isn’t recognized, log and return “always true”
    if (!ranges[label]) {
      console.warn(`Unrecognized earningsDate label: "${rule.value}"`);
      return () => true;
    }

    const [minDateStr, maxDateStr] = ranges[label];

    return (item) => {
      if (!item.earningsDate) return false;
      // Parse item.earningsDate into a UTC “YYYY-MM-DD” string
      //  – If item.earningsDate is already "YYYY-MM-DD", new Date(...) will treat it as UTC.
      //  – If it’s "YYYY-MM-DDThh:mm:ssZ", new Date(...) also parses it as UTC.
      const d = new Date(item.earningsDate);
      if (isNaN(d.getTime())) {
        // If parse fails, treat as “no match”:
        return false;
      }
      const itemDateStr = d.toISOString().slice(0, 10);
      return itemDateStr >= minDateStr && itemDateStr <= maxDateStr;
    };
  }

    

  // Categorical checks
  const categoricalFields = [
    'analystRating', 'topAnalystRating', 'earningsTime','halalStocks', 'score', 
    'sector', 'industry', 'country','payoutFrequency'
  ];

  if (categoricalFields.includes(rule.name)) {
    return (item) => {
      const itemValue = item[rule.name];
      if (Array.isArray(ruleValue)) {
        return ruleValue.includes(itemValue);
      }
      return itemValue === ruleValue;
    };
  }

  // Moving averages checks
  const movingAverageFields = [
    'ema20', 'ema50', 'ema100', 'ema200', 
    'sma20', 'sma50', 'sma100', 'sma200', 
    'grahamnumber',
  ];

  if (movingAverageFields.includes(ruleName)) {
    return (item) => {
      if (Array.isArray(ruleValue)) {
        return ruleValue.every(condition => 
          movingAverageConditions[condition]?.(item) ?? true
        );
      }
      return true;
    };
  }

  // Between condition
  if (rule.condition === 'between' && Array?.isArray(ruleValue)) {
    return (item) => {
      const itemValue = item[rule.name];
      const [min, max] = ruleValue?.map(convertUnitToValue);


      // Handle empty/undefined min and max
      if ((min === '' || min === undefined || min === null) && 
          (max === '' || max === undefined || max === null)) {
        return true;
      }

      if (min === '' || min === undefined || min === null) {
        return itemValue < max;
      }

      if (max === '' || max === undefined || max === null) {
        return itemValue > min;
      }
      
      return itemValue > min && itemValue < max;
    };
  }

  // Default numeric comparisons
  return (item) => {
    const itemValue = item[rule.name];
    if (itemValue === null) return false;

   if (rule.condition === 'exactly' && itemValue !== ruleValue) return false;
  if (rule.condition === 'over' && itemValue <= ruleValue) return false;
  if (rule.condition === 'under' && itemValue > ruleValue) return false;



    // Default comparison if no specific condition
    return true;
  };
}


async function filterStockScreenerData(stockScreenerData, ruleOfList) {
  // Early return if no data or no rules
  if (!stockScreenerData?.length || !ruleOfList?.length) {
    return stockScreenerData || [];
  }

  // Precompile rule conditions to avoid repeated checks
  const compiledRules = ruleOfList.map(rule => {
    const ruleName = rule.name.toLowerCase();
    const ruleValue = convertUnitToValue(rule.value);

    return {
      ...rule,
      compiledCheck: createRuleCheck(rule, ruleName, ruleValue)
    };
  });

  // Use a more performant filtering method
  return stockScreenerData?.filter(item => 
    compiledRules?.every(rule => rule.compiledCheck(item))
  );
}


onmessage = async (event: MessageEvent) => {
  const { stockScreenerData, ruleOfList } = event.data || {};

  try {
    let filteredData = await filterStockScreenerData(
      stockScreenerData,
      ruleOfList
    );

    filteredData = filteredData?.sort((a,b) => b?.marketCap - a?.marketCap);

    postMessage({ 
      message: "success", 
      filteredData,
      originalDataLength: stockScreenerData?.length || 0,
      filteredDataLength: filteredData?.length || 0
    });
  } catch (error) {
    console.error('Error in onmessage handler:', error);
    postMessage({ 
      message: "error", 
      originalData: stockScreenerData,
      error: error.toString()
    });
  }
};

export {};