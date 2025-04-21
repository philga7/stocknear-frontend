import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, locals }) => {
  const { apiURL, apiKey, user } = locals;


   const response = await fetch(apiURL + "/options-flow-feed", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
    });

    let output = await response.json();
    output = user?.tier !== "Pro" ? output?.slice(0, 6) : output;

  return new Response(JSON.stringify(output));
};
