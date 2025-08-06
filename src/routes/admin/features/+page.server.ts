import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: RequestHandler = async ({ locals }) => {
  const { user } = locals;
  
  // Check if user is authenticated
  if (!user) {
    throw redirect(302, "/login");
  }
  
  // Check if user has admin privileges
  // This is a basic check - you might want to add more sophisticated role-based access control
  if (user.tier !== "Pro" && user.tier !== "Plus") {
    throw redirect(302, "/");
  }
  
  // For now, we'll allow access to Pro and Plus users
  // In a real application, you'd want to check for specific admin roles
  const isAdmin = user.tier === "Pro" || user.tier === "Plus";
  
  if (!isAdmin) {
    throw redirect(302, "/");
  }
  
  return {
    user,
    isAdmin
  };
}; 