export const load = async ({ locals }) => {
  const getData = async () => {
    const { apiKey, apiURL, user } = locals;

    const response = await fetch(apiURL + "/sector-flow", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

let output = await response?.json();
 if (user?.tier !== "Pro") {
    Object.keys(output.topPosNetPremium).forEach(ticker => {
        output.topPosNetPremium[ticker] = output.topPosNetPremium[ticker].slice(0, 3);
    });

    Object.keys(output.topNegNetPremium).forEach(ticker => {
        output.topNegNetPremium[ticker] = output.topNegNetPremium[ticker].slice(0, 3);
    });
}

    return output;
  };

  // Make sure to return a promise
  return {
    getData: await getData(),
  };
};
