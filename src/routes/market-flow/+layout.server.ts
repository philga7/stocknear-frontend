export const load = async ({ locals }) => {
  const getData = async () => {
    const { apiKey, apiURL, user } = locals;

    const response = await fetch(apiURL + "/market-flow", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

  let output = await response?.json();
    output.topPosNetPremium = user?.tier !== "Pro" ? output?.topPosNetPremium?.slice(0, 3) : output?.topPosNetPremium;
     output.topNegNetPremium = user?.tier !== "Pro" ? output?.topNegNetPremium?.slice(0, 3) : output?.topNegNetPremium;
    return output;
  };

  // Make sure to return a promise
  return {
    getData: await getData(),
  };
};
