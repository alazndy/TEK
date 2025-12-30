import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wifi, Loader2, AlertCircle } from 'lucide-react';
import { useFluxStore } from '@/stores/flux-store';

interface BrokerConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrokerConnectionDialog({ open, onOpenChange }: BrokerConnectionDialogProps) {
  const { connectToBroker, error } = useFluxStore();
  const [url, setUrl] = useState('wss://broker.hivemq.com:8000/mqtt');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    connectToBroker({ url, username, password });
    
    // Simple timeout to close dialog if successful (optimistic)
    // In a real scenario, we'd watch the store state
    setTimeout(() => {
        setConnecting(false);
        onOpenChange(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyan-500" />
            Connect to MQTT Broker
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter your MQTT Broker details to stream real-time telemetry.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">Broker URL (WebSockets)</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3 bg-zinc-900 border-white/10"
              placeholder="wss://broker.hivemq.com:8000/mqtt"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
                <Label htmlFor="username">Username (Optional)</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-zinc-900 border-white/10"
                />
             </div>
             <div className="grid gap-2">
                <Label htmlFor="password">Password (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-900 border-white/10"
                />
             </div>
          </div>
          
          {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  {error}
              </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConnect} disabled={connecting} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            {connecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            ConnectBridge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
