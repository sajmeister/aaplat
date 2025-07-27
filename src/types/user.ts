export type UserRole = 'user' | 'admin' | 'moderator';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  subscription: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    deployments: boolean;
    updates: boolean;
    marketing: boolean;
  };
  dashboard: {
    defaultView: 'grid' | 'list';
    itemsPerPage: number;
  };
}

export interface UserUsage {
  deployments: {
    current: number;
    limit: number;
  };
  storage: {
    current: number; // in MB
    limit: number;   // in MB
  };
  apiCalls: {
    current: number;
    limit: number;
    resetDate: Date;
  };
}

export interface UserStats {
  totalDeployments: number;
  totalAgents: number;
  totalDownloads: number;
  joinedAt: Date;
} 