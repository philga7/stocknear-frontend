import type { RequestHandler } from "./$types";
import type { FeatureFlags } from "$lib/store";

export const GET = (async ({ cookies, locals }) => {
  try {
    // Check admin privileges
    if (!locals.user || !['admin', 'super_admin'].includes(locals.user.tier)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions for admin operations" }),
        { status: 403 }
      );
    }

    // Get admin overrides from cookie
    const adminOverridesCookie = cookies.get("feature-flags-admin-overrides");
    const adminOverrides: FeatureFlags = adminOverridesCookie 
      ? JSON.parse(adminOverridesCookie) 
      : {};

    // Get user preferences for reference
    const userPreferencesCookie = cookies.get("feature-flags-user-preferences");
    const userPreferences = userPreferencesCookie 
      ? JSON.parse(userPreferencesCookie) 
      : {};

    return new Response(JSON.stringify({
      adminOverrides,
      userPreferences,
      user: locals.user
    }));
  } catch (error) {
    console.error("Error retrieving admin feature flags:", error);
    return new Response(
      JSON.stringify({ error: "Failed to retrieve admin feature flags" }),
      { status: 500 }
    );
  }
}) satisfies RequestHandler;

export const POST = (async ({ request, cookies, locals }) => {
  try {
    // Check admin privileges
    if (!locals.user || !['admin', 'super_admin'].includes(locals.user.tier)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions for admin operations" }),
        { status: 403 }
      );
    }

    const data = await request.json();
    const { action, featureFlags, analytics } = data;

    // Handle admin override updates
    if (action === 'updateOverrides' && featureFlags) {
      const validatedOverrides: FeatureFlags = {};
      
      // Validate each override
      for (const [key, value] of Object.entries(featureFlags)) {
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

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Admin overrides updated",
        overrides: validatedOverrides
      }));
    }

    // Handle analytics data
    if (action === 'getAnalytics') {
      // In a real implementation, you would fetch analytics from your database
      const mockAnalytics = {
        totalUsers: 1000,
        activeFeatures: {
          fundamentalAnalysisWidget: 850,
          priceAnalysisWidget: 920,
          darkPoolWidget: 650,
          sentimentWidget: 780
        },
        usageTrends: {
          last24h: 150,
          last7d: 1200,
          last30d: 4500
        }
      };

      return new Response(JSON.stringify({
        success: true,
        analytics: mockAnalytics
      }));
    }

    // Handle bulk operations
    if (action === 'bulkUpdate') {
      const { operations } = data;
      
      if (!Array.isArray(operations)) {
        return new Response(
          JSON.stringify({ error: "Invalid operations format" }),
          { status: 400 }
        );
      }

      let currentOverrides = {};
      const currentOverridesCookie = cookies.get("feature-flags-admin-overrides");
      if (currentOverridesCookie) {
        currentOverrides = JSON.parse(currentOverridesCookie);
      }

      // Apply bulk operations
      for (const operation of operations) {
        const { type, featureName, enabled } = operation;
        
        if (type === 'toggle' && featureName && typeof enabled === 'boolean') {
          currentOverrides[featureName] = {
            ...currentOverrides[featureName],
            enabled,
            lastModified: new Date().toISOString(),
            modifiedBy: locals.user.id
          };
        }
      }

      cookies.set("feature-flags-admin-overrides", JSON.stringify(currentOverrides), {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 3, // 3 Year consent
      });

      return new Response(JSON.stringify({
        success: true,
        message: "Bulk operations completed",
        operations: operations.length
      }));
    }

    // Handle reset all overrides
    if (action === 'resetAllOverrides') {
      cookies.delete("feature-flags-admin-overrides", { path: "/" });
      
      return new Response(JSON.stringify({
        success: true,
        message: "All admin overrides reset"
      }));
    }

    return new Response(
      JSON.stringify({ error: "Invalid action or missing data" }),
      { status: 400 }
    );

  } catch (error) {
    console.error("Error in admin feature flags:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process admin request" }),
      { status: 500 }
    );
  }
}) satisfies RequestHandler; 