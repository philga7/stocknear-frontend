

export const load = async ({ locals, params }) => {
  const { apiKey, apiURL, user } = locals;

  const getData = async () => {
    const postData = {
      params: params.tickerID,
      category: "strike",
      type: "gex",
    };

    const response = await fetch(apiURL + "/options-gex-dex", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),
    });
  let output = await response.json();

  output = output?.filter(item => (item?.call_gex + item?.put_gex) !== 0);
  
    return output;
  }; 



  

  // Make sure to return a promise
  return {
    getData: await getData(),
  };
};


