import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  const { pb, user } = locals;
  if (!pb.authStore.isValid) {
    redirect(303, "/sitemap");
  }
}