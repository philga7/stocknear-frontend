export const load = async ({ locals, params }) => {
  const getHistoryEmployee = async () => {
    const { apiKey, apiURL } = locals;
    const postData = {
      ticker: params.tickerID,
    };

    // make the POST request to the endpoint
    const response = await fetch(apiURL + "/historical-employees", {
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
    getHistoryEmployee: await getHistoryEmployee(),
  };
};
