import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AppCard } from './AppCard';
import { PortManager } from './PortManager';
import type { AppConfig, AppStatus, AppStats, AppHealth, SystemStats } from '../types';
import { 
  Activity, 
  LayoutGrid, 
  Network, 
  Play, 
  Square, 
  Cpu, 
  MemoryStick,
  Clock,
  Heart,
  RefreshCw
} from 'lucide-react';

// Connect to Backend
const socket = io('http://localhost:9999');

// Format uptime to human readable
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

export const Dashboard: React.FC = () => {
  const [apps, setApps] = useState<AppConfig[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AppStatus>>({});
  const [stats, setStats] = useState<Record<string, AppStats>>({});
  const [health, setHealth] = useState<Record<string, boolean>>({});
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [showPorts, setShowPorts] = useState(false);
  const [startingAll, setStartingAll] = useState(false);

  useEffect(() => {
    socket.on('config', (config: AppConfig[]) => {
      setApps(config);
    });

    socket.on('status', (status: AppStatus) => {
      setStatuses(prev => ({ ...prev, [status.appId]: status }));
    });

    socket.on('stats', (newStats: AppStats[]) => {
      const statsMap = newStats.reduce((acc, curr) => ({ ...acc, [curr.appId]: curr }), {});
      setStats(prev => ({ ...prev, ...statsMap }));
    });

    socket.on('health', (h: AppHealth) => {
      setHealth(prev => ({ ...prev, [h.appId]: h.healthy }));
    });

    socket.on('systemStats', (s: SystemStats) => {
      setSystemStats(s);
    });

    return () => {
      socket.off('config');
      socket.off('status');
      socket.off('stats');
      socket.off('health');
      socket.off('systemStats');
    };
  }, []);

  const handleSpawn = (appId: string, mode: 'dev' | 'prod', customPort?: number) => {
    socket.emit('spawn', { appId, mode, customPort });
  };

  const handleStop = (appId: string) => {
    socket.emit('kill', { appId });
  };

  const handleStartAll = () => {
    setStartingAll(true);
    socket.emit('spawnAll', { mode: 'dev' });
    setTimeout(() => setStartingAll(false), 5000);
  };

  const handleStopAll = () => {
    socket.emit('killAll');
  };

  // Count running apps
  const runningCount = Object.values(statuses).filter(s => s.status === 'running').length;
  const healthyCount = Object.values(health).filter(h => h).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              T-Ecosystem Launcher
            </h1>
            <p className="text-sm text-slate-400">Local DevOps Control Center</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Start All */}
          <button
            onClick={handleStartAll}
            disabled={startingAll}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20 disabled:opacity-50"
          >
            {startingAll ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
            <span>Start All</span>
          </button>

          {/* Stop All */}
          <button
            onClick={handleStopAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
          >
            <Square size={18} />
            <span>Stop All</span>
          </button>

          {/* Port Manager */}
          <button
            onClick={() => setShowPorts(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors border border-indigo-500/20"
          >
            <Network size={18} />
            <span>Ports</span>
          </button>
          
          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            <Activity size={16} className="text-emerald-400 animate-pulse" />
            <span>{runningCount}/{apps.length} Active</span>
          </div>
        </div>
      </header>

      {/* System Stats Bar */}
      {systemStats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* CPU */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${parseFloat(String(systemStats.cpuUsage)) > 80 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
              <Cpu size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">CPU</p>
              <p className="text-lg font-bold">{systemStats.cpuUsage}%</p>
            </div>
          </div>

          {/* Memory */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${parseFloat(systemStats.memoryUsage) > 80 ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
              <MemoryStick size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">RAM</p>
              <p className="text-lg font-bold">{systemStats.usedMemory}GB / {systemStats.totalMemory}GB</p>
            </div>
          </div>

          {/* Running Apps */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Running</p>
              <p className="text-lg font-bold">{runningCount} / {apps.length}</p>
            </div>
          </div>

          {/* Health Status */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${healthyCount === runningCount && runningCount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <Heart size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Healthy</p>
              <p className="text-lg font-bold">{healthyCount} / {runningCount}</p>
            </div>
          </div>

          {/* System Uptime */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">System Uptime</p>
              <p className="text-lg font-bold">{formatUptime(systemStats.uptime)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map(app => (
          <AppCard 
            key={app.id} 
            config={app} 
            status={statuses[app.id]} 
            stats={stats[app.id]}
            healthy={health[app.id]}
            socket={socket}
            onSpawn={handleSpawn}
            onStop={handleStop}
          />
        ))}
      </div>

      <PortManager isOpen={showPorts} onClose={() => setShowPorts(false)} />
    </div>
  );
};
