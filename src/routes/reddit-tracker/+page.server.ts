export const load = async ({ locals }) => {
  const getRedditTracker = async () => {
    let output;

    const { apiKey, apiURL } = locals;

    const response = await fetch(apiURL + "/reddit-tracker", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    output = await response.json();


    return output;
  };

  // Make sure to return a promise
  return {
    getRedditTracker: await getRedditTracker(),
  };
};
