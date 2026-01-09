import React, { useState, useEffect } from 'react';
import { X, GitBranch, GitCommit, RefreshCw, AlertCircle, Check, Download } from 'lucide-react';

interface GitPanelProps {
  appId: string;
  appName: string;
  socket: any;
  onClose: () => void;
}

interface GitInfo {
  isGitRepo: boolean;
  branch: string | null;
  modified: number;
  untracked: number;
  staged: number;
  hasChanges: boolean;
  lastCommit: {
    hash: string;
    message: string;
    time: string;
  } | null;
}

export const GitPanel: React.FC<GitPanelProps> = ({ appId, appName, socket, onClose }) => {
  const [gitInfo, setGitInfo] = useState<GitInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState(false);
  const [pullResult, setPullResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadGitInfo = () => {
    setLoading(true);
    setError(null);
    
    socket.emit('getGit', { appId }, (response: GitInfo | { error: string }) => {
      setLoading(false);
      if ('error' in response) {
        setError(response.error);
      } else {
        setGitInfo(response);
      }
    });
  };

  useEffect(() => {
    loadGitInfo();
  }, [appId]);

  const handlePull = () => {
    setPulling(true);
    setPullResult(null);
    
    socket.emit('gitPull', { appId }, (response: { success: boolean; message: string } | { error: string }) => {
      setPulling(false);
      if ('error' in response) {
        setError(response.error);
      } else {
        setPullResult(response);
        // Reload git info after pull
        setTimeout(loadGitInfo, 1000);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Git Status</h2>
              <p className="text-xs text-muted-foreground">{appName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading...
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          ) : !gitInfo?.isGitRepo ? (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Not a Git repository</p>
            </div>
          ) : (
            <>
              {/* Branch */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Branch</span>
                  </div>
                  <span className="font-mono text-sm text-foreground bg-primary/10 px-2 py-0.5 rounded">
                    {gitInfo.branch || 'detached'}
                  </span>
                </div>
              </div>

              {/* Changes */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-amber-500">{gitInfo.modified}</div>
                  <div className="text-xs text-muted-foreground">Modified</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-500">{gitInfo.untracked}</div>
                  <div className="text-xs text-muted-foreground">Untracked</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-500">{gitInfo.staged}</div>
                  <div className="text-xs text-muted-foreground">Staged</div>
                </div>
              </div>

              {/* Last Commit */}
              {gitInfo.lastCommit && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GitCommit className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Last Commit</span>
                  </div>
                  <div className="font-mono text-xs text-emerald-500 mb-1">
                    {gitInfo.lastCommit.hash}
                  </div>
                  <div className="text-sm text-foreground truncate">
                    {gitInfo.lastCommit.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {gitInfo.lastCommit.time}
                  </div>
                </div>
              )}

              {/* Pull Result */}
              {pullResult && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${pullResult.success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {pullResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="text-sm">{pullResult.message}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-muted/30">
          <button
            onClick={loadGitInfo}
            disabled={loading}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handlePull}
            disabled={pulling || loading || !gitInfo?.isGitRepo}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            {pulling ? 'Pulling...' : 'Git Pull'}
          </button>
        </div>
      </div>
    </div>
  );
};
