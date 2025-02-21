export const load = async ({ locals, params }) => {
  const { apiURL, apiKey, user } = locals;
  const postData = {
    ticker: params.tickerID,
  };

  const getAnalystTickerHistory = async () => {
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/analyst-ticker-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    let output = await response.json();
    output = user?.tier !== "Pro" ? output?.slice(0, 6) : output;

    return output;
  };

  const getAnalystEstimate = async () => {
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/analyst-estimate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();
    return output;
  };

  const getAnalystInsight = async () => {
    const response = await fetch(apiURL + "/analyst-insight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();
    return output;
  };


   const getTopAnalystSummary = async () => {
    const response = await fetch(apiURL + "/top-analyst-summary-rating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    const output = await response.json();
    return output;
  };

  // Make sure to return a promise
  return {
    getAnalystEstimate: await getAnalystEstimate(),
    getAnalystInsight: await getAnalystInsight(),
    getAnalystTickerHistory: await getAnalystTickerHistory(),
    getTopAnalystSummary: await getTopAnalystSummary(),
  };
};
