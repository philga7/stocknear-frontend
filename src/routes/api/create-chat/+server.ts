import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user, pb } = locals;
  const data = await request.json();

  // Early return if user is not logged in
 /*
  if (!user?.id) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401 }
    );
  }
    */

  if (user?.credits < 20) {
    return new Response(
      JSON.stringify({ error: `Insufficient credits. Your current balance is ${user?.credits}.` }),
      { status: 400 }
    );
  }
  

  
  // Early return if user doesn't have required tier
  const isPremiumUser = ["Pro", "Plus"].includes(user?.tier);
  if (!isPremiumUser) {
    return new Response(
      JSON.stringify({ error: "Subscribe to unlock this feature" }),
      { status: 403 }
    );
  }

  // Extract messages from the request
  try {
    const newChat = await pb.collection("chat").create({
      user: user.id,
      messages: JSON?.stringify([{ text: data?.query, sender: "user" }])
    });

    
     return new Response(
      JSON.stringify(newChat),
    );

  } catch (err) {
    // If it's already a Response (like the redirect), just throw it through
    if (err instanceof Response) throw err;
  
    
    return new Response(
      JSON.stringify({ error: "Error creating chat message", details: err.message }),
      { status: 500 }
    );
  }
};