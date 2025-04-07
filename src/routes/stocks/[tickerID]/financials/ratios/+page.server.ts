export const load = async ({ locals, params }) => {
  const getData = async () => {
    const { apiKey, apiURL } = locals;
    const postData = {
      ticker: params.tickerID,
      statement: 'ratios',
    };
    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/financial-statement", {
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
  };
};
