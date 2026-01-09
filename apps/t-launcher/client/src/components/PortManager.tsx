import { useState, useEffect } from 'react';
import { RefreshCw, Trash2, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PortInfo {
  pid: number;
  process: string;
  port: number;
  protocol: string;
  state: string;
}

interface PortManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortManager = ({ isOpen, onClose }: PortManagerProps) => {
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPorts = async () => {
    setLoading(true);
    try {
      // Assuming server runs on 9999 as per index.js
      const res = await fetch('http://localhost:9999/api/ports');
      if (!res.ok) throw new Error('Failed to fetch ports');
      const data = await res.json();
      // Deduplicate by port + PID for cleaner view
      const unique = data.reduce((acc: PortInfo[], curr: PortInfo) => {
        if (!acc.find(p => p.port === curr.port && p.pid === curr.pid)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      // Sort by port
      unique.sort((a: PortInfo, b: PortInfo) => a.port - b.port);
      setPorts(unique);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const killProcess = async (pid: number) => {
    if (!confirm(`Are you sure you want to kill process with PID ${pid}?`)) return;
    
    try {
      const res = await fetch('http://localhost:9999/api/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid })
      });
      if (!res.ok) throw new Error('Failed to kill process');
      // Refresh after kill
      fetchPorts();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPorts();
      let interval: any;
      if (autoRefresh) {
        interval = setInterval(fetchPorts, 5000);
      }
      return () => clearInterval(interval);
    }
  }, [isOpen, autoRefresh]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
           if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background border border-border rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-foreground">Port Yöneticisi</h2>
            </div>
            <div className="flex items-center gap-2">
               <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-xs px-2 py-1 rounded transition-colors ${autoRefresh ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}
              >
                {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
              </button>
              <button 
                onClick={() => fetchPorts()}
                className="p-2 hover:bg-muted/80 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground uppercase text-xs font-medium">
                  <tr>
                    <th className="px-4 py-3">PID</th>
                    <th className="px-4 py-3">Process</th>
                    <th className="px-4 py-3">Port</th>
                    <th className="px-4 py-3">Proto</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ports.map((p) => (
                    <tr key={`${p.pid}-${p.port}`} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground font-mono">{p.pid}</td>
                      <td className="px-4 py-3 text-foreground font-medium">
                        {p.process || <span className="text-muted-foreground italic">Unknown</span>}
                      </td>
                      <td className="px-4 py-3 text-indigo-500 font-mono font-bold">{p.port}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.protocol}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => killProcess(p.pid)}
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                          title="Kill Process"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ports.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No active ports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-3 border-t border-border bg-muted/30 flex justify-between items-center text-xs text-muted-foreground">
            <span>Total: {ports.length} ports</span>
            <span>Server: localhost:9999</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
