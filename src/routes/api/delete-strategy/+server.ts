 import type { RequestHandler } from "./$types";

export const POST = (async ({ request, locals }) => {
  const {  pb } = locals;
  const data = await request.json();
  const type = data?.type;
 
  let output;

  if (type === 'optionsScreener') {
    try {
        await pb.collection("optionsScreener")?.delete(data?.strategyId)
        output = 'success';
    }
    catch(e) {
        output = 'failure';
    }
    return new Response(JSON.stringify(output));
  } else {

     try {
        await pb.collection("stocksScreener")?.delete(data?.strategyId)
        output = 'success';
    }
    catch(e) {
        output = 'failure';
    }

  return new Response(JSON.stringify(output));

  }
 
}) satisfies RequestHandler;

