export const load = async ({ locals, params }) => {
  const getHistoricalRevenue = async () => {
    const { apiKey, apiURL } = locals;
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/historical-revenue", {
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
    getHistoricalRevenue: await getHistoricalRevenue(),
  };
};
