export const load = async ({ locals }) => {
  const { apiKey, apiURL } = locals;

  const getData = async () => {
    const postData = {
      ticker: 'TSLA',
    };

    const response = await fetch(apiURL + "/contract-lookup-summary", {
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


   const getStockQuote = async () => {
     const postData = { ticker: 'TSLA' };
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
    getStockQuote: await getStockQuote(),
  };
};


