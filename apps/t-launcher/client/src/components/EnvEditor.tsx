import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, FileText, AlertCircle } from 'lucide-react';

interface EnvEditorProps {
  appId: string;
  appName: string;
  socket: any;
  onClose: () => void;
}

interface EnvData {
  exists: boolean;
  path: string;
  variables: Record<string, string>;
}

export const EnvEditor: React.FC<EnvEditorProps> = ({ appId, appName, socket, onClose }) => {
  const [envData, setEnvData] = useState<EnvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const loadEnv = () => {
    setLoading(true);
    setError(null);
    
    socket.emit('getEnv', { appId }, (response: EnvData | { error: string }) => {
      setLoading(false);
      if ('error' in response) {
        setError(response.error);
      } else {
        setEnvData(response);
      }
    });
  };

  useEffect(() => {
    loadEnv();
  }, [appId]);

  const saveEnv = () => {
    if (!envData) return;
    
    setSaving(true);
    setError(null);
    
    socket.emit('saveEnv', {
      appId,
      variables: envData.variables,
      useLocal: false
    }, (response: { success?: boolean; error?: string }) => {
      setSaving(false);
      if (response.error) {
        setError(response.error);
      }
    });
  };

  const updateVariable = (key: string, value: string) => {
    if (!envData) return;
    setEnvData({
      ...envData,
      variables: { ...envData.variables, [key]: value }
    });
  };

  const deleteVariable = (key: string) => {
    if (!envData) return;
    const newVars = { ...envData.variables };
    delete newVars[key];
    setEnvData({ ...envData, variables: newVars });
  };

  const addVariable = () => {
    if (!newKey.trim() || !envData) return;
    setEnvData({
      ...envData,
      variables: { ...envData.variables, [newKey.trim()]: newValue }
    });
    setNewKey('');
    setNewValue('');
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Environment Variables</h2>
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
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Loading...
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          ) : envData && !envData.exists ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No .env file found</p>
              <p className="text-xs mt-1">Add variables below to create one</p>
            </div>
          ) : null}

          {envData && (
            <div className="space-y-2">
              {Object.entries(envData.variables).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={key}
                    disabled
                    className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono"
                  />
                  <span className="text-muted-foreground">=</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateVariable(key, e.target.value)}
                    className="flex-[2] bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-indigo-500"
                    title={`Value for ${key}`}
                  />
                  <button
                    onClick={() => deleteVariable(key)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete variable"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add New Variable */}
              <div className="flex items-center gap-2 pt-4 border-t border-border mt-4">
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                  placeholder="NEW_KEY"
                  className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
                  title="New variable name"
                />
                <span className="text-muted-foreground">=</span>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="value"
                  className="flex-[2] bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono placeholder-muted-foreground focus:outline-none focus:border-indigo-500"
                  title="New variable value"
                />
                <button
                  onClick={addVariable}
                  disabled={!newKey.trim()}
                  className="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Add variable"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {envData?.path || 'No file path'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEnv}
              disabled={saving || !envData}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
