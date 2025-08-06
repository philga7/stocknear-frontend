import type { RequestHandler } from "./$types";

export const POST = (async ({ request, cookies }) => {
  let output = "error";
  const data = await request.json();
  const selectedFeatures = JSON.stringify(data?.selectedFeatures);
  try {
    cookies.set("custom-feature-settings", selectedFeatures, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 3, // 3 Year consent
    });

    output = "success";
  } catch (e) {
    console.log(e);
  }

  return new Response(JSON.stringify(output));
}) satisfies RequestHandler; 