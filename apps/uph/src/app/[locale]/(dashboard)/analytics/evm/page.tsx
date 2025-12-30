'use client';

import React, { useEffect, useState } from 'react';
import { useEVMStore, initializeProjectEVM } from '@/stores/evm-store';
import { useProjectStore } from '@/stores/project-store';
import { 
  ProjectEVM, 
  EVM_STATUS_COLORS, 
  EVM_STATUS_LABELS,
  calculateEVMMetrics,
  determineEVMStatus
} from '@/types/evm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  DollarSign,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Loader2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  trend,
  color = 'text-foreground',
  tooltip
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  tooltip?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <Icon className={cn('h-4 w-4', color)} />
            </CardHeader>
            <CardContent>
              <div className={cn('text-2xl font-bold', color)}>{value}</div>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
              {trend && trend !== 'neutral' && (
                <div className={cn(
                  'absolute top-2 right-2',
                  trend === 'up' ? 'text-green-500' : 'text-red-500'
                )}>
                  {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

// Project EVM Row
function ProjectEVMRow({ evm }: { evm: ProjectEVM }) {
  const cpi = evm.currentMetrics.costPerformanceIndex;
  const spi = evm.currentMetrics.schedulePerformanceIndex;
  const statusColor = EVM_STATUS_COLORS[evm.status];

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: statusColor }}
        />
        <div>
          <div className="font-medium">{evm.projectName}</div>
          <div className="text-sm text-muted-foreground">
            Bütçe: {evm.budgetAtCompletion.toLocaleString('tr-TR')} {evm.currency}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">CPI</div>
          <div className={cn(
            'font-bold',
            cpi >= 1 ? 'text-green-600' : cpi >= 0.9 ? 'text-amber-600' : 'text-red-600'
          )}>
            {cpi.toFixed(2)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-muted-foreground">SPI</div>
          <div className={cn(
            'font-bold',
            spi >= 1 ? 'text-green-600' : spi >= 0.9 ? 'text-amber-600' : 'text-red-600'
          )}>
            {spi.toFixed(2)}
          </div>
        </div>
        
        <Badge 
          variant="outline"
          style={{ borderColor: statusColor, color: statusColor }}
        >
          {EVM_STATUS_LABELS[evm.status]}
        </Badge>
      </div>
    </div>
  );
}

export default function EVMDashboardPage() {
  const { projectEVMs, isLoading, error, subscribeToEVM, unsubscribeAll, getPortfolioSummary } = useEVMStore();
  const { projects, fetchProjects } = useProjectStore();
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    fetchProjects();
    subscribeToEVM();
    return () => unsubscribeAll();
  }, [fetchProjects, subscribeToEVM, unsubscribeAll]);

  const summary = getPortfolioSummary();

  // Initialize EVM for projects that don't have it
  const handleInitializeEVM = async () => {
    setIsInitializing(true);
    try {
      for (const project of projects) {
        const existingEVM = projectEVMs.find(e => e.projectId === project.id);
        if (!existingEVM && project.budget > 0) {
          await initializeProjectEVM(
            project.id,
            project.name,
            project.budget,
            project.startDate,
            project.deadline || project.startDate,
            project.completionPercentage,
            project.spent
          );
        }
      }
    } catch (err) {
      console.error('Error initializing EVM:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">EVM Dashboard</h1>
          <p className="text-muted-foreground">
            Earned Value Management - Proje performans analizi
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleInitializeEVM}
          disabled={isInitializing}
        >
          {isInitializing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          EVM Güncelle
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Toplam Bütçe"
          value={summary.totalBudget.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}
          icon={DollarSign}
          tooltip="Tüm projelerin toplam bütçesi (BAC)"
        />
        
        <MetricCard
          title="Kazanılan Değer"
          value={summary.totalEV.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}
          icon={Target}
          color="text-green-600"
          tooltip="Tamamlanan işin değeri (EV)"
        />
        
        <MetricCard
          title="Gerçek Maliyet"
          value={summary.totalAC.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}
          icon={BarChart3}
          color="text-blue-600"
          tooltip="Harcanan toplam tutar (AC)"
        />
        
        <MetricCard
          title="Ortalama CPI"
          value={summary.avgCPI.toFixed(2)}
          subtitle={summary.avgCPI >= 1 ? 'Bütçe altında' : 'Bütçe üstünde'}
          icon={TrendingUp}
          color={summary.avgCPI >= 1 ? 'text-green-600' : 'text-red-600'}
          trend={summary.avgCPI >= 1 ? 'up' : 'down'}
          tooltip="Cost Performance Index - Maliyet performansı"
        />
        
        <MetricCard
          title="Ortalama SPI"
          value={summary.avgSPI.toFixed(2)}
          subtitle={summary.avgSPI >= 1 ? 'Zamanında' : 'Gecikmeli'}
          icon={Calendar}
          color={summary.avgSPI >= 1 ? 'text-green-600' : 'text-amber-600'}
          trend={summary.avgSPI >= 1 ? 'up' : 'down'}
          tooltip="Schedule Performance Index - Zaman performansı"
        />
        
        <MetricCard
          title="Risk Altında"
          value={summary.projectsAtRisk}
          subtitle={`/ ${projectEVMs.length} proje`}
          icon={AlertTriangle}
          color={summary.projectsAtRisk > 0 ? 'text-amber-600' : 'text-green-600'}
          tooltip="CPI veya SPI < 0.95 olan projeler"
        />
      </div>

      {/* EVM Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            EVM Metrikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold">CPI</span> = EV / AC
              <p className="text-muted-foreground text-xs">{'> 1 = Bütçe altında'}</p>
            </div>
            <div>
              <span className="font-semibold">SPI</span> = EV / PV
              <p className="text-muted-foreground text-xs">{'> 1 = Takvim önünde'}</p>
            </div>
            <div>
              <span className="font-semibold">CV</span> = EV - AC
              <p className="text-muted-foreground text-xs">{'> 0 = Tasarruf'}</p>
            </div>
            <div>
              <span className="font-semibold">SV</span> = EV - PV
              <p className="text-muted-foreground text-xs">{'> 0 = Erken'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project List */}
      <Card>
        <CardHeader>
          <CardTitle>Proje Performansları</CardTitle>
          <CardDescription>
            {projectEVMs.length} proje takip ediliyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : projectEVMs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz EVM verisi yok</p>
              <p className="text-sm mt-2">
                Projelerin EVM verilerini oluşturmak için yukarıdaki butonu kullanın
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {projectEVMs.map(evm => (
                <ProjectEVMRow key={evm.projectId} evm={evm} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
