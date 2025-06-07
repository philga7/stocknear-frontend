import type { RequestHandler } from "./$types";

export const POST = (async ({ request, locals }) => {
  const {  pb } = locals;
  const data = await request.json();
  let output;

   // Early return if user doesn't have required tier

    

  try {
        output = await pb.collection("chat").update(data?.chatId, {
            'messages': JSON?.stringify(data?.messages)
        })
    }
    catch(e) {
        output = {};
    }

  return new Response(JSON.stringify(output));
}) satisfies RequestHandler;

