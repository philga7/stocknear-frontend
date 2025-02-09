

export const load = async ({ locals, params }) => {
  const { apiKey, apiURL, user } = locals;

  const getData = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    const response = await fetch(apiURL + "/hottest-contracts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    let output = await response.json();
    output.volume = user?.tier !== "Pro" ? output?.volume?.slice(0, 3) : output?.volume;
    output.openInterest = user?.tier !== "Pro" ? output?.openInterest?.slice(0, 3) : output?.openInterest;

    return output;
  }; 


   const getHistoricalPrice = async () => {
     const postData = { ticker: params.tickerID, timePeriod: "six-months" };
  const response = await fetch(apiURL + "/historical-price", {
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
    getData: await getData(),
    getHistoricalPrice: await getHistoricalPrice(),
  };
};


