'use client';
import React from 'react';
import { useFocusStore } from '../stores/focus-store';
import { Clock, CheckCircle, Flame, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}s ${minutes}dk`;
  return `${minutes} dakika`;
};

export const StatsPanel = () => {
  const { stats, exportData } = useFocusStore();

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">Bugünün Özeti</h3>
        <Button variant="ghost" size="sm" onClick={exportData} className="text-muted-foreground">
          <Download size={16} className="mr-2" /> Dışa Aktar
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-primary/10 rounded-xl">
          <Clock size={24} className="mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{formatDuration(stats.todayFocusTime)}</div>
          <div className="text-xs text-muted-foreground">Odaklanma Süresi</div>
        </div>
        
        <div className="text-center p-4 bg-green-500/10 rounded-xl">
          <CheckCircle size={24} className="mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold">{stats.todayTasksCompleted}</div>
          <div className="text-xs text-muted-foreground">Tamamlanan</div>
        </div>
        
        <div className="text-center p-4 bg-orange-500/10 rounded-xl">
          <Flame size={24} className="mx-auto mb-2 text-orange-500" />
          <div className="text-2xl font-bold">{stats.streak}</div>
          <div className="text-xs text-muted-foreground">Gün Serisi</div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-border/50 text-center text-sm text-muted-foreground">
        Toplam: {stats.tasksCompleted} görev • {formatDuration(stats.totalFocusTime)} odaklanma
      </div>
    </div>
  );
};
