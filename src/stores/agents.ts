import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Agent } from '@/lib/db/schema';

interface AgentsState {
  agents: Agent[];
  selectedAgent: Agent | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Getters
  getAgentById: (id: string) => Agent | undefined;
  getAgentsByCategory: (category: string) => Agent[];
}

export const useAgentsStore = create<AgentsState>()(
  devtools(
    (set, get) => ({
      agents: [],
      selectedAgent: null,
      isLoading: false,
      error: null,
      
      // Actions
      setAgents: (agents) => set({ agents }),
      addAgent: (agent) => 
        set((state) => ({ agents: [...state.agents, agent] })),
      updateAgent: (id, updates) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, ...updates } : agent
          ),
        })),
      removeAgent: (id) =>
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== id),
        })),
      setSelectedAgent: (agent) => set({ selectedAgent: agent }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Getters
      getAgentById: (id) => get().agents.find((agent) => agent.id === id),
      getAgentsByCategory: (category) =>
        get().agents.filter((agent) => agent.category === category),
    }),
    {
      name: 'agents-store',
    }
  )
); 