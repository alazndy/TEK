export interface AppConfig {
  id: string;
  name: string;
  description: string;
  port: number;
  color: string;
  path: string;
  cmd: Record<string, string>;
  healthEndpoint?: string;
  priority?: number;
  autoRestart?: boolean;
}

export interface AppStatus {
  appId: string;
  status: 'running' | 'stopped' | 'error' | 'restarting';
  pid?: number;
  exitCode?: number;
  startedAt?: number;
  port?: number;
}

export interface AppStats {
  appId: string;
  cpu: number;
  memory: number; // in bytes
  uptime?: number; // in milliseconds
  startedAt?: number;
}

export interface AppHealth {
  appId: string;
  healthy: boolean;
}

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: string;
  totalMemory: string;
  usedMemory: string;
  platform: string;
  uptime: number;
}

export type LogMessage = {
  appId: string;
  data: string;
};
