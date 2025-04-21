import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const { apiURL, apiKey, user } = locals;
  const data = await request.json();
    const postData = {'orderList': data?.orderList}
   const response = await fetch(apiURL + "/options-flow-feed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(postData),

    });

    let output = await response.json();
    output = user?.tier !== "Pro" ? output?.slice(0, 6) : output;

  return new Response(JSON.stringify(output));
};
