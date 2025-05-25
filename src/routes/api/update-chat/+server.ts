import type { RequestHandler } from "./$types";

export const POST = (async ({ request, locals }) => {
  const { user, pb } = locals;
  const data = await request.json();
  
  let output;

   // Early return if user doesn't have required tier
   
   //const isPremiumUser = ["Pro", "Plus"].includes(user?.tier);
   if (user?.id) {
     return new Response(
       JSON.stringify({ error: "Sign In to save the chat..." }),
       { status: 403 }
     );
   }
    

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

