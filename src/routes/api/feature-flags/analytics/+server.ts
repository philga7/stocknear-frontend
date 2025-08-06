import type { RequestHandler } from "./$types";

// In-memory analytics storage (in production, this would be a database)
const FEATURE_ANALYTICS = {
  usage: {},
  events: [],
  lastUpdated: new Date().toISOString()
};

export const POST = (async ({ request, locals }) => {
  try {
    const { user } = locals;
    const data = await request.json();
    
    // Validate input data
    if (!data || typeof data !== "object") {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid request data"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    
    const { eventType, featureName, userId, userTier, timestamp } = data;
    
    // Validate required fields
    if (!eventType || !featureName) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields: eventType and featureName"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    
    // Create analytics event
    const event = {
      eventType,
      featureName,
      userId: userId || user?.id || "anonymous",
      userTier: userTier || user?.tier || "Free",
      timestamp: timestamp || new Date().toISOString(),
      sessionId: data.sessionId || "unknown"
    };
    
    // Store event
    FEATURE_ANALYTICS.events.push(event);
    
    // Update usage statistics
    if (!FEATURE_ANALYTICS.usage[featureName]) {
      FEATURE_ANALYTICS.usage[featureName] = {
        totalEvents: 0,
        eventTypes: {},
        userTiers: {},
        lastUsed: null
      };
    }
    
    const featureUsage = FEATURE_ANALYTICS.usage[featureName];
    featureUsage.totalEvents++;
    featureUsage.eventTypes[eventType] = (featureUsage.eventTypes[eventType] || 0) + 1;
    featureUsage.userTiers[event.userTier] = (featureUsage.userTiers[event.userTier] || 0) + 1;
    featureUsage.lastUsed = event.timestamp;
    
    // Keep only last 1000 events to prevent memory issues
    if (FEATURE_ANALYTICS.events.length > 1000) {
      FEATURE_ANALYTICS.events = FEATURE_ANALYTICS.events.slice(-1000);
    }
    
    FEATURE_ANALYTICS.lastUpdated = new Date().toISOString();
    
    return new Response(JSON.stringify({
      success: true,
      message: "Analytics event recorded successfully"
    }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    console.log("Error in POST feature analytics:", e);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to record analytics event"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}) satisfies RequestHandler;

export const GET = (async ({ locals, url }) => {
  try {
    const { user } = locals;
    
    // Check if user is authenticated and is admin
    if (!user?.id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Authentication required"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    
    // Simple admin check (in production, use proper role checking)
    if (!user?.email?.includes("admin")) {
      return new Response(JSON.stringify({
        success: false,
        error: "Admin access required"
      }), {
        status: 403,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    
    // Get query parameters for filtering
    const featureName = url.searchParams.get("featureName");
    const eventType = url.searchParams.get("eventType");
    const userTier = url.searchParams.get("userTier");
    
    let analyticsData = { ...FEATURE_ANALYTICS };
    
    // Filter events based on query parameters
    if (featureName || eventType || userTier) {
      analyticsData.events = FEATURE_ANALYTICS.events.filter(event => {
        if (featureName && event.featureName !== featureName) return false;
        if (eventType && event.eventType !== eventType) return false;
        if (userTier && event.userTier !== userTier) return false;
        return true;
      });
    }
    
    // Calculate summary statistics
    const summary = {
      totalEvents: analyticsData.events.length,
      uniqueFeatures: new Set(analyticsData.events.map(e => e.featureName)).size,
      uniqueUsers: new Set(analyticsData.events.map(e => e.userId)).size,
      topFeatures: Object.entries(FEATURE_ANALYTICS.usage)
        .sort(([,a], [,b]) => b.totalEvents - a.totalEvents)
        .slice(0, 10)
        .map(([name, data]) => ({ name, ...data }))
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        ...analyticsData,
        summary
      }
    }), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    console.log("Error in GET feature analytics:", e);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to retrieve analytics data"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}) satisfies RequestHandler; 