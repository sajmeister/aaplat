import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Agent } from '@/lib/db/schema';
import { CreateAgentInput, AgentQueryInput } from '@/lib/validations/agent';
import { ApiResponse, PaginatedResponse } from '@/types/api';

// API functions
async function fetchAgents(params: AgentQueryInput): Promise<PaginatedResponse<Agent>> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, value.toString());
    }
  });

  const response = await fetch(`/api/agents?${searchParams}`);
  const result: ApiResponse<PaginatedResponse<Agent>> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch agents');
  }
  
  return result.data!;
}

async function createAgent(data: CreateAgentInput): Promise<Agent> {
  const response = await fetch('/api/agents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const result: ApiResponse<Agent> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create agent');
  }
  
  return result.data!;
}

// React Query hooks
export function useAgents(params: Partial<AgentQueryInput> = {}) {
  const queryParams: AgentQueryInput = {
    page: 1,
    limit: 10,
    ...params,
  };
  
  return useQuery({
    queryKey: ['agents', queryParams],
    queryFn: () => fetchAgents(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMyAgents() {
  const { data: session } = useSession();
  
  return useAgents({
    userId: session?.user?.id,
  });
}

export function usePublicAgents(params: Partial<Omit<AgentQueryInput, 'isPublic'>> = {}) {
  return useAgents({
    ...params,
    isPublic: true,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      // Invalidate and refetch agents
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

// Custom hooks for specific use cases
export function useAgentSearch(searchTerm: string) {
  return useAgents({
    search: searchTerm,
    isPublic: true,
  });
}

export function useAgentsByCategory(category: string) {
  return useAgents({
    category: category as any,
    isPublic: true,
  });
} 