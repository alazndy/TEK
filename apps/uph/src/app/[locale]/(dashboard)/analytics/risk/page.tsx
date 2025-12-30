'use client';

import { useEffect } from 'react';
import { useRAIDStore } from '@/stores/raid-store';
import { useEVMStore } from '@/stores/evm-store';
import { 
  RAID_TYPE_COLORS, 
  RAID_TYPE_LABELS, 
  STATUS_COLORS,
  calculateRiskScore,
  getRiskScoreColor
} from '@/types/raid';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldAlert, 
  TrendingUp, 
  Target,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export default function RiskIntelligencePage() {
  const { items, isLoading, subscribeToItems, unsubscribeAll, getByType, getOpenItems } = useRAIDStore();
  const { projectEVMs, getPortfolioSummary } = useEVMStore();
  
  useEffect(() => {
    subscribeToItems();
    return () => unsubscribeAll();
  }, [subscribeToItems, unsubscribeAll]);

  const summary = getPortfolioSummary();
  const risks = getByType('risk');
  const openItems = getOpenItems();
  const highRisks = risks.filter(r => (r.riskScore || 0) >= 15);

  const getMetricColor = (val: number) => {
    if (val >= 1) return 'text-emerald-400';
    if (val >= 0.9) return 'text-amber-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            Risk Zekası ve EVM Paneli
          </h2>
          <p className="text-muted-foreground text-sm">
            Projenin finansal sağlığını (EVM) ve operasyonel risklerini (RAID) izleyin.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-zinc-950/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
               <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
               </div>
               <div>
                  <p className="text-xs text-muted-foreground">CPI (Maliyet Performansı)</p>
                  <p className={`text-2xl font-bold ${getMetricColor(summary.avgCPI)}`}>
                    {summary.avgCPI.toFixed(2)}
                  </p>
               </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Bütçeye göre verimlilik düzeyi.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-950/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
               <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
               </div>
               <div>
                  <p className="text-xs text-muted-foreground">SPI (Zaman Performansı)</p>
                  <p className={`text-2xl font-bold ${getMetricColor(summary.avgSPI)}`}>
                    {summary.avgSPI.toFixed(2)}
                  </p>
               </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Takvime göre ilerleme hızı.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
               <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertCircle className="h-5 w-5 text-red-500" />
               </div>
               <div>
                  <p className="text-xs text-muted-foreground">Kritik Riskler</p>
                  <p className="text-2xl font-bold text-white">{highRisks.length}</p>
               </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Skoru 15 ve üzeri olan riskler.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/50 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
               <div className="p-2 rounded-lg bg-amber-500/10">
                  <Target className="h-5 w-5 text-amber-500" />
               </div>
               <div>
                  <p className="text-xs text-muted-foreground">Açık Öğeler</p>
                  <p className="text-2xl font-bold text-white">{openItems.length}</p>
               </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Acil aksiyon bekleyen durumlar.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Matrix (5x5) */}
        <Card className="lg:col-span-1 bg-zinc-950/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Risk Matrisi (5x5)</CardTitle>
            <CardDescription>Olasılık ve Etki Analizi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-1.5 aspect-square">
              {Array.from({ length: 25 }).map((_, i) => {
                const row = 5 - Math.floor(i / 5);
                const col = (i % 5) + 1;
                const score = row * col;
                const hasRisk = risks.some(r => {
                  const impactVal = r.impact === 'low' ? 1 : r.impact === 'medium' ? 2 : r.impact === 'high' ? 3 : 4;
                  const probVal = r.probability === 'rare' ? 1 : r.probability === 'unlikely' ? 2 : r.probability === 'possible' ? 3 : r.probability === 'likely' ? 4 : 5;
                  return impactVal === col && probVal === row;
                });
                
                let bgColor = 'bg-zinc-900/50';
                if (score >= 15) bgColor = 'bg-red-500/20 text-red-400';
                else if (score >= 8) bgColor = 'bg-amber-500/20 text-amber-400';
                else bgColor = 'bg-emerald-500/20 text-emerald-400';

                return (
                  <div 
                    key={i} 
                    className={`rounded-md border border-white/5 flex items-center justify-center text-[10px] font-bold ${bgColor} relative`}
                    title={`Etki: ${col}, Olasılık: ${row}, Skor: ${score}`}
                  >
                    {hasRisk && (
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-2 h-2 rounded-full bg-white animate-ping shadow-[0_0_10px_white]" />
                      </div>
                    )}
                    {score}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-2">
               <span>Düşük Etki</span>
               <span>Yüksek Etki</span>
            </div>
          </CardContent>
        </Card>

        {/* RAID Log Table */}
        <Card className="lg:col-span-2 bg-zinc-950/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">RAID Logu</CardTitle>
            <CardDescription>Risk, Varsayım, Sorun ve Bağımlılık Takibi</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>Henüz RAID kaydı yok</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10">
                    <TableHead className="w-[80px]">Tip</TableHead>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Skor</TableHead>
                    <TableHead>Sahip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((entry) => (
                    <TableRow key={entry.id} className="border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="capitalize text-[10px]"
                          style={{ borderColor: RAID_TYPE_COLORS[entry.type], color: RAID_TYPE_COLORS[entry.type] }}
                        >
                          {RAID_TYPE_LABELS[entry.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{entry.title}</span>
                          <span className="text-[10px] text-muted-foreground">{entry.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="text-[10px] border-none bg-zinc-900"
                          style={{ color: STATUS_COLORS[entry.status] }}
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         {entry.riskScore ? (
                           <span 
                             className="font-mono text-xs font-bold"
                             style={{ color: getRiskScoreColor(entry.riskScore) }}
                           >
                             {entry.riskScore}
                           </span>
                         ) : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {entry.owner || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
