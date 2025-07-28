import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { agents } from '@/lib/db/schema';
import { 
  withErrorHandling, 
  createSuccessResponse
} from '@/lib/api-utils';

// GET /api/agents/debug - Debug endpoint to check environment and database
export const GET = withErrorHandling(async (request: NextRequest) => {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 20)}...` : 'NOT SET',
      DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    },
    database: {
      status: 'unknown',
      error: null,
      agentCount: 0,
      publicAgentCount: 0,
    },
    api: {
      status: 'unknown',
      error: null,
    }
  };

  // Test database connection
  try {
    console.log('🔍 Debug: Testing database connection...');
    
    // Try to count total agents
    const totalAgents = await db.select().from(agents);
    debugInfo.database.agentCount = totalAgents.length;
    
    // Try to count public agents
    const publicAgents = await db.select().from(agents).where(eq(agents.isPublic, true));
    debugInfo.database.publicAgentCount = publicAgents.length;
    
    debugInfo.database.status = 'connected';
    console.log(`✅ Debug: Database connected. Total agents: ${totalAgents.length}, Public: ${publicAgents.length}`);
    
    // Sample of agents for debugging
    if (totalAgents.length > 0) {
      debugInfo.database.sampleAgents = totalAgents.slice(0, 3).map(agent => ({
        id: agent.id,
        name: agent.name,
        category: agent.category,
        runtime: agent.runtime,
        isPublic: agent.isPublic,
        createdAt: agent.createdAt
      }));
    }
    
  } catch (error) {
    console.error('❌ Debug: Database connection failed:', error);
    debugInfo.database.status = 'error';
    debugInfo.database.error = error instanceof Error ? error.message : 'Unknown database error';
  }

  // Test API endpoint itself
  try {
    console.log('🔍 Debug: Testing agents API endpoint...');
    
    // Make internal request to the main agents endpoint
    const baseUrl = request.nextUrl.origin;
    const apiResponse = await fetch(`${baseUrl}/api/agents?isPublic=true&page=1&limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    debugInfo.api.status = apiResponse.status;
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      debugInfo.api.response = apiData;
      console.log('✅ Debug: API endpoint working:', apiData);
    } else {
      const errorText = await apiResponse.text();
      debugInfo.api.error = `Status ${apiResponse.status}: ${errorText}`;
      console.error('❌ Debug: API endpoint failed:', debugInfo.api.error);
    }
    
  } catch (error) {
    console.error('❌ Debug: API endpoint test failed:', error);
    debugInfo.api.status = 'error';
    debugInfo.api.error = error instanceof Error ? error.message : 'Unknown API error';
  }

  // Overall health check
  debugInfo.overallStatus = debugInfo.database.status === 'connected' && debugInfo.api.status === 200 ? 'healthy' : 'unhealthy';
  
  console.log('🔍 Debug info collected:', JSON.stringify(debugInfo, null, 2));

  return createSuccessResponse(debugInfo);
}); 