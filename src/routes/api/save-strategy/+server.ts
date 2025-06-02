 import type { RequestHandler } from "./$types";

export const POST = (async ({ request, locals }) => {
  const {  pb } = locals;
  const data = await request.json();

 
  let output;

  try {
        output = await pb?.collection("stockscreener")?.update(data?.strategyId, {
            'rules': data?.rules
        })
    }
    catch(e) {
        output = {};
    }

  return new Response(JSON.stringify(output));
}) satisfies RequestHandler;

