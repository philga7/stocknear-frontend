export const load = async ({ locals, params }) => {
  const { apiKey, apiURL, user } = locals;
  const getData = async () => {
     const postData = { ticker: params.tickerID };

   
  const response = await fetch(apiURL + "/historical-adj-price", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify(postData),
  });

  let output = await response.json();

  output = !["Pro","Plus"]?.includes(user?.tier) ? output?.reverse()?.slice(0,5): output
    return output;
  };

  // Make sure to return a promise
  return {
    getData: await getData(),
  };
};
