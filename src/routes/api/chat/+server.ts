import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const { apiURL, apiKey, user, pb } = locals;
  const { query, chatId } = await request.json();

  // simple premium check
  if (!["Pro", "Plus"].includes(user?.tier)) {
    return new Response(
      JSON.stringify({
        error: "This feature is available exclusively for Plus and Pro members. Please upgrade your account <a href='/pricing' class='text-blue-800 sm:hover:text-muted dark:sm:hover:text-white dark:text-blue-500'>here</a> to gain access."
      }),
      { status: 400 }
    );
    
  }

  if (user?.credits < 20) {
    return new Response(
      JSON.stringify({
        error: `Insufficient credits. Your current balance is ${user?.credits}. Each prompt costs 20 credits. Credits are reset at the start of each month.`
      }),
      { status: 400 }
    );
    
    
    
  }
  

  if (query?.length > 4092) {
    console.log("too long")
    return new Response(
      JSON.stringify({ error: "Input text is too length" }),
      { status: 400 }
    );
  }

  if (query?.length < 1) {
    console.log("too short")
    return new Response(
      JSON.stringify({ error: "Input text cannot be empty" }),
      { status: 400 }
    );
  }


  //get history based on pb:
  const messages = (await pb.collection("chat").getOne(chatId))?.messages?.slice(-20) || [];

  try {
    const upstream = await fetch(`${apiURL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey
      },
      body: JSON?.stringify({ query: query, messages: messages})
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text();
      console.error("Upstream error:", errText);
      return new Response(errText, { status: upstream.status });
    }

    await pb?.collection("users")?.update(user?.id, {
      credits: user?.credits -20,
      });

    const decoder = new TextDecoder();
    const upstreamReader = upstream.body.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await upstreamReader.read();
            if (done) break;
            // decode and enqueue as string chunks
            controller.enqueue(decoder.decode(value, { stream: true }));
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      }
    });
  } catch (err) {
    console.error("Handler error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to proxy stream" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
