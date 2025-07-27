export const APP_CONFIG = {
  name: 'AI Agent Platform',
  description: 'Deploy and manage AI agents with ease',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  version: '0.1.0',
} as const;

export const AGENT_RUNTIMES = {
  python: {
    name: 'Python',
    version: '3.11',
    icon: '🐍',
    defaultPort: 8000,
  },
  nodejs: {
    name: 'Node.js',
    version: '20',
    icon: '🟢',
    defaultPort: 3000,
  },
  rust: {
    name: 'Rust',
    version: '1.70',
    icon: '🦀',
    defaultPort: 8080,
  },
} as const;

export const AGENT_CATEGORIES = [
  { value: 'automation', label: 'Automation', icon: '🤖' },
  { value: 'data-processing', label: 'Data Processing', icon: '📊' },
  { value: 'ai-ml', label: 'AI & ML', icon: '🧠' },
  { value: 'web-scraping', label: 'Web Scraping', icon: '🕷️' },
  { value: 'api-integration', label: 'API Integration', icon: '🔗' },
  { value: 'monitoring', label: 'Monitoring', icon: '📈' },
  { value: 'utilities', label: 'Utilities', icon: '🛠️' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const;

export const DEPLOYMENT_STATUSES = {
  pending: { label: 'Pending', color: 'yellow', icon: '⏳' },
  deploying: { label: 'Deploying', color: 'blue', icon: '🚀' },
  running: { label: 'Running', color: 'green', icon: '✅' },
  stopped: { label: 'Stopped', color: 'gray', icon: '⏹️' },
  failed: { label: 'Failed', color: 'red', icon: '❌' },
  crashed: { label: 'Crashed', color: 'red', icon: '💥' },
} as const;

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    deployments: 3,
    storage: 100, // MB
    apiCalls: 1000,
    features: ['Basic agent deployment', 'Community support'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    deployments: 25,
    storage: 10000, // MB (10GB)
    apiCalls: 100000,
    features: [
      'Advanced monitoring',
      'Priority support',
      'Custom domains',
      'Team collaboration',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    deployments: -1, // Unlimited
    storage: -1, // Unlimited
    apiCalls: -1, // Unlimited
    features: [
      'SSO integration',
      'Advanced security',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
} as const;

export const API_ENDPOINTS = {
  agents: '/api/agents',
  deployments: '/api/deployments',
  users: '/api/users',
  auth: '/api/auth',
} as const; 