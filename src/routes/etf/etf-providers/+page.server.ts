export const load = async ({ locals }) => {
  const getAllETFProviders = async () => {
    const { apiKey, apiURL, user } = locals;
    const response = await fetch(apiURL + "/all-etf-providers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    let output = await response?.json();
    output = !["Pro", "Plus"]?.includes(user?.tier) ? output?.slice(0, 6) : output;
    return output;
  };

  // Make sure to return a promise
  return {
    getAllETFProviders: await getAllETFProviders(),
  };
};
