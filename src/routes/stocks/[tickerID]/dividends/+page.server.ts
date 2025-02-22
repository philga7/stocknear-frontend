export const load = async ({ params, locals }) => {
  const getStockDividend = async () => {
    let newsList;

    const { apiURL, apiKey } = locals;

    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/stock-dividend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    newsList = await response.json();

    return newsList;
  };

  // Make sure to return a promise
  return {
    getStockDividend: await getStockDividend(),
  };
};
