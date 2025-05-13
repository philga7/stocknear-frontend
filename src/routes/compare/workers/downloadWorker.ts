// Cache to store previous requests
const cache = new Map<string, any>();

interface CompareRequest {
  tickerList: string[];
  category: string;         // here we treat ruleOfList as "category"
}

const fetchData = async (tickerList: string[], category: string) => {
  console.log("Checking cache and fetching new data if needed");

  // 1) Sort tickers alphabetically
  //const sortedTickers = [...tickerList]?.sort();

  // 2) Build the cacheKey from tickers + category
  const cacheKey = JSON.stringify({
    tickers: tickerList,
    category,
  });

  // 3) Return cached result if present
  if (cache?.has(cacheKey)) {
    console.log("Returning cached data");
    return cache?.get(cacheKey);
  }

  // 4) Fetch fresh data
  const postData: CompareRequest = { tickerList, category };
  const response = await fetch("/api/compare-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });

  const output = await response.json();

  // 5) Cache & return
  cache?.set(cacheKey, output);
  return output;
};

onmessage = async (event) => {
  const { tickerList, category } = event?.data || {};
  
  const output = await fetchData(tickerList, category);
  postMessage({ message: "success", output });
};

export {};
