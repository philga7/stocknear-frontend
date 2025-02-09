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

const fetchData = async (apiURL, apiKey, endpoint, ticker) => {
  try {
    const response = await fetch(`${apiURL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({ ticker }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
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

  try {
    const endpoints = [
      "/index-profile",
      "/etf-holdings",
      "/etf-sector-weighting",
      "/stock-quote",
      "/pre-post-quote",
      "/wiim",
      "/one-day-price",
      "/stock-news",
    ];

    const promises = endpoints.map((endpoint) => {
      // Use SPY for specific endpoints when tickerID is ^SPC or ^spc
      const useSpyTicker = tickerID?.toLowerCase() === "^spc" && 
        ["/etf-holdings", "/etf-sector-weighting", "/wiim", "/stock-news"].includes(endpoint);
      
      return fetchData(apiURL, apiKey, endpoint, useSpyTicker ? "SPY" : tickerID);
    });

    // Add watchlist promise
    promises.push(fetchWatchlist(pb, user?.id));

    const [
      getIndexProfile,
      getIndexHolding,
      getIndexSectorWeighting,
      getStockQuote,
      getPrePostQuote,
      getWhyPriceMoved,
      getOneDayPrice,
      getNews,
      getUserWatchlist,
    ] = await Promise.all(promises);

    return {
      getIndexProfile: getIndexProfile || [],
      getIndexHolding: getIndexHolding || [],
      getIndexSectorWeighting: getIndexSectorWeighting || [],
      getStockQuote: getStockQuote || [],
      getPrePostQuote: getPrePostQuote || [],
      getWhyPriceMoved: getWhyPriceMoved || [],
      getOneDayPrice: getOneDayPrice || [],
      getNews: getNews || [],
      getUserWatchlist: getUserWatchlist || [],
      companyName: cleanString(getIndexProfile?.at(0)?.name),
      getParams: params.tickerID,
    };
  } catch (error) {
    console.error('Error in load function:', error);
    return {
      getIndexProfile: [],
      getIndexHolding: [],
      getIndexSectorWeighting: [],
      getStockQuote: [],
      getPrePostQuote: [],
      getWhyPriceMoved: [],
      getOneDayPrice: [],
      getNews: [],
      getUserWatchlist: [],
      companyName: '',
      getParams: params.tickerID,
    };
  }
};