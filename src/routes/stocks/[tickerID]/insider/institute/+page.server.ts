
export const load = async ({ locals, params }) => {
  const { apiURL, apiKey, user } = locals;

  const getShareholderData = async () => {
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/shareholders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });

    let output = await response.json();

    output.shareholders = !['Plus','Pro']?.includes(user?.tier) ? output.shareholders?.slice(0, 3) : output.shareholders;

   
    return output;
  };


  // Make sure to return a promise
  return {
    getShareholderData: await getShareholderData(),
  };
};
