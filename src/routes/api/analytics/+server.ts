import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { user } = locals;
    
    // Check if user is authorized (admin or Pro tier)
    if (!user || (user.role !== 'admin' && user.tier !== 'Pro')) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analyticsData = await request.json();
    
    // Validate analytics data structure
    if (!analyticsData || typeof analyticsData !== 'object') {
      return json({ error: 'Invalid analytics data' }, { status: 400 });
    }

    const { events, performance, engagement, timestamp } = analyticsData;

    // Validate required fields
    if (!Array.isArray(events) || !Array.isArray(performance)) {
      return json({ error: 'Missing required analytics data' }, { status: 400 });
    }

    // Process and store analytics data
    const processedData = {
      userId: user.id,
      events: events.map(event => ({
        ...event,
        userId: user.id,
        timestamp: new Date().toISOString()
      })),
      performance: performance.map(metric => ({
        ...metric,
        userId: user.id,
        timestamp: new Date().toISOString()
      })),
      engagement: engagement ? engagement.map(engagement => ({
        ...engagement,
        userId: user.id,
        timestamp: new Date().toISOString()
      })) : [],
      receivedAt: new Date().toISOString()
    };

    // Here you would typically store the data in a database
    // For now, we'll just log it and return success
    console.log('Analytics data received:', {
      userId: user.id,
      eventCount: events.length,
      performanceCount: performance.length,
      engagementCount: engagement?.length || 0,
      timestamp: new Date().toISOString()
    });

    // In a real implementation, you would:
    // 1. Store events in an analytics database
    // 2. Aggregate performance metrics
    // 3. Update user engagement statistics
    // 4. Trigger alerts for high error rates
    // 5. Update feature usage analytics

    return json({ 
      success: true, 
      message: 'Analytics data processed successfully',
      processedCount: {
        events: events.length,
        performance: performance.length,
        engagement: engagement?.length || 0
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    const { user } = locals;
    
    // Check if user is authorized
    if (!user || (user.role !== 'admin' && user.tier !== 'Pro')) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureName = url.searchParams.get('feature');
    const dateRange = url.searchParams.get('range') || '7d';
    const limit = parseInt(url.searchParams.get('limit') || '100');

    // In a real implementation, you would:
    // 1. Query analytics database for the requested data
    // 2. Filter by feature name if provided
    // 3. Filter by date range
    // 4. Apply pagination/limits
    // 5. Return aggregated statistics

    // Mock response for demonstration
    const mockAnalytics = {
      summary: {
        totalEvents: 1250,
        totalUsers: 45,
        averagePerformanceScore: 87.5,
        errorRate: 2.3,
        lastUpdated: new Date().toISOString()
      },
      features: featureName ? [{
        name: featureName,
        views: 450,
        interactions: 125,
        errors: 3,
        performanceScore: 92.1,
        lastUpdated: new Date().toISOString()
      }] : [
        {
          name: 'market_mover',
          views: 450,
          interactions: 125,
          errors: 3,
          performanceScore: 92.1,
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'options_flow',
          views: 320,
          interactions: 89,
          errors: 1,
          performanceScore: 95.3,
          lastUpdated: new Date().toISOString()
        },
        {
          name: 'analyst_report',
          views: 280,
          interactions: 67,
          errors: 2,
          performanceScore: 88.7,
          lastUpdated: new Date().toISOString()
        }
      ],
      dateRange,
      limit
    };

    return json(mockAnalytics);

  } catch (error) {
    console.error('Analytics GET error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 