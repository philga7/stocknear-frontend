import { formatDistanceToNow } from "date-fns";

let pbCloudImage = import.meta.env.VITE_IMAGE_POCKETBASE_URL; // Set a default API URL

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
};

export function removeCompanyStrings(name) {
  const wordsToRemove = ["Technologies", "Inc.","Corp.","Corporation","Holding","Limited","Group"];
if (!name) return "";
    return wordsToRemove?.reduce((acc, word) => acc.replace(word, "").trim(), name);
}

export function convertToSlug(title) {
    // Remove punctuation, hyphens, and special characters
    const cleanedTitle = title
        .replace(/[-.,?!:"]/g, "") // Remove punctuation and hyphens
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .trim(); // Remove leading and trailing spaces

    // Convert to lowercase, split by spaces, and join with hyphens
    const words = cleanedTitle.toLowerCase().split(" ");
    const truncatedWords = words;

    // Join with hyphens
    const slug = truncatedWords.join("-");
    return slug;
}


export function isPWAInstalled() {
  try {
      // For iOS (Safari)

    const isInStandaloneMode = window.navigator.standalone;

  // For Android and other platforms
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  return isInStandaloneMode || isStandalone;
  }
  catch(e) {
    console.log(e)
    return false;
  }
  
}


export const computeGrowthSingleList = (data, actualList) => {
    // Initialize the result list
    let resultList = [];

    for (let i = 0; i < data?.length; i++) {
      const currentData = data[i];

      // Find the corresponding actual data from one FY back
      const correspondingActual = actualList?.find(
        (entry) => Number(entry.FY) === Number(currentData.FY) - 1,
      );

      // Calculate growth if a matching entry exists in actualList
      let growth = null;
      if (
        correspondingActual &&
        correspondingActual?.val !== null &&
        currentData.val !== null
      ) {
        growth = (
          ((currentData?.val - correspondingActual?.val) /
            Math.abs(correspondingActual?.val)) *
          100
        )?.toFixed(2);
      }

      // Push the result for this FY
      resultList.push({
        FY: currentData.FY,
        val: currentData.val,
        growth: growth !== null ? Number(growth) : null, // Convert growth to number or leave as null
      });
    }

    return resultList;
  }


  export const compareTimes = (time1, time2) => {
    const [hours1, minutes1] = time1.split(":").map(Number);
    const [hours2, minutes2] = time2.split(":").map(Number);

    if (hours1 > hours2) return 1;
    if (hours1 < hours2) return -1;
    if (minutes1 > minutes2) return 1;
    if (minutes1 < minutes2) return -1;
    return 0;
  }

 export const formatTime = (timeString) => {
    // Split the time string into components
    const [hours, minutes, seconds] = timeString.split(":").map(Number);

    // Determine AM or PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convert hours from 24-hour to 12-hour format
    const formattedHours = hours % 12 || 12; // Converts 0 to 12 for midnight

    // Format the time string
    const formattedTimeString = `${formattedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;

    return formattedTimeString;
  }


export const groupScreenerRules = (allRows) => {
  const categoryOrder = [
    "Most Popular", "Company Info","Price & Volume", "Options Activity","Valuation & Ratios", "Valuation & Price Targets", "Margins", 
    "Performance","Technical Analysis","Forecasts, Analysts & Price Targets", "Dividends", "Revenue / Sales", "Net Income", "Other Profits","Cash Flow", "Debt", "Shares Statistics", "Short Selling Statistics", "Others"
  ];

  // Group rows by category
  const grouped = allRows.reduce((acc, row) => {
    // Ensure category is an array if it's a single string
    const categories = Array.isArray(row.category) ? row.category : [row.category || "Others"]; // Default to "Others" if no category is provided

    categories.forEach((category) => {
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(row);
    });

    return acc;
  }, {});

  // Sort categories based on the defined order
  const orderedGroupedRules = Object.fromEntries(
    Object.entries(grouped).sort(
      ([keyA], [keyB]) => categoryOrder.indexOf(keyA) - categoryOrder.indexOf(keyB)
    )
  );

  return orderedGroupedRules;
}




export const groupEarnings = (earnings) => {
  return Object?.entries(
    earnings?.reduce((acc, item) => {
      // Force formatting in UTC to avoid local timezone conversion
      const dateKey = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
      })?.format(new Date(item.date));

      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    }, {})
  )
    // Sort the grouped dates in descending order
    ?.sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    ?.map(([date, earnings]) => [
      date,
      // Sort earnings within the date by time (also treat times as UTC)
      earnings?.sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a?.time}Z`);
        const timeB = new Date(`1970-01-01T${b?.time}Z`);
        return timeB - timeA;
      })
    ]);
};



export const groupNews = (news, watchList) => {
  return Object.entries(
    news
      ?.map(item => {
        // Add 'type' based on watchList
        const match = watchList?.find(w => w?.symbol === item?.symbol);
        return match ? { ...item, type: match.type } : { ...item };
      })
      ?.reduce((acc, item) => {
        const dateKey = new Intl.DateTimeFormat('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(new Date(item?.publishedDate));
        const titleKey = item.title;
        if (!acc[dateKey]) acc[dateKey] = {};
        if (!acc[dateKey][titleKey]) acc[dateKey][titleKey] = [];
        acc[dateKey][titleKey]?.push(item);
        return acc;
      }, {})
  )
    // Sort the grouped dates in descending order to have the latest date first
    ?.sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
    ?.map(([date, titleGroup]) => [
      date,
      Object.entries(titleGroup)
        // Sort titles by the latest time of their items
        .sort(([, itemsA], [, itemsB]) => {
          const latestTimeA = new Date(Math.max(...itemsA.map(item => new Date(item.publishedDate))));
          const latestTimeB = new Date(Math.max(...itemsB.map(item => new Date(item.publishedDate))));
          return latestTimeB - latestTimeA;
        })
        .map(([title, items]) => {
          // Sort items within each title group by latest time
          items.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
          
          // Get the unique symbols
          const symbols = [...new Set(items.map(item => item.symbol))];
          
          // Return the group with symbols and items
          return { title, items, symbols };
        }),
    ]);
};


export const calculateChange = (oldList = [], newList = []) => {
  if (!oldList.length || !newList.length) return [...oldList];

  // Create a Map for fast lookups of new list items by symbol
  const newListMap = new Map(newList.map((item) => [item.symbol, item]));

  return oldList.map((item) => {
    const newItem = newListMap.get(item.symbol);

    // Check if the symbols match and the newItem has the necessary properties
    if (newItem && newItem.symbol === item.symbol && newItem.avgPrice) {
      const { price, changesPercentage } = item;
      const newPrice = newItem.avgPrice;

      // Only update the changesPercentage if both price and changesPercentage are defined
      if (price != null && changesPercentage != null) {
        const baseLine = price / (1 + Number(changesPercentage) / 100);
        item.changesPercentage = ((newPrice / baseLine - 1) * 100);
      }

      item.previous = price;
      item.price = newPrice;
    }

    return item;
  });
};



export function updateStockList(stockList = [], originalData = []) {
  // Create a Map for fast O(1) lookups of original data by symbol
  const originalDataMap = new Map(originalData.map(item => [item.symbol, item]));

  // Initialize an array to store the updated stock list
  const updatedStockList = [];

  // Iterate through each stock in the stockList
  for (let i = 0; i < stockList.length; i++) {
    const stock = stockList[i];
    const matchingStock = originalDataMap?.get(stock?.symbol);
    // If a matching stock is found, update it
    if (matchingStock) {
      updatedStockList.push({
        ...stock,
        price: matchingStock.price,
        changesPercentage: matchingStock.changesPercentage,
        previous: matchingStock.previous ?? null,
      });
    } else {
      // If no match, add the stock unchanged
      updatedStockList.push(stock);
    }
  }

  // Return the updated stock list
  return updatedStockList;
}


export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 0 },
): TransitionConfig => {
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;

  const scaleConversion = (
    valueA: number,
    scaleA: [number, number],
    scaleB: [number, number],
  ) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;

    const percentage = (valueA - minA) / (maxA - minA);
    const valueB = percentage * (maxB - minB) + minB;

    return valueB;
  };

  const styleToString = (
    style: Record<string, number | string | undefined>,
  ): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + key + ":" + style[key] + ";";
    }, "");
  };

  return {
    duration: Math.max(params.duration ?? 300, 1), // Ensure a minimum duration of 1ms
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

      return styleToString({
        transform:
          transform +
          "translate3d(" +
          x +
          "px, " +
          y +
          "px, 0) scale(" +
          scale +
          ")",
        opacity: t,
      });
    },
    easing: cubicOut,
  };
};

export const sortTableData = (key, displayList, rawData, sortOrders) => {
  // Reset all other keys to 'none' except the current key
  for (const k in sortOrders) {
    if (k !== key) {
      sortOrders[k].order = "none";
    }
  }

  // Cycle through 'none', 'asc', 'desc' for the clicked key
  const orderCycle = ["none", "asc", "desc"];
  const originalData = rawData?.slice(0, 40);
  const currentOrderIndex = orderCycle.indexOf(sortOrders[key].order);
  sortOrders[key].order =
    orderCycle[(currentOrderIndex + 1) % orderCycle.length];
  const sortOrder = sortOrders[key].order;

  // Reset to original data when 'none' and stop further sorting
  if (sortOrder === "none") {
    analytRatingList = [...originalData]; // Reset to original data (spread to avoid mutation)
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
  analytRatingList = [...originalData].sort(compareValues);
};

export const formatDateRange = (lastDateStr) => {
  // Convert lastDateStr to Date object
  const lastDate = new Date(lastDateStr);

  // Set the first date to the beginning of the month of lastDate
  const firstDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);

  // Format first and last dates
  const firstDateFormatted = firstDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    day: "2-digit",
  });
  const lastDateFormatted = lastDate.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    day: "2-digit",
  });
  // Construct and return the formatted date range string
  return `${firstDateFormatted} - ${lastDateFormatted}`;
};

export const serializeNonPOJOs = (obj) => {
  return structuredClone(obj);
};

export const generateUsername = (name) => {
  const randomHex = Math.floor(Math.random() * 65536).toString(16);
  const id = randomHex.padStart(4, "0");
  return `${name.slice(0, 5)}${id}`;
};

export const getImageURL = (collectionId, recordId, fileName, size = "0x0") => {
  //For development or local storage or S3 bucket without CDN Cloudfront
  if (pbCloudImage === "http://localhost:8090") {
    return `${pbCloudImage}/api/files/${collectionId}/${recordId}/${fileName}?thumb=${size}`;
  }
  return `${pbCloudImage}/${collectionId}/${recordId}/${fileName}?thumb=${size}`;
};

export const validateData = async (formData, schema) => {
  const body = Object.fromEntries(formData);

  try {
    const data = schema.parse(body);
    return {
      formData: data,
      errors: null,
    };
  } catch (err) {
    console.log("Error: ", err);
    const errors = err.flatten();
    return {
      formData: body,
      errors,
    };
  }
};

export function sumQuarterlyResultsByYear(quarterlyResults, namingList) {
  const yearlySummaries = {};
  const quarterCounts = {};
  // FMP sucks since these keys are up to date only by the last quarter value
  const lastQuarterKeys = new Set([namingList]); // Keys that need last quarter values

  // Define a Set of keys to exclude from summing
  // FMP sucks since these keys are up to date for every quarter hence no summation required
  const excludeKeys = new Set([
    "totalDebt",
    "priceToEarnings",
    "weightedAverageShsOut",
    "weightedAverageShsOutDil",
  ]);

  // Function to get the quarter number from the period string
  function getQuarterNumber(period) {
    switch (period) {
      case "Q1":
        return 1;
      case "Q2":
        return 2;
      case "Q3":
        return 3;
      case "Q4":
        return 4;
      default:
        return 0;
    }
  }

  // Iterate over each quarterly result
  quarterlyResults?.forEach((quarter) => {
    // Extract year and quarter from the data
    const year = quarter?.calendarYear;
    const quarterNum = getQuarterNumber(quarter?.period);

    // Initialize the year in summaries and quarter counts if not already present
    if (!yearlySummaries[year]) {
      yearlySummaries[year] = {
        calendarYear: `${year}`, // Use end of the year date
        lastQuarterProcessed: 0, // Keep track of the last quarter processed
        date: quarter?.date, // Copy the 'date' field unchanged
      };
      quarterCounts[year] = 0;
    }

    // Increment the quarter count for the year
    quarterCounts[year]++;

    // Update last quarter processed if the current quarter is greater
    if (quarterNum > yearlySummaries[year].lastQuarterProcessed) {
      yearlySummaries[year].lastQuarterProcessed = quarterNum;
      // Update the date to the latest quarter's date if applicable
      yearlySummaries[year].date = quarter?.date;
    }

    // Sum up the numeric fields for the year, excluding specific keys
    Object?.keys(quarter)?.forEach((key) => {
      if (
        typeof quarter[key] === "number" &&
        !excludeKeys?.has(key) &&
        !lastQuarterKeys.has(key)
      ) {
        yearlySummaries[year][key] =
          (yearlySummaries[year][key] || 0) + quarter[key];
      } else if (excludeKeys.has(key)) {
        // Directly copy the last quarter value for these keys
        yearlySummaries[year][key] = quarter[key];
      } else if (lastQuarterKeys.has(key) && quarterNum === 4) {
        // Update only if it's the last quarter of the year
        yearlySummaries[year][key] = quarter[key];
      }
    });
  });

  // Filter out years with less than 4 quarters
  const validYears = Object?.keys(quarterCounts)?.filter(
    (year) => quarterCounts[year] === 4,
  );
  const annualResults = validYears?.map((year) => yearlySummaries[year]);

  // Sort the results by year in descending order
  annualResults.sort((a, b) => b?.calendarYear?.localeCompare(a?.calendarYear));

  return annualResults;
}

export const sortPostsByDate = (posts) => {
  return posts.sort(function (a, b) {
    return new Date(b.created) - new Date(a.created);
  });
};

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatString(inputString) {
  // Split the input string into words using space as a delimiter
  const words = inputString?.split(" ");

  // Capitalize the first letter of each word and convert the rest to lowercase
  const formattedWords = words?.map((word, index) => {
    if (word.length > 0) {
      // Check if the word is "LTG" or "LLC" and keep them uppercase
      const excludedList = [
        "n/a",
        "CEO",
        "U.S.",
        "NGL",
        "ETF",
        "SPDR",
        "S&P",
        "USD",
        "US",
        "JPMORGAN",
        "SRS",
        "AQR",
        "XN",
        "TIG",
        "HAP",
        "AB",
        "AKRE",
        "LTG",
        "LLC",
        "JVL",
        "NJ",
        "FMR",
        "LP",
        "NNS",
        "BPS",
        "BNP",
        "PCG",
        "CTC",
        "IMC",
        "PLC",
        "WIT",
      ];

      // Check if the word is "black-rock" and format it accordingly
      if (
        index < words?.length - 1 &&
        word?.toLowerCase() === "black" &&
        words[index + 1]?.toLowerCase() === "rock"
      ) {
        return "Black Rock";
      } else if (excludedList?.includes(word)) {
        return word;
      } else {
        return word?.charAt(0)?.toUpperCase() + word?.slice(1)?.toLowerCase();
      }
    }
    return word; // Handle empty words if any
  });

  // Join the formatted words back together with spaces
  const formattedString = formattedWords?.join(" ");

  return formattedString;
}


export function abbreviateNumberWithColor(number, addDollarSign = false, color = false) {
  // Check if number is null or undefined, return "-" if true
  if (number == null) {
    return "-";
  }

  const negative = number < 0;

  // Handle special case for exactly 1000
  if (Math.abs(number) === 1000) {
    const suffix = color ? '<span class=\"text-yellow-500\">K</span>' : 'K';
    return addDollarSign
      ? negative
        ? `-\$1${suffix}`
        : `\$1${suffix}`
      : negative
      ? `-1${suffix}`
      : `1${suffix}`;
  }

  if (Math.abs(number) !== 0 && Math.abs(number) > 1000) {
    const suffixes = ["", "K", "M", "B", "B", "T", "Q", "Qu", "S", "O", "N", "D"];
    const magnitude = Math.floor(Math.log10(Math.abs(number)));
    let index = Math.min(Math.floor(magnitude / 3), suffixes.length - 1);

    // Special case to keep numbers in trillions formatted as billions
    if (index >= 4) {
      index = 3; // Keep the suffix at "B"
    }

    let abbreviation = Math.abs(number) / Math.pow(10, index * 3);

    // Set the desired number of decimals
    if (abbreviation >= 1000) {
      abbreviation = abbreviation.toFixed(1);
      index++;
    } else {
      abbreviation = abbreviation.toFixed(2);
    }

    abbreviation = parseFloat(abbreviation).toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

    let suffix = suffixes[index];

if (color) {
  if (suffix === "K") {
    suffix = '<span class="font-semibold text-[#8F82FE]">K</span>';
  } else if (suffix === "M") {
    suffix = '<span class="font-semibold text-[#C8A32D]">M</span>';
  } else if (suffix === "B") {
    suffix = '<span class="font-semibold text-[#2CB8A6]">B</span>';
  }
}


    const formattedNumber = abbreviation + suffix;

    return addDollarSign
      ? (negative ? "-\$" : "\$") + formattedNumber
      : negative
      ? "-" + formattedNumber
      : formattedNumber;
  } else if (Math.abs(number) >= 0 && Math.abs(number) < 1000) {
    return addDollarSign
      ? (negative ? "-\$" : "\$") + Math.abs(number)
      : negative
      ? "-" + Math.abs(number)
      : number.toString();
  } else {
    return addDollarSign ? "\$0" : "0";
  }
}


export function abbreviateNumber(
  number,
  addDollarSign = false,
  stripTrailingZeros = true
) {
  // Check if number is null or undefined, return "-" if true
  if (number == null) {
    return "-";
  }

  const negative = number < 0;

  // Handle special case for exactly 1000
  if (Math.abs(number) === 1000) {
    return addDollarSign
      ? negative
        ? "-$1K"
        : "$1K"
      : negative
      ? "-1K"
      : "1K";
  }

  if (Math.abs(number) !== 0 && Math.abs(number) > 1000) {
    const suffixes = ["", "K", "M", "B", "B", "T", "Q", "Qu", "S", "O", "N", "D"];
    const magnitude = Math.floor(Math.log10(Math.abs(number)));
    let index = Math.min(Math.floor(magnitude / 3), suffixes.length - 1);

    // Special case to keep numbers in trillions formatted as billions
    if (index >= 4) {
      index = 3; // Keep the suffix at "B"
    }

    let abbreviation = Math.abs(number) / Math.pow(10, index * 3);

    // Set the desired number of decimals
    if (abbreviation >= 1000) {
      abbreviation = abbreviation.toFixed(1);
      index++;
    } else {
      abbreviation = abbreviation.toFixed(2);
    }

    // When stripTrailingZeros is true, we set the minimumFractionDigits to 0
    const localeOptions = {
      maximumFractionDigits: 2,
      minimumFractionDigits: stripTrailingZeros ? 0 : 2,
    };

    abbreviation = parseFloat(abbreviation).toLocaleString("en-US", localeOptions);

    const formattedNumber = abbreviation + suffixes[index];

    return addDollarSign
      ? (negative ? "-$" : "$") + formattedNumber
      : negative
      ? "-" + formattedNumber
      : formattedNumber;
  } else if (Math.abs(number) >= 0 && Math.abs(number) < 1000) {
    return addDollarSign
      ? (negative ? "-$" : "$") + Math.abs(number)
      : negative
      ? "-" + Math.abs(number)
      : number.toString();
  } else {
    return addDollarSign ? "$0" : "0";
  }
}


export function formatDate(dateStr) {
  try {
    // Parse the input date string in Berlin timezone
    const berlinFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const parseDate = (date) => {
      const parts = berlinFormatter?.formatToParts(date);
      const extract = (type) =>
        parts.find((p) => p.type === type)?.value.padStart(2, '0');
      return new Date(
        `${extract('year')}-${extract('month')}-${extract('day')}T${extract('hour')}:${extract('minute')}:${extract('second')}`
      );
    };

    const berlinDateObj = parseDate(new Date(dateStr));
    const berlinCurrentObj = parseDate(new Date());

    // Calculate the time difference in seconds
    const seconds = Math.floor((berlinCurrentObj - berlinDateObj) / 1000);

    // Define time intervals including seconds so that even differences < 60 are handled
    const intervals = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'week', seconds: 604800 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 },
    ];

    // Determine the appropriate time interval
    for (const { unit, seconds: secondsInUnit } of intervals) {
      const count = Math.floor(seconds / secondsInUnit);
      if (count >= 1) {
        return `${count} ${unit}${count === 1 ? '' : 's'} ago`;
      }
    }

    // Fallback in case the difference is 0 seconds
    return 'Just now';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}





export const formatRuleValue = (rule) => {
  if (["interestIncome", "interestExpenses"].includes(rule.name)) {
    return `$${rule.value === 1000 ? `${rule.value / 1000} Bn` : `${rule.value} Mio`}`;
  } else if (
    [
      "revenue",
      "costOfRevenue",
      "costAndExpenses",
      "netIncome",
      "grossProfit",
      "researchAndDevelopmentExpenses",
      "marketCap",
      "operatingExpenses",
      "operatingIncome",
      "ebitda",
    ].includes(rule.name)
  ) {
    return `${rule.condition} $${rule.value} Bn`;
  } else if (rule.name === "aiSignal") {
    return `${rule.value === "2" ? "Buy" : rule.value === "1" ? "Hold" : rule.value === "0" ? "Sell" : "n/a"} Signal`;
  } else if (["avgVolume"].includes(rule.name)) {
    return `${rule.condition} ${rule.value} Mio`;
  } else if (["var"].includes(rule.name)) {
    return `${rule.condition} ${rule.value}%`;
  } else if (["ratingRecommendation"].includes(rule.name)) {
    return rule.value === 2 ? "Buy" : rule.value === 1 ? "Hold" : "Sell";
  } else if (["trendAnalysis", "fundamentalAnalysis"].includes(rule.name)) {
    return `${rule.condition} ${rule.value}% Accuracy`;
  } else {
    return `${rule.condition} ${rule.value}${rule.name.includes("Growth") ? " %" : ""}`;
  }
};

export function formatETFName(inputString) {
  // Define special cases
  const specialCases = {
    "etf-mg": "ETFMG",
    ark: "ARK",
    "index-iq": "IndexIQ",
    "bny-mellon": "BNY Mellon",
    ssc: "SS&C",
    pgim: "PGIM",
    "jpmorgan-chase": "JPMorgan Chase",
    "us-global-investors": "US Global Investors",
    // Add more special cases as needed
  };

  // Check if the input string is a special case
  const lowerCaseInput = inputString?.toLowerCase();
  if (specialCases?.hasOwnProperty(lowerCaseInput)) {
    return specialCases[lowerCaseInput];
  }

  // Split the input string into an array of words
  const words = inputString?.split("-");

  // Capitalize the first letter of each word
  const capitalizedWords = words?.map(
    (word) => word.charAt(0)?.toUpperCase() + word?.slice(1),
  );

  // Join the words back together with a space between them
  const formattedString = capitalizedWords?.join(" ");

  return formattedString;
}

// Function to add days to a given date
export function addDays(data, days, state) {
  let result;
  const createdDate = new Date(data?.user?.created);

  result = new Date(createdDate);
  result.setDate(result.getDate() + days);

  if (state === "date") {
    return result;
  } else {
    const differenceInTime = result - createdDate;
    const differenceInDays = Math.round(
      differenceInTime / (1000 * 60 * 60 * 24),
    );
    return Math.abs(differenceInDays);
  }
}

export function pageTransitionIn(node, { duration, screenWidth }) {
  if (screenWidth >= 640) {
    return;
  }
  return {
    duration,
    css: (t) => {
      const eased = cubicOut(t);

      return `
        transform: translateX(${(1 - eased) * 100}%);
        width: 100%;
        height: 100%;
        opacity: 1;
        z-index: 9999;
        transition: transform ${duration}ms ease-out;
      `;
    },
  };
}

export function pageTransitionOut(node, { duration }) {
  return {
    duration,
    css: (t) => {
      const eased = cubicOut(t);

      return `
      transform: translateX(${(1 - eased) * 100}%);
        opacity: 1;
        width: 100%;
        height: 100%;
        z-index: 9999;
        transition: transform ${duration}ms ease-in;
      `;
    },
  };
}

export function convertTimestamp(timestamp) {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds

  return date.toLocaleString("en-US", {
    year: "numeric", // e.g., "2024"
    month: "short", // e.g., "Aug"
    day: "2-digit", // e.g., "23"
    hour: "numeric", // e.g., "3"
    minute: "2-digit", // e.g., "59"
    hour12: true, // e.g., "PM"
  });
}

/*
function convertNYTimeToLocalTime(nyTimeString) {
    // New York Time Zone
    const nyTimeZone = 'America/New_York';
    
    // Parse the New York time string
    let nyTime = new Date(nyTimeString);
    if (isNaN(nyTime)) {
        throw new Error('Invalid date format');
    }
    
    // Convert New York time to UTC
    let utcTime = new Date(nyTime.toLocaleString('en-US', { timeZone: nyTimeZone }));
    
    // Create an Intl.DateTimeFormat object for local time zone
    const localTimeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour12: false,  // Use 24-hour format
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Format the UTC time as local time
    const localFormattedTime = localTimeFormatter.format(utcTime);
    return localFormattedTime;
}
*/

export function getPartyForPoliticians(name) {
  // Predefined list of senators and their parties
  const senatorPartyMap = {
    "Bryon Donalds": "Republican",
    "Blake Moore": "Republican",
    "Bill Hagerty": "Republican",
    "Scott Peters": "Democratic",
    "Jared Moskowitz": "Democratic",
    "Suzan DelBene": "Democratic",
    "Rudy Yakym": "Republican",
    "Judy Chu": "Democratic",
    "Michael Burgess": "Republican",
    "David Perdue": "Republican",
    "Pat Roberts": "Republican",
    "Sheldon Whitehouse": "Democratic",
    "Shelley Moore Capito": "Republican",
    "Patty Murray": "Democratic",
    "Susan Collins": "Republican",
    "John Hoeven": "Republican",
    "Tommy Tuberville": "Republican",
    "Katie Britt": "Republican",
    "Lisa Murkowski": "Republican",
    "Dan Sullivan": "Republican",
    "Kyrsten Sinema": "Independent",
    "Mark Kelly": "Democratic",
    "John Boozman": "Republican",
    "Tom Cotton": "Republican",
    "Alex Padilla": "Democratic",
    "Laphonza Butler": "Democratic",
    "Michael Bennet": "Democratic",
    "John Hickenlooper": "Democratic",
    "Richard Blumenthal": "Democratic",
    "Chris Murphy": "Democratic",
    "Tom Carper": "Democratic",
    "Chris Coons": "Democratic",
    "Marco Rubio": "Republican",
    "Rick Scott": "Republican",
    "Jon Ossoff": "Democratic",
    "Raphael Warnock": "Democratic",
    "Brian Schatz": "Democratic",
    "Mazie Hirono": "Democratic",
    "Mike Crapo": "Republican",
    "Jim Risch": "Republican",
    "Dick Durbin": "Democratic",
    "Dianne Feinstein": "Democratic",
    "Ben Ray Luján": "Democratic",
    "Martin Heinrich": "Democratic",
    "Catherine Cortez Masto": "Democratic",
    "Jacky Rosen": "Democratic",
    "Kevin Cramer": "Republican",
    "Sherrod Brown": "Democratic",
    "James Lankford": "Republican",
    "Markwayne Mullin": "Republican",
    "Jeff Merkley": "Democratic",
    "Ron Wyden": "Democratic",
    "Ron L Wyden": "Democratic",
    "Bob Casey Jr.": "Democratic",
    "Pat Toomey": "Republican",
    "Jack Reed": "Democratic",
    "Tim Scott": "Republican",
    "Lindsey Graham": "Republican",
    "Mike Rounds": "Republican",
    "John Thune": "Republican",
    "Marsha Blackburn": "Republican",
    "Ted Cruz": "Republican",
    "John Cornyn": "Republican",
    "Mitt Romney": "Republican",
    "Mike Lee": "Republican",
    "Patrick Leahy": "Democratic",
    "Bernie Sanders": "Independent",
    "Mark Warner": "Democratic",
    "Tim Kaine": "Democratic",
    "Maria Cantwell": "Democratic",
    "Joe Manchin": "Democratic",
    "Ron Johnson": "Republican",
    "Tammy Baldwin": "Democratic",
    "John Barrasso": "Republican",
    "Cynthia Lummis": "Republican",
    "James Inhofe": "Republican",
    "Kelly Loeffler": "Republican",
    "Rick Larsen": "Democratic",
    "Dwight Evans": "Democratic",
    "Mark Green": "Republican",
    "Kevin Hern": "Republican",
    "Sean Casten": "Democratic",
    "William Keating": "Democratic",
    "Bill Keating": "Democratic",
    "Max Miller": "Republican",
    "Pete Sessions": "Republican",
    "Jerry Moran": "Republican",
    "Bill Cassidy": "Republican",
    "Cory Booker": "Democratic",
    "Deb Fischer": "Republican",
    "John Ricketts": "Republican",
    "Tammy Duckworth": "Democratic",
    "Angus King": "Other",
    "Gary Peters": "Democratic",
    "Doris Matsui": "Democratic",
    "Thomas Kean": "Republican",
    "Debbie Wasserman Schultz": "Democratic",
    "Josh Gottheimer": "Democratic",
    "Lloyd Doggett": "Democratic",
    "Michael Collins": "Democratic",
    "Kathy Manning": "Democratic",
    "Maria Elvira Salazar": "Republican",
    "Jonathan Jackson": "Democratic",
    "Mike Kelly": "Republican",
    "Richard Allen": "Republican",
    "James French Hill": "Republican",
    "Virginia Foxx": "Republican",
    "Chellie Pingree": "Democratic",
    "Cliff Bentz": "Republican",
    "Katherine Clark": "Democratic",
    "Robert Latta": "Republican",
    "Victoria Spartz": "Republican",
    "Debbie Dingell": "Democratic",
    "Garret Graves": "Republican",
    "Shri Thanedar": "Democratic",
    "Nancy Pelosi": "Democratic",
    "Steve Cohen": "Democratic",
    "Earl Blumenauer": "Democratic",
    "Adrian Smith": "Republican",
    "Michael Patrick Guest": "Republican",
    "Michael Garcia": "Republican",
    "Greg Steube": "Republican",
    "Daniel Meuser": "Republican",
    "Gerald Connolly": "Democratic",
    "Brian Mast": "Republican",
    "Nanette Barragan": "Democratic",
    "Mark Pocan": "Democratic",
    "Kathy Castor": "Democratic",
    "Donald Sternoff Beyer": "Democratic",
    "Thomas Suozzi": "Democratic",
    "Eleanor Holmes Norton": "Democratic",
    "Chip Roy": "Republican",
    "Tracey Robert Mann": "Republican",
    "Felix Barry Moore": "Republican",
    "Dan Newhouse": "Republican",
    "Mike Garcia": "Republican",
    "Scott Franklin": "Republican",
    "Michael McCaul": "Republican",
    "Ro Khanna": "Democratic",
    "Daniel Goldman": "Democratic",
    "Greg Stanton": "Democratic",
    "Chris Jacobs": "Republican",
    "Robert Aderholt": "Republican",
    "David McKinley": "Republican",
    "Kim Schrier": "Democratic",
    "Vicente Gonzalez": "Democratic",
    "Dan Crenshaw": "Republican",
    "Marie Newman": "Democratic",
    "Dean Phillips": "Democratic",
    "Roger Marshall": "Republican",
    "Zoe Lofgren": "Democratic",
    "John Curtis": "Republican",
    "Don Beyer": "Democratic",
    "Ed Perlmutter": "Democratic",
    "James Langevin": "Democratic",
    "Kenny Marchant": "Republican",
    "David Kustoff": "Republican",
    "Marjorie Taylor Greene": "Republican",
    "Deborah Ross": "Democratic",
    "Peter Meijer": "Republican",
    "Donna Shalala": "Democratic",
    "Brenda Lulenar Lawrence": "Democratic",
    "Robert Wittman": "Republican",
    "Diana Harshbarger": "Republican",
    "Morgan McGarvey": "Democratic",
    "Eric Burlison": "Republican",
    "Cynthia Axne": "Democratic",
    "Seth Moulton": "Democratic",
    "Anthony Gonzalez": "Republican",
    "David Joyce": "Republican",
    "Alan Lowenthal": "Democratic",
    "Patrick Fallon": "Republican",
    "David Madison Cawthorn": "Republican",
    "Ashley Hinson Arenholz": "Republican",
    "Gilbert Cisneros": "Democratic",
    "Joseph Morelle": "Democratic",
    "Joe Courtney": "Democratic",
    "Michael Conaway": "Republican",
    "William Timmons": "Republican",
    "Cheri Bustos": "Democratic",
    "Harley Rouda": "Democratic",
    "Susan Brooks": "Republican",
    "Mikie Sherrill": "Democratic",
    "David Cheston Rouzer": "Republican",
    "Bradley Schneider": "Democratic",
    "Justin Amash": "Other",
    "Lamar Smith": "Republican",
    "Gary Palmer": "Republican",
    "Barbara Comstock": "Republican",
    "Thomas Rooney": "Republican",
    "Carlos Curbelo": "Republican",
    "Bob Gibbs": "Republican",
    "Kurt Schrader": "Democratic",
    "August Lee Pfluger": "Republican",
    "Ed Case": "Democratic",
    "Francis Rooney": "Republican",
    "John Rutherford": "Republican",
    "David Roe": "Republican",
    "Sean Patrick Maloney": "Democratic",
    "Peter Welch": "Democratic",
    "Lois Frankel": "Democratic",
    "Carol Devine Miller": "Republican",
    "Mo Brooks": "Republican",
    "Bobby Scott": "Democratic",
    "John Yarmuth": "Democratic",
    "Mike Gallagher": "Republican",
    "Tom O'Halleran": "Democratic",
    "David Price": "Democratic",
    "Tina Smith": "Democratic",
    "Doug Lamborn": "Republican",
    "Gerry Connolly": "Democratic",
    "Chuck Fleischmann": "Republican",
    "James Vance": "Republican",
    "Neal Dunn": "Republican",
    "Anna Paulina Luna": "Republican",
    "Laurel Lee": "Republican",
    "Mitch McConnell": "Republican",
    "Hal Rogers": "Republican",
    "Jennifer McClellan": "Democratic",
    "Patrick McHenry": "Republican",
    "Susie Lee": "Democratic",
    "Jim Banks": "Republican",
    "Michael San Nicolas": "Democratic",
    "Mary Gay Scanlon": "Democratic",
    "Van Taylor": "Republican",
    "Ron Estes": "Republican",
    "Chris Van Hollen": "Democratic",
    "Stephen Lynch": "Democratic",
    "Ann Wagner": "Republican",
    "Michael Simpson": "Republican",
    "Thom Tillis": "Republican",
    "Glenn Grothman": "Republican",
    "Tom Cole": "Republican",
    "David Trone": "Democratic",
    "Fred Upton": "Republican",
    "John Larson": "Democratic",
    "Tom Malinowski": "Democratic",
    "Jeff Duncan": "Republican",
    "Peter Visclosky": "Democratic",
    "Adam Kinzinger": "Republican",
    "Austin Scott": "Republican",
    "Abigail Spanberger": "Democratic",
    "Roger Williams": "Republican",
    "Earl Leroy Carter": "Republican",
    "Daniel Webster": "Republican",
    "Nicole Malliotakis": "Republican",
    "Buddy Carter": "Republican",
    "John Fetterman": "Democratic",
    "Sharice Davids": "Democratic",
    "Jake Auchincloss": "Democratic",
    "John James": "Republican",
    "Greg Landsman": "Democratic",
    "Darin LaHood": "Republican",
    "Darrell Issa": "Republican",
     "Lance Gooden": "Republican",
    "Byron Donalds": "Republican",
    "James Comer": "Republican",
    "Guy Reschenthaler": "Republican",
    "Keith Self": "Republican",
    "Gus Bilirakis": "Republican",
    "Dave McCormick": "Republican",
    "Gil Cisneros": "Democratic",
    "Emily Randall": "Democratic",
    "Julie Johnson": "Democratic",
    "Rob Bresnahan": "Republican",
    "Tim Moore": "Republican",
    "Jefferson Shreve": "Republican",
     "Ashley Moody": "Republican",
  };

  // Combine first and last name to form the key
  const nameKey = `${name}`?.trim();
  // Return the party, or 'Unknown' if not found
  return senatorPartyMap[nameKey] || "Other";
}

export const listOfCountries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Congo-Brazzaville)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia (Czech Republic)",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini (fmr. 'Swaziland')",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Holy See",
  "Honduras",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar (formerly Burma)",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Tajikistan",
  "Tanzania",
  "Taiwan",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "UK",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export const listOfRelevantCountries = [
  "United States", // By far the most companies listed on the NYSE
  "China",
  "Canada",
  "United Kingdom",
  "Japan",
  "Israel",
  "Brazil",
  "France",
  "Ireland",
  "Germany",
  "Mexico",
  "India",
  "Australia",
  "South Korea",
  "Sweden",
  "Netherlands",
  "Switzerland",
  "Taiwan",
  "South Africa",
  "Hong Kong",
  "Singapore",
  "Argentina",
  "Chile",
  "Philippines",
  "Turkey",
  "Italy",
  "Indonesia",
  "Malaysia",
  "Luxembourg",
  "Vietnam",
  "New Zealand",
  "Denmark",
  "Norway",
  "Finland",
  "Russia",
  "United Arab Emirates",
];

export const sectorList = [
  "Basic Materials",
  "Communication Services",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Energy",
  "Financial Services",
  "Healthcare",
  "Industrials",
  "Real Estate",
  "Technology",
  "Utilities",
];

export const industryList = [
  "Steel",
  "Silver",
  "Other Precious Metals",
  "Gold",
  "Copper",
  "Aluminum",
  "Paper, Lumber & Forest Products",
  "Industrial Materials",
  "Construction Materials",
  "Chemicals - Specialty",
  "Chemicals",
  "Agricultural Inputs",
  "Telecommunications Services",
  "Internet Content & Information",
  "Publishing",
  "Broadcasting",
  "Advertising Agencies",
  "Entertainment",
  "Travel Lodging",
  "Travel Services",
  "Specialty Retail",
  "Luxury Goods",
  "Home Improvement",
  "Residential Construction",
  "Department Stores",
  "Personal Products & Services",
  "Leisure",
  "Gambling, Resorts & Casinos",
  "Furnishings, Fixtures & Appliances",
  "Restaurants",
  "Auto - Parts",
  "Auto - Manufacturers",
  "Auto - Recreational Vehicles",
  "Auto - Dealerships",
  "Apparel - Retail",
  "Apparel - Manufacturers",
  "Apparel - Footwear & Accessories",
  "Packaging & Containers",
  "Tobacco",
  "Grocery Stores",
  "Discount Stores",
  "Household & Personal Products",
  "Packaged Foods",
  "Food Distribution",
  "Food Confectioners",
  "Agricultural Farm Products",
  "Education & Training Services",
  "Beverages - Wineries & Distilleries",
  "Beverages - Non-Alcoholic",
  "Beverages - Alcoholic",
  "Uranium",
  "Solar",
  "Oil & Gas Refining & Marketing",
  "Oil & Gas Midstream",
  "Oil & Gas Integrated",
  "Oil & Gas Exploration & Production",
  "Oil & Gas Equipment & Services",
  "Oil & Gas Energy",
  "Oil & Gas Drilling",
  "Coal",
  "Shell Companies",
  "Investment - Banking & Investment Services",
  "Insurance - Specialty",
  "Insurance - Reinsurance",
  "Insurance - Property & Casualty",
  "Insurance - Life",
  "Insurance - Diversified",
  "Insurance - Brokers",
  "Financial - Mortgages",
  "Financial - Diversified",
  "Financial - Data & Stock Exchanges",
  "Financial - Credit Services",
  "Financial - Conglomerates",
  "Financial - Capital Markets",
  "Banks - Regional",
  "Banks - Diversified",
  "Banks",
  "Asset Management",
  "Asset Management - Bonds",
  "Asset Management - Income",
  "Asset Management - Leveraged",
  "Asset Management - Cryptocurrency",
  "Asset Management - Global",
  "Medical - Specialties",
  "Medical - Pharmaceuticals",
  "Medical - Instruments & Supplies",
  "Medical - Healthcare Plans",
  "Medical - Healthcare Information Services",
  "Medical - Equipment & Services",
  "Medical - Distribution",
  "Medical - Diagnostics & Research",
  "Medical - Devices",
  "Medical - Care Facilities",
  "Drug Manufacturers - Specialty & Generic",
  "Drug Manufacturers - General",
  "Biotechnology",
  "Waste Management",
  "Trucking",
  "Railroads",
  "Aerospace & Defense",
  "Marine Shipping",
  "Integrated Freight & Logistics",
  "Airlines, Airports & Air Services",
  "General Transportation",
  "Manufacturing - Tools & Accessories",
  "Manufacturing - Textiles",
  "Manufacturing - Miscellaneous",
  "Manufacturing - Metal Fabrication",
  "Industrial - Distribution",
  "Industrial - Specialties",
  "Industrial - Pollution & Treatment Controls",
  "Environmental Services",
  "Industrial - Machinery",
  "Industrial - Infrastructure Operations",
  "Industrial - Capital Goods",
  "Consulting Services",
  "Business Equipment & Supplies",
  "Staffing & Employment Services",
  "Rental & Leasing Services",
  "Engineering & Construction",
  "Security & Protection Services",
  "Specialty Business Services",
  "Construction",
  "Conglomerates",
  "Electrical Equipment & Parts",
  "Agricultural - Machinery",
  "Agricultural - Commodities/Milling",
  "REIT - Specialty",
  "REIT - Retail",
  "REIT - Residential",
  "REIT - Office",
  "REIT - Mortgage",
  "REIT - Industrial",
  "REIT - Hotel & Motel",
  "REIT - Healthcare Facilities",
  "REIT - Diversified",
  "Real Estate - Services",
  "Real Estate - Diversified",
  "Real Estate - Development",
  "Real Estate - General",
  "Information Technology Services",
  "Hardware, Equipment & Parts",
  "Computer Hardware",
  "Electronic Gaming & Multimedia",
  "Software - Services",
  "Software - Infrastructure",
  "Software - Application",
  "Semiconductors",
  "Media & Entertainment",
  "Communication Equipment",
  "Technology Distributors",
  "Consumer Electronics",
  "Renewable Utilities",
  "Regulated Water",
  "Regulated Gas",
  "Regulated Electric",
  "Independent Power Producers",
  "Diversified Utilities",
  "General Utilities",
];

export const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const holidays = ['2025-01-01', '2025-01-09','2025-01-20', '2025-02-17', '2025-04-18', '2025-05-26', '2025-06-19', '2025-07-04', '2025-09-01', '2025-11-27', '2025-12-25']

export const getLastTradingDay = () => {
  const etTimeZone = "America/New_York";

  // Helper function to check if a date (in NY time) is a holiday
  const isHoliday = (date) => {
    return holidays.includes(date.toISOString().split("T")[0]);
  };
  let date = new Date();

  // Convert current date to NY timezone
  const nyDate = new Date(
    date.toLocaleString("en-US", { timeZone: etTimeZone }),
  );

  // Loop backwards to find the most recent trading day
  while (true) {
    const dayOfWeek = nyDate.getUTCDay();

    // Check if it's a weekday and not a holiday
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(nyDate)) {
      return nyDate.toISOString().split("T")[0];
    }

    // Move back one day
    nyDate.setDate(nyDate.getDate() - 1);
  }
};

export const sectorNavigation = [
  {
    title: "Financial Services",
    link: "/list/sector/financial",
  },
  {
    title: "Finance",
    link: "/list/sector/financial",
  },
  {
    title: "Healthcare",
    link: "/list/sector/healthcare",
  },
  {
    title: "Technology",
    link: "/list/sector/technology",
  },
  {
    title: "Industrials",
    link: "/list/sector/industrials",
  },
  {
    title: "Energy",
    link: "/list/sector/energy",
  },
  {
    title: "Utilities",
    link: "/list/sector/utilities",
  },
  {
    title: "Consumer Cyclical",
    link: "/list/sector/consumer-cyclical",
  },
  {
    title: "Real Estate",
    link: "/list/sector/real-estate",
  },
  {
    title: "Basic Materials",
    link: "/list/sector/basic-materials",
  },
  {
    title: "Communication Services",
    link: "/list/sector/communication-services",
  },
  {
    title: "Consumer Defensive",
    link: "/list/sector/consumer-defensive",
  },
];
