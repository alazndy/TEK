import React, { useState } from 'react';
import { Play, Square, Terminal as TerminalIcon, ExternalLink, RefreshCw, Cpu, Activity, AlertCircle, FileText, GitBranch, Heart, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AppConfig, AppStatus, AppStats } from '../types';
import { Terminal } from './Terminal';
import { EnvEditor } from './EnvEditor';
import { GitPanel } from './GitPanel';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AppCardProps {
  config: AppConfig;
  status?: AppStatus;
  stats?: AppStats;
  healthy?: boolean;
  socket: any;
  onSpawn: (appId: string, mode: string, customPort?: number) => void;
  onStop: (appId: string) => void;
}

// Format uptime
const formatUptime = (ms?: number): string => {
  if (!ms) return '0s';
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  if (mins > 0) return `${mins}m ${seconds % 60}s`;
  return `${seconds}s`;
};

export const AppCard: React.FC<AppCardProps> = ({ config, status, stats, healthy, socket, onSpawn, onStop }) => {
  const [showTerminal, setShowTerminal] = useState(false);
  const [customPort, setCustomPort] = useState<string>(config.port.toString());
  const [mode, setMode] = useState<string>('dev');
  const [showEnvEditor, setShowEnvEditor] = useState(false);
  const [showGitPanel, setShowGitPanel] = useState(false);

  const isRunning = status?.status === 'running';
  const isRestarting = status?.status === 'restarting';
  
  // Color mapping for dynamic styles
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20 hover:border-violet-500/50',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50',
    fuchsia: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20 hover:border-fuchsia-500/50',
  };

  const themeClass = colorMap[config.color] || colorMap.blue;

  const handleStart = () => {
    const port = parseInt(customPort);
    onSpawn(config.id, mode, isNaN(port) ? undefined : port);
    setShowTerminal(true);
  };

  // Memory formatter
  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 MB';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  // Status badge
  const getStatusBadge = () => {
    if (isRestarting) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-500/10 border-amber-500/50 text-amber-400">
          <RefreshCw size={10} className="animate-spin" />
          RESTARTING
        </div>
      );
    }
    if (isRunning) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-500/10 border-emerald-500/50 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          RUNNING
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-slate-800 border-slate-700 text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        STOPPED
      </div>
    );
  };

  return (
    <>
      <div className={cn("rounded-xl border transition-all duration-300 overflow-hidden flex flex-col h-[420px] bg-card text-card-foreground", themeClass, isRunning ? "shadow-[0_0_20px_-5px_var(--shadow-color)]" : "opacity-80 hover:opacity-100")}>
         
         {/* Header */}
         <div className="p-4 border-b border-border flex items-start justify-between bg-muted/30">
            <div className="flex items-center gap-3">
               <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold bg-muted/50", config.color === 'emerald' ? 'text-emerald-500' : `text-${config.color}-500`)}>
                  {config.name.substring(0, 2).toUpperCase()}
               </div>
               <div>
                  <h3 className="font-bold text-lg leading-tight text-foreground">{config.name}</h3>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
               </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
               {getStatusBadge()}
               
               {isRunning && (
                 <div className="flex items-center gap-2 mt-1">
                   {/* Health indicator */}
                   <div className={cn(
                     "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded",
                     healthy === true ? "text-emerald-500 bg-emerald-500/10" : 
                     healthy === false ? "text-red-500 bg-red-500/10" : 
                     "text-muted-foreground bg-muted"
                   )}>
                     <Heart size={10} className={healthy ? "" : "opacity-50"} />
                     {healthy === true ? 'OK' : healthy === false ? 'ERR' : '...'}
                   </div>
                   
                   {/* Uptime */}
                   {stats?.uptime && (
                     <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                       <Clock size={10} />
                       {formatUptime(stats.uptime)}
                     </div>
                   )}
                 </div>
               )}
               
               {isRunning && stats && (
                   <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Cpu size={10} /> {Math.round(stats.cpu)}%</span>
                      <span className="flex items-center gap-1"><Activity size={10} /> {formatBytes(stats.memory)}</span>
                   </div>
               )}
            </div>
         </div>

         {/* Content Area (Terminal or Controls) */}
         <div className="flex-1 bg-card relative group">
            <AnimatePresence mode="wait">
              {!showTerminal ? (
                 <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="absolute inset-0 flex flex-col items-center justify-center p-6 gap-4"
                 >
                    <div className="grid grid-cols-2 gap-4 w-full">
                       <div className="space-y-1">
                          <label className="text-xs text-muted-foreground ml-1">Mode</label>
                          <div className="flex bg-muted p-1 rounded-lg border border-border">
                             <select 
                               value={mode}
                               onChange={(e) => setMode(e.target.value as any)}
                               className="w-full bg-transparent text-xs text-foreground p-1 border-none focus:ring-0 cursor-pointer"
                             >
                                <option value="dev">Web Dev</option>
                                <option value="prod">Web Prod</option>
                                <option value="electron_dev">Electron Dev</option>
                                <option value="electron_build">Electron Build</option>
                                <option value="capacitor_android">Capacitor Android</option>
                                <option value="capacitor_ios">Capacitor iOS</option>
                             </select>
                          </div>
                       </div>
                       
                       <div className="space-y-1">
                          <label className="text-xs text-muted-foreground ml-1">Port</label>
                          <input 
                            type="text" 
                            value={customPort}
                            onChange={(e) => setCustomPort(e.target.value)}
                            className="w-full bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                            title="Custom port number"
                            placeholder="3000"
                          />
                       </div>
                    </div>

                    {/* Priority & Auto-restart info */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      {config.priority && (
                        <span>Priority: #{config.priority}</span>
                      )}
                      {config.autoRestart && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <RefreshCw size={10} />
                          Auto-restart
                        </span>
                      )}
                    </div>

                    <button 
                       onClick={handleStart}
                       disabled={isRunning || isRestarting}
                       className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <Play size={18} fill="currentColor" />
                       {isRunning ? 'Running...' : isRestarting ? 'Restarting...' : 'Start Application'}
                    </button>
                    
                    {status?.status === 'error' && (
                       <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-lg w-full">
                          <AlertCircle size={14} />
                          Process exited with code {status.exitCode}
                       </div>
                    )}
                 </motion.div>
              ) : (
                 <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="absolute inset-0 pb-12"
                 >
                   <Terminal appId={config.id} socket={socket} isActive={showTerminal} />
                 </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-card/90 backdrop-blur border-t border-border flex items-center justify-between px-3">
               <button 
                 onClick={() => setShowTerminal(!showTerminal)}
                 className={cn("flex items-center gap-1.5 text-xs font-medium transition-colors", showTerminal ? "text-indigo-500" : "text-muted-foreground hover:text-foreground")}
               >
                  <TerminalIcon size={12} />
                  {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
               </button>

               <div className="flex items-center gap-1">
                  {/* Env Editor Button */}
                  <button 
                    onClick={() => setShowEnvEditor(true)}
                    className="p-1.5 text-muted-foreground hover:text-amber-500 transition-colors rounded-md hover:bg-muted"
                    title="Edit Environment Variables"
                  >
                    <FileText size={14} />
                  </button>

                  {/* Git Panel Button */}
                  <button 
                    onClick={() => setShowGitPanel(true)}
                    className="p-1.5 text-muted-foreground hover:text-violet-500 transition-colors rounded-md hover:bg-muted"
                    title="Git Status"
                  >
                    <GitBranch size={14} />
                  </button>

                  {isRunning && (
                      <button 
                        onClick={() => window.open(`http://localhost:${customPort}`, '_blank')}
                        className="p-1.5 text-muted-foreground hover:text-emerald-500 transition-colors rounded-md hover:bg-muted"
                        title="Open in Browser"
                      >
                          <ExternalLink size={14} />
                      </button>
                  )}
                  
                  {isRunning ? (
                      <button 
                         onClick={() => onStop(config.id)}
                         className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-muted"
                         title="Stop Process"
                      >
                         <Square size={14} fill="currentColor" />
                      </button>
                  ) : (
                      <button 
                         onClick={handleStart}
                         className="p-1.5 text-muted-foreground hover:text-indigo-500 transition-colors rounded-md hover:bg-muted"
                         title="Quick Start"
                      >
                         <RefreshCw size={14} />
                      </button>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Modals */}
      {showEnvEditor && (
        <EnvEditor 
          appId={config.id} 
          appName={config.name} 
          socket={socket} 
          onClose={() => setShowEnvEditor(false)} 
        />
      )}

      {showGitPanel && (
        <GitPanel 
          appId={config.id} 
          appName={config.name} 
          socket={socket} 
          onClose={() => setShowGitPanel(false)} 
        />
      )}
    </>
  );
};
