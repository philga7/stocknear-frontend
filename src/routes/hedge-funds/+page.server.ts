export const load = async ({ locals, url }) => {
  const getAllHedgeFunds = async () => {
    const { apiURL, apiKey } = locals;
    const response = await fetch(apiURL + "/all-hedge-funds", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    const output = await response.json();

    return output;
  };

  const canonical = async () => {
    return url.href;
  }
 
  // Make sure to return a promise
  return {
    getAllHedgeFunds: await getAllHedgeFunds(),
    canonical: await canonical(),
  };
};
