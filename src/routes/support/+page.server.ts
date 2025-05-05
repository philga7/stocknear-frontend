import { error,  redirect } from "@sveltejs/kit";



export const actions = {
  support: async ({ locals, request }) => {
    const { pb} = locals;

    const formData = await request.formData()
    console.log(formData)
    //let username = generateUsername(formData.name.split(' ').join('')).toLowerCase();

    try {
       await pb.collection("support").create(formData);

    } catch (err) {
      console.log("Error: ", err);
      error(err.status, err.message);
    }

   
    redirect(301, "/support");
  },

 
};

