"use client";

import { useRiskStore } from "@/stores/risk-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RiskMatrixProps {
  projectId: string;
}

export function RiskMatrix({ projectId }: RiskMatrixProps) {
  const { getProjectRisks } = useRiskStore();
  const risks = getProjectRisks(projectId);

  // 5x5 Matrix
  // Y-axis: Probability (5 to 1)
  // X-axis: Impact (1 to 5)
  
  const matrix: { risks: typeof risks, color: string }[][] = Array(5).fill(null).map(() => Array(5).fill(null));

  risks.forEach(risk => {
    if (risk.probability && risk.impact) {
      // Adjust index (5 should be index 0 for Y axis, 1 is index 4)
      const rowIndex = 5 - risk.probability; 
      const colIndex = risk.impact - 1;
      
      if (!matrix[rowIndex][colIndex]) {
          // Calculate color based on score
          const score = risk.probability * risk.impact;
          let color = "bg-green-100";
          if (score >= 15) color = "bg-red-100 border-red-300";
          else if (score >= 8) color = "bg-yellow-100 border-yellow-300";
          else color = "bg-green-100 border-green-300";

          matrix[rowIndex][colIndex] = { risks: [], color };
      }
      matrix[rowIndex][colIndex].risks.push(risk);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Matrisi (P x I)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex">
          {/* Y-Axis Label */}
          <div className="w-8 flex items-center justify-center -rotate-90 font-semibold text-sm text-muted-foreground whitespace-nowrap">
            Olasılık (Yüksek → Düşük)
          </div>

          <div className="flex-1">
             <div className="grid grid-rows-5 gap-1 aspect-square max-w-[400px] mx-auto border-l-2 border-b-2 border-zinc-300 p-1">
                {[5, 4, 3, 2, 1].map((prob, rowIndex) => (
                    <div key={prob} className="grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map((impact, colIndex) => {
                           const cell = matrix[rowIndex][colIndex];
                           const cellRisks =  risks.filter(r => r.probability === prob && r.impact === impact);
                           
                           let bgColor = "bg-zinc-50/50";
                           const score = prob * impact;
                           if (score >= 15) bgColor = "bg-red-100/50 hover:bg-red-200/50";
                           else if (score >= 8) bgColor = "bg-yellow-100/50 hover:bg-yellow-200/50";
                           else bgColor = "bg-green-100/50 hover:bg-green-200/50";

                           return (
                               <div key={`${prob}-${impact}`} className={`relative rounded border ${bgColor} flex items-center justify-center transition-colors`}>
                                   {cellRisks.length > 0 && (
                                       <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                                                        {cellRisks.length}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-semibold mb-1">Skor: {score}</p>
                                                    <ul className="text-xs list-disc pl-3">
                                                        {cellRisks.map(r => <li key={r.id}>{r.title}</li>)}
                                                    </ul>
                                                </TooltipContent>
                                            </Tooltip>
                                       </TooltipProvider>
                                   )}
                               </div>
                           );
                        })}
                    </div>
                ))}
             </div>
             
             {/* X-Axis Label */}
             <div className="text-center mt-2 font-semibold text-sm text-muted-foreground">
                Etki (Düşük → Yüksek)
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
