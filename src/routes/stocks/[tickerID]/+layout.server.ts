const cleanString = (input) => {
  const substringsToRemove = [
    "Depositary",
    "Inc.",
    "Incorporated",
    "Holdings",
    "Corporations",
    "LLC",
    "Holdings plc American Depositary Shares",
    "Holding Corporation",
    "Oyj",
    "Company",
    "The",
    "plc",
  ];
  const pattern = new RegExp(`\\b(${substringsToRemove.join("|")})\\b|,`, "gi");
  return input?.replace(pattern, "").trim();
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const REQUEST_TIMEOUT = 5000; // 5 seconds
const cache = new Map();

const fetchData = async (apiURL, apiKey, endpoint, ticker) => {
  const cacheKey = `${endpoint}-${ticker}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${apiURL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({ ticker }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout for ${endpoint}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const fetchWatchlist = async (pb, userId) => {
  let output;
  try {
    output = await pb.collection("watchlist").getFullList({
      filter: `user="${userId}"`,
    });
  } catch (e) {
    //console.log(e)
    output = [];
  }
  return output;
};

export const load = async ({ params, locals }) => {
  const { apiURL, apiKey, pb, user } = locals;
  const { tickerID } = params;

  const endpoints = [
    "/stockdeck",
    "/analyst-summary-rating",
    "/stock-quote",
    "/pre-post-quote",
    "/wiim",
    "/one-day-price",
    "/next-earnings",
    "/earnings-surprise",
    "/stock-news",
  ];

  if (!tickerID) {
    return { error: 'Invalid ticker ID' };
  }

  try {
    const [
      getStockDeck,
      getAnalystRating,
      getStockQuote,
      getPrePostQuote,
      getWhyPriceMoved,
      getOneDayPrice,
      getNextEarnings,
      getEarningsSurprise,
      getNews,
      getUserWatchlist,
    ] = await Promise.all([
      ...endpoints.map((endpoint) =>
        fetchData(apiURL, apiKey, endpoint, tickerID).catch(error => ({ error: error.message }))
      ),
      fetchWatchlist(pb, user?.id).catch(() => [])
    ]);

    if (!getStockDeck || getStockDeck.error) {
      return { error: 'Failed to fetch stock data' };
    }

    return {
      getStockDeck,
      getAnalystRating,
      getStockQuote,
      getPrePostQuote,
      getWhyPriceMoved,
      getOneDayPrice,
      getNextEarnings,
      getEarningsSurprise,
      getNews,
      getUserWatchlist,
      companyName: cleanString(getStockDeck?.companyName),
      getParams: params.tickerID,
    };
  } catch (error) {
    return { error: 'Failed to load stock data' };
  }
};