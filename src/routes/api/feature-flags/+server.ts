import type { RequestHandler } from "./$types";
import type { FeatureFlags, UserFeaturePreferences } from "$lib/store";

export const GET = (async ({ cookies, locals }) => {
  try {
    // Get user preferences from cookie
    const userPreferencesCookie = cookies.get("feature-flags-user-preferences");
    const userPreferences: UserFeaturePreferences = userPreferencesCookie 
      ? JSON.parse(userPreferencesCookie) 
      : {};

    // Get admin overrides from cookie (if user is admin)
    const adminOverridesCookie = cookies.get("feature-flags-admin-overrides");
    const adminOverrides: FeatureFlags = adminOverridesCookie 
      ? JSON.parse(adminOverridesCookie) 
      : {};

    return new Response(JSON.stringify({
      userPreferences,
      adminOverrides,
      user: locals.user || null
    }));
  } catch (error) {
    console.error("Error retrieving feature flags:", error);
    return new Response(
      JSON.stringify({ error: "Failed to retrieve feature flags" }),
      { status: 500 }
    );
  }
}) satisfies RequestHandler;

export const POST = (async ({ request, cookies, locals }) => {
  try {
    const data = await request.json();
    const { userPreferences, adminOverrides, action } = data;

    // Handle user preferences update
    if (userPreferences && action === 'updateUserPreferences') {
      const validatedPreferences: UserFeaturePreferences = {};
      
      // Validate each preference
      for (const [key, value] of Object.entries(userPreferences)) {
        if (typeof value === 'boolean') {
          validatedPreferences[key] = value;
        }
      }

      cookies.set("feature-flags-user-preferences", JSON.stringify(validatedPreferences), {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 3, // 3 Year consent
      });

      return new Response(JSON.stringify({ success: true, message: "User preferences updated" }));
    }

    // Handle admin overrides (requires admin privileges)
    if (adminOverrides && action === 'updateAdminOverrides') {
      // Check if user has admin privileges
      if (!locals.user || !['admin', 'super_admin'].includes(locals.user.tier)) {
        return new Response(
          JSON.stringify({ error: "Insufficient permissions for admin operations" }),
          { status: 403 }
        );
      }

      const validatedOverrides: FeatureFlags = {};
      
      // Validate each override
      for (const [key, value] of Object.entries(adminOverrides)) {
        if (value && typeof value === 'object' && typeof value.enabled === 'boolean') {
          validatedOverrides[key] = value as any;
        }
      }

      cookies.set("feature-flags-admin-overrides", JSON.stringify(validatedOverrides), {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 3, // 3 Year consent
      });

      return new Response(JSON.stringify({ success: true, message: "Admin overrides updated" }));
    }

    // Handle feature analytics tracking
    if (action === 'trackFeatureUsage') {
      const { featureName, usageAction } = data;
      
      if (featureName && usageAction) {
        // In a real implementation, you would send this to your analytics service
        console.log(`Feature usage tracked: ${featureName} - ${usageAction}`);
        
        return new Response(JSON.stringify({ success: true, message: "Usage tracked" }));
      }
    }

    // Handle reset to defaults
    if (action === 'resetToDefaults') {
      cookies.delete("feature-flags-user-preferences", { path: "/" });
      cookies.delete("feature-flags-admin-overrides", { path: "/" });
      
      return new Response(JSON.stringify({ success: true, message: "Reset to defaults" }));
    }

    return new Response(
      JSON.stringify({ error: "Invalid action or missing data" }),
      { status: 400 }
    );

  } catch (error) {
    console.error("Error updating feature flags:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update feature flags" }),
      { status: 500 }
    );
  }
}) satisfies RequestHandler; 