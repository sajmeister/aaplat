export type DeploymentStatus = 
  | 'pending' 
  | 'deploying' 
  | 'running' 
  | 'stopped' 
  | 'failed'
  | 'crashed';

export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

export interface DeploymentConfig {
  environment: Record<string, string>;
  resources?: {
    cpu?: string;
    memory?: string;
    replicas?: number;
  };
  networking?: {
    port?: number;
    domain?: string;
  };
}

export interface DeploymentMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkIn: number;
  networkOut: number;
  uptime: number;
  lastHealthCheck: Date;
}

export interface DeploymentLog {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source?: string;
}

export interface DeploymentHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }>;
} 