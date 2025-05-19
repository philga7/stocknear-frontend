import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  const { apiURL, apiKey, user } = locals;
  const { query } = await request.json();

  // simple premium check
  if (!["Pro", "Plus"].includes(user?.tier)) {
    return new Response(
      JSON.stringify({ error: "Subscribe to unlock this feature" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (query?.length > 512) {
    console.log("too long")
    return new Response(
      JSON.stringify({ error: "Input text is too length" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (query?.length < 1) {
    console.log("too short")
    return new Response(
      JSON.stringify({ error: "Input text cannot be empty" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }


  try {
    const upstream = await fetch(`${apiURL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey
      },
      body: JSON?.stringify({ query })
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text();
      console.error("Upstream error:", errText);
      return new Response(errText, { status: upstream.status });
    }

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
