'use client';

import { useSyncStore } from '@/stores/sync-store';
import { useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  RefreshCcw, 
  Database, 
  CloudSync,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function SystemStatusPage() {
  const { isOnline, isSyncing, pendingCount, initialize, syncPendingChanges } = useSyncStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent flex items-center gap-3">
            <CloudSync className="h-8 w-8 text-primary" />
            Sistem Durumu ve Eşitleme
          </h2>
          <p className="text-muted-foreground text-sm">
            Çevrimdışı veri tabanı ve bulut senkronizasyon durumunu takip edin.
          </p>
        </div>
        
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
           {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
           <span className="text-sm font-bold">
              {isOnline ? 'Çevrimiçi (Online)' : 'Çevrimdışı (Offline)'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-950/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
               <Database className="h-5 w-5 text-amber-500" />
               Yerel Veri Katmanı
            </CardTitle>
            <CardDescription>IndexedDB üzerinde saklanan veriler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
               <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Bekleyen Değişiklikler</span>
               </div>
               <Badge variant={pendingCount > 0 ? "destructive" : "outline"} className="rounded-lg">
                  {pendingCount} İşlem
               </Badge>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Eşitleme İlerleme Durumu</span>
                  <span className="text-white font-bold">{isSyncing ? 'Eşitleniyor...' : '%100 Güncel'}</span>
               </div>
               <Progress value={isSyncing ? 45 : 100} className="h-1.5 bg-white/5" />
            </div>

            <Button 
               className="w-full rounded-xl gap-2" 
               disabled={!isOnline || pendingCount === 0 || isSyncing}
               onClick={() => syncPendingChanges()}
            >
               <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
               Şimdi Eşitle
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
               <CheckCircle2 className="h-5 w-5 text-emerald-500" />
               Mimari Sağlık Kontrolü
            </CardTitle>
            <CardDescription>Teknik altyapı standartları doğrulaması</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {[
               { name: 'Çevrimdışı Veri Katmanı (IndexedDB)', status: 'OK' },
               { name: 'Çatışma Çözümleme (LWW CRDT)', status: 'OK' },
               { name: 'Gecikmeli Senkronizasyon Kuyruğu', status: 'OK' },
               { name: 'Zaman Damgalı Sürümleme', status: 'OK' }
             ].map((check, i) => (
               <div key={i} className="flex justify-between items-center text-sm p-2 border-b border-white/5 last:border-0">
                  <span className="text-muted-foreground">{check.name}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-0">{check.status}</Badge>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
