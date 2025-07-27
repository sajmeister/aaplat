export type AgentRuntime = 'python' | 'nodejs' | 'rust';

export type AgentCategory = 
  | 'automation'
  | 'data-processing' 
  | 'ai-ml'
  | 'web-scraping'
  | 'api-integration'
  | 'monitoring'
  | 'utilities'
  | 'other';

export type AgentStatus = 'draft' | 'published' | 'deprecated';

export interface AgentConfig {
  environment?: Record<string, string>;
  port?: number;
  healthCheck?: string;
  resources?: {
    cpu?: string;
    memory?: string;
  };
}

export interface AgentMetadata {
  author: string;
  version: string;
  description: string;
  tags: string[];
  repository?: string;
  documentation?: string;
  license?: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  runtime: AgentRuntime;
  dockerFile: string;
  defaultConfig: AgentConfig;
  metadata: AgentMetadata;
} 