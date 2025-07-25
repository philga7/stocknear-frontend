import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
    const { pb } = locals;
  const data = await request.json();

  const type = data?.type
  let output;
  if (type === 'optionsScreener') {
  try {
        output = await pb.collection("optionsScreener").create(data)
    }
    catch(e) {
        output = {};
    }
  } else {
      try {
        output = await pb.collection("stocksScreener").create(data)
    }
    catch(e) {
        output = {};
    }
  }

  return new Response(JSON.stringify(output));
};
