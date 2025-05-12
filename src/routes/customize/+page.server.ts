import { redirect } from "@sveltejs/kit";


export const load = async ({ locals, cookies }) => {

  const { pb } = locals;
  if (!pb.authStore.isValid) {
    redirect(303, "/login");
  }


  const getData = async () => {
    try {
       const output = JSON?.parse(cookies?.get("custom-dashboard-widget")) ?? [];
          return output;
    } catch(e) {
      return []
    }
   
  };

  
  return {
    getData: await getData(),
  };
};
