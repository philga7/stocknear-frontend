 import type { RequestHandler } from "./$types";

export const POST = (async ({ request, locals }) => {
  const {  pb } = locals;
  const data = await request.json();
  const type = data?.type;
 
  let output;

  if (type === "optionsScreener") {
    try {
      output = await pb?.collection("optionsScreener")?.update(data?.strategyId, {
        'rules': data?.rules
      })

      console.log(output)
    } 
    catch(e) {
      output = {};
      console.error("Error updating optionsScreener:", e);
    }
    return new Response(JSON.stringify(output));
  } else {

    try {
      output = await pb?.collection("stocksScreener")?.update(data?.strategyId, {
        'rules': data?.rules
      })
    }
    catch(e) {
      output = {};
    }
    return new Response(JSON.stringify(output));
  }
  
}) satisfies RequestHandler;

