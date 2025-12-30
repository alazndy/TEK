'use client';

import { useResourceStore } from '@/stores/resource-store';
import { format, addDays, startOfToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, AlertTriangle, Rocket } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function CapacityPlanningPage() {
  const [startDate, setStartDate] = useState(startOfToday());
  const daysToShow = 21; // 3 weeks view
  
  const { calculateHeatmapData, getBottlenecks } = useResourceStore();
  
  const heatmapData = useMemo(() => 
    calculateHeatmapData(startDate, daysToShow), 
    [startDate, calculateHeatmapData, daysToShow]
  );

  const dates = useMemo(() => {
    return Array.from({ length: daysToShow }).map((_, i) => addDays(startDate, i));
  }, [startDate, daysToShow]);

  const bottlenecks = useMemo(() => 
    getBottlenecks(startDate, daysToShow),
    [startDate, daysToShow, getBottlenecks]
  );

  const getUtilizationColor = (utilization: number) => {
    if (utilization === 0) return 'bg-zinc-900 border-white/5';
    if (utilization <= 50) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (utilization <= 80) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (utilization <= 100) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse';
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Kaynak & Kapasite Planlama
          </h2>
          <p className="text-muted-foreground text-sm">
            Ekip üyelerinin günlük iş yükünü ve uygunluk durumunu ısı haritası üzerinden izleyin.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-zinc-950/50 border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Kapasite Isı Haritası (Heatmap)</CardTitle>
              <CardDescription>Yük Dağılımı ve Kritik Darboğaz Analizi</CardDescription>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
                  <span className="text-muted-foreground">Serbest</span>
               </div>
               <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" />
                  <span className="text-muted-foreground">Dolu</span>
               </div>
               <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
                  <span className="text-muted-foreground">Aşırı Yük</span>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="p-4 text-left font-medium text-xs border-r border-white/10 sticky left-0 bg-zinc-950 z-10 w-[200px]">
                      Personel
                    </th>
                    {dates.map((date, idx) => (
                      <th key={idx} className="p-2 text-center border-r border-white/10 min-w-[45px]">
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] text-muted-foreground uppercase">{format(date, 'eee', { locale: tr })}</span>
                           <span className="text-xs font-bold">{format(date, 'dd')}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((resource) => (
                    <tr key={resource.userId} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm font-medium border-r border-white/10 sticky left-0 bg-zinc-950/80 backdrop-blur-md z-10">
                        {resource.displayName}
                      </td>
                      {resource.dailyData.map((point, idx) => (
                        <td key={idx} className="p-1 border-r border-white/10">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`aspect-square w-full rounded-md border flex items-center justify-center text-[10px] font-bold cursor-help transition-all hover:scale-110 ${getUtilizationColor(point.utilization)}`}>
                                  {point.totalCapacity > 0 ? `${Math.round(point.utilization)}%` : '-'}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-zinc-900 border-white/10 text-white p-3 space-y-2 w-[220px]">
                                <div className="flex justify-between items-center pb-2 border-b border-white/5 font-bold">
                                   <span>{format(new Date(point.date), 'dd MMMM yyyy', { locale: tr })}</span>
                                   <Badge variant="outline" className="text-[10px]">{point.totalCapacity} Saat</Badge>
                                </div>
                                {point.assignments.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {point.assignments.map((a, i) => (
                                      <div key={i} className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground truncate mr-2">{a.projectName}</span>
                                        <span className="font-mono text-primary">{a.load}s</span>
                                      </div>
                                    ))}
                                    <div className="pt-2 border-t border-white/5 flex justify-between items-center font-bold text-xs">
                                       <span>Toplam Yük:</span>
                                       <span className={point.utilization > 100 ? 'text-red-400' : 'text-emerald-400'}>
                                          {point.allocatedHours}s (%{Math.round(point.utilization)})
                                       </span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">Herhangi bir iş atanmamış.</p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="bg-zinc-950/50 border-white/10">
              <CardHeader>
                 <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Kritik Darboğazlar
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {bottlenecks.length > 0 ? bottlenecks.map(b => (
                   <div key={b.userId} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                     <p className="text-xs text-white font-medium">
                        <strong>{b.displayName}</strong>, önümüzdeki süreçte {b.daysOverloaded} gün kapasite aşımı yaşıyor.
                     </p>
                     <div className="flex flex-wrap gap-1">
                        {b.dates.slice(0, 5).map((d: string) => (
                          <Badge key={d} variant="outline" className="text-[9px] border-red-500/20 text-red-400">
                             {format(new Date(d), 'dd MMM')}
                          </Badge>
                        ))}
                     </div>
                   </div>
                 )) : (
                   <p className="text-xs text-muted-foreground italic">Şu an için kritik bir darboğaz tespit edilmedi.</p>
                 )}
              </CardContent>
           </Card>

           <Card className="bg-zinc-950/50 border-white/10">
              <CardHeader>
                 <CardTitle className="text-base flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-emerald-500" />
                    Dengeleme Önerileri
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-xs text-muted-foreground">
                    Aşırı yüklenen personelin görevlerini şu müsait üyelere kaydırabilirsiniz:
                 </p>
                 <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-white">Ayşe Kaya</span>
                       <span className="text-[10px] text-muted-foreground">Gelecek hafta %60 müsait</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Önerilen</Badge>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
