import { NextRequest } from 'next/server';
import { eq, and, like, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { agents } from '@/lib/db/schema';
import { 
  withAuth, 
  withErrorHandling, 
  createSuccessResponse, 
  validateRequestBody,
  ApiError
} from '@/lib/api-utils';
import { 
  createAgentSchema, 
  agentQuerySchema, 
  CreateAgentInput, 
  AgentQueryInput 
} from '@/lib/validations/agent';

// GET /api/agents - List agents with filtering and pagination
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  
  // Parse and validate query parameters
  const queryData: AgentQueryInput = agentQuerySchema.parse({
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '10',
    category: searchParams.get('category'),
    runtime: searchParams.get('runtime'),
    search: searchParams.get('search'),
    userId: searchParams.get('userId'),
    isPublic: searchParams.get('isPublic'),
  });

  // Build where conditions
  const conditions = [];
  
  if (queryData.category) {
    conditions.push(eq(agents.category, queryData.category));
  }
  
  if (queryData.runtime) {
    conditions.push(eq(agents.runtime, queryData.runtime));
  }
  
  if (queryData.userId) {
    conditions.push(eq(agents.userId, queryData.userId));
  }
  
  if (queryData.isPublic !== undefined) {
    conditions.push(eq(agents.isPublic, queryData.isPublic));
  }
  
  if (queryData.search) {
    conditions.push(
      or(
        like(agents.name, `%${queryData.search}%`),
        like(agents.description, `%${queryData.search}%`)
      )
    );
  }

  // Query database
  const offset = (queryData.page - 1) * queryData.limit;
  
  const result = await db
    .select()
    .from(agents)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(queryData.limit)
    .offset(offset)
    .orderBy(agents.createdAt);

  // Get total count for pagination
  const totalCountResult = await db
    .select({ count: agents.id })
    .from(agents)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
  
  const total = totalCountResult.length;
  const totalPages = Math.ceil(total / queryData.limit);

  return createSuccessResponse({
    agents: result,
    pagination: {
      page: queryData.page,
      limit: queryData.limit,
      total,
      totalPages,
      hasNext: queryData.page < totalPages,
      hasPrev: queryData.page > 1,
    },
  });
});

// POST /api/agents - Create a new agent
export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await withAuth(request);
  const data: CreateAgentInput = await validateRequestBody(request, createAgentSchema);

  // Generate a unique ID
  const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create the agent
  const newAgent = await db
    .insert(agents)
    .values({
      id: agentId,
      ...data,
      userId: session.user!.id!,
    })
    .returning();

  if (!newAgent[0]) {
    throw new ApiError('Failed to create agent', 500);
  }

  return createSuccessResponse(newAgent[0], 201);
}); 