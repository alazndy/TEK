
'use client';

import React from 'react';
import { useProjectStore } from '@/stores/project-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RiskMatrixProps {
  projectId: string;
}

export function RiskMatrix({ projectId }: RiskMatrixProps) {
  const { risks } = useProjectStore();
  const projectRisks = risks.filter(r => r.projectId === projectId);

  // Matrix Grid: 5x5 (Probability x Impact)
  // Axis: 1-5
  const renderCell = (prob: number, matchImpact: number) => {
    const matchedRisks = projectRisks.filter(r => 
      Math.round(r.probability) === prob && Math.round(r.impact) === matchImpact
    );

    let bgColor = 'bg-white/5';
    // Heatmap coloring
    const score = prob * matchImpact;
    if (score >= 20) bgColor = 'bg-red-500/20 border-red-500/30';
    else if (score >= 12) bgColor = 'bg-orange-500/20 border-orange-500/30';
    else if (score >= 6) bgColor = 'bg-yellow-500/20 border-yellow-500/30';
    else bgColor = 'bg-green-500/10 border-green-500/20';

    return (
      <div className={cn("h-24 w-full border rounded-lg p-1 relative transition-all hover:scale-105", bgColor)}>
        {matchedRisks.length > 0 && (
          <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-1 p-1 overflow-hidden">
             {matchedRisks.map(r => (
               <div key={r.id} title={r.title} className="w-2 h-2 rounded-full bg-white shadow-sm ring-1 ring-black/20" />
             ))}
             <span className="text-[10px] font-bold text-white/50 w-full text-center mt-1">
               {matchedRisks.length}
             </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="glass-panel border-white/10">
      <CardHeader>
        <CardTitle>Risk Matrix</CardTitle>
        <CardDescription>Probability vs. Impact Heatmap</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
           <div className="flex gap-2 items-center">
             <div className="w-8 -rotate-90 text-xs text-muted-foreground font-bold whitespace-nowrap">Probability (1-5)</div>
             <div className="flex-1 grid grid-cols-5 gap-2">
                {[5, 4, 3, 2, 1].map(prob => (
                    <React.Fragment key={prob}>
                       {[1, 2, 3, 4, 5].map(impact => (
                           <div key={`${prob}-${impact}`}>
                               {renderCell(prob, impact)}
                           </div>
                       ))}
                    </React.Fragment>
                ))}
            </div>
           </div>
           <div className="flex justify-center mt-2">
             <div className="text-xs text-muted-foreground font-bold">Impact (1-5)</div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
