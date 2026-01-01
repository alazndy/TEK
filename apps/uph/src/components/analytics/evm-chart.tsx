
'use client';

import { useProjectStore } from '@/stores/project-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { format } from 'date-fns';

interface EVMChartProps {
  projectId: string;
}

export function EVMChart({ projectId }: EVMChartProps) {
  const { evmMetrics } = useProjectStore();

  if (!evmMetrics || evmMetrics.projectId !== projectId) {
    return (
        <Card className="glass-panel border-white/10 h-full flex items-center justify-center p-8">
            <div className="text-muted-foreground text-sm">No EVM data available yet. Start tracking tasks to see metrics.</div>
        </Card>
    );
  }

  // In a real implementation, we would fetch historical snapshots.
  // For this MVP, we simulate a trend based on current metrics to show the chart
  const data = [
      { date: 'Start', pv: 0, ev: 0, ac: 0 },
      { date: 'Current', pv: evmMetrics.plannedValue, ev: evmMetrics.earnedValue, ac: evmMetrics.actualCost },
      { date: 'Projected', pv: evmMetrics.budgetAtCompletion, ev: evmMetrics.estimateAtCompletion, ac: evmMetrics.estimateAtCompletion }
  ];

  return (
    <Card className="glass-panel border-white/10">
      <CardHeader>
        <CardTitle>Earned Value Analysis</CardTitle>
        <CardDescription>Performance trends (PV vs EV vs AC)</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1821', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="pv" name="Planned Value (PV)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="ev" name="Earned Value (EV)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="ac" name="Actual Cost (AC)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
         </div>
         <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
            <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">CPI</div>
                <div className={`text-xl font-bold ${evmMetrics.costPerformanceIndex >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                    {evmMetrics.costPerformanceIndex.toFixed(2)}
                </div>
                <div className="text-[10px] text-muted-foreground">Cost Efficiency</div>
            </div>
            <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">SPI</div>
                <div className={`text-xl font-bold ${evmMetrics.schedulePerformanceIndex >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                    {evmMetrics.schedulePerformanceIndex.toFixed(2)}
                </div>
                 <div className="text-[10px] text-muted-foreground">Schedule Efficiency</div>
            </div>
             <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">EAC</div>
                <div className="text-xl font-bold text-white">
                    ${evmMetrics.estimateAtCompletion.toFixed(0)}
                </div>
                 <div className="text-[10px] text-muted-foreground">Est. at Completion</div>
            </div>
         </div>
      </CardContent>
    </Card>
  );
}
