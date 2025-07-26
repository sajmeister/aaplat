import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Deployment } from '@/lib/db/schema';

interface DeploymentsState {
  deployments: Deployment[];
  selectedDeployment: Deployment | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setDeployments: (deployments: Deployment[]) => void;
  addDeployment: (deployment: Deployment) => void;
  updateDeployment: (id: string, updates: Partial<Deployment>) => void;
  removeDeployment: (id: string) => void;
  setSelectedDeployment: (deployment: Deployment | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Getters
  getDeploymentById: (id: string) => Deployment | undefined;
  getDeploymentsByStatus: (status: string) => Deployment[];
  getDeploymentsByUserId: (userId: string) => Deployment[];
}

export const useDeploymentsStore = create<DeploymentsState>()(
  devtools(
    (set, get) => ({
      deployments: [],
      selectedDeployment: null,
      isLoading: false,
      error: null,
      
      // Actions
      setDeployments: (deployments) => set({ deployments }),
      addDeployment: (deployment) =>
        set((state) => ({ deployments: [...state.deployments, deployment] })),
      updateDeployment: (id, updates) =>
        set((state) => ({
          deployments: state.deployments.map((deployment) =>
            deployment.id === id ? { ...deployment, ...updates } : deployment
          ),
        })),
      removeDeployment: (id) =>
        set((state) => ({
          deployments: state.deployments.filter((deployment) => deployment.id !== id),
        })),
      setSelectedDeployment: (deployment) => set({ selectedDeployment: deployment }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Getters
      getDeploymentById: (id) => get().deployments.find((deployment) => deployment.id === id),
      getDeploymentsByStatus: (status) =>
        get().deployments.filter((deployment) => deployment.status === status),
      getDeploymentsByUserId: (userId) =>
        get().deployments.filter((deployment) => deployment.userId === userId),
    }),
    {
      name: 'deployments-store',
    }
  )
); 