import { error, redirect } from "@sveltejs/kit";

export const actions = {
  support: async ({ locals, request }) => {
    const { pb } = locals;

    const formData = await request.formData();

    // Convert FormData to a plain object
    const data = Object.fromEntries(formData);
    data.category = 'contact';


    try {
      await pb.collection("support").create(data);
    } catch (err) {
      console.log("Error: ", err);
      throw error(err.status || 500, err.message || "Failed to submit support request.");
    }

    // Use `return` to complete the action
    return redirect(303, "/contact");
  },
};
