export const load = async ({ locals, params }) => {
  const { apiKey, apiURL } = locals;
  const getETFHoldings = async () => {

    console.log(params.tickerID?.toLowerCase())

    let postData = {ticker: params.tickerID,}
    if (params.tickerID?.toLowerCase() === '^spx') {
      postData['ticker'] = 'spy';
    }
  
    
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/etf-holdings", {
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
    getETFHoldings: await getETFHoldings(),
  };
};
