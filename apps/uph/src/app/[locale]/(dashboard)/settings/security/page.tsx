'use client';

import { useAuditStore } from '@/stores/audit-store';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Fingerprint, 
  History, 
  Lock, 
  CheckCircle2, 
  XCircle,
  ShieldAlert
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function SecurityAuditPage() {
  const { logs, verifyIntegrity } = useAuditStore();
  const isIntegrityValid = verifyIntegrity();

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Güvenlik ve Denetim (SOC 2)
          </h2>
          <p className="text-muted-foreground text-sm">
            Tüm sistem hareketlerini izleyin ve veri bütünlüğünü doğrulayın.
          </p>
        </div>
        
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${isIntegrityValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
           {isIntegrityValid ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
           <span className="text-sm font-bold">
              Bütünlük: {isIntegrityValid ? 'Doğrulandı' : 'Hata Tespit Edildi'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-950/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Fingerprint className="h-4 w-4" />
              Sistem Parmak İzi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white truncate font-mono text-xs">
              {logs.length > 0 ? logs[0].hash : 'N/A'}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">
               Son İşlem Özeti (SHA-256)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Aktif RBAC Koruması
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">6 Rol / 12 Yetki</div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">
               En Üst Düzey Erişim Denetimi
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              SoD Kontrolleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">Aktif</div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">
               Görevler Ayrılığı Denetimi
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-950/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <History className="h-5 w-5 text-primary" />
             Değiştirilemez Denetim Günlüğü (Audit Log)
          </CardTitle>
          <CardDescription>Sistemdeki tüm kritik eylemler zincirleme hash yapısıyla korunmaktadır.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10">
                <TableHead>Zaman Damgası</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Eylem</TableHead>
                <TableHead>Modül</TableHead>
                <TableHead>Özet (Hash)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? logs.map((log) => (
                <TableRow key={log.id} className="border-white/10 hover:bg-white/5 transition-colors">
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), 'dd MMM HH:mm:ss', { locale: tr })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="text-sm font-medium text-white">User {log.userId}</span>
                       <span className="text-[10px] text-muted-foreground">{log.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-white font-medium">{log.action}</TableCell>
                  <TableCell>
                     <Badge variant="outline" className="capitalize text-[10px]">
                        {log.module}
                     </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                     {log.hash.substring(0, 16)}...
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                     Henüz bir denetim kaydı bulunmuyor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
