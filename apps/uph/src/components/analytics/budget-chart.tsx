'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useProjectStore } from '@/stores/project-store';

const COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

export function BudgetChart() {
  const { projects } = useProjectStore();

  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projects.reduce((acc, p) => acc + p.spent, 0);
  const remaining = totalBudget - totalSpent;

  const data = [
    { name: 'Spent', value: totalSpent },
    { name: 'Over Budget', value: Math.max(0, totalSpent - totalBudget) },
    { name: 'Remaining', value: Math.max(0, remaining) },
  ].filter(d => d.value > 0);

  const spentPercentage = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{spentPercentage}%</div>
              <div className="text-xs text-zinc-500">Used</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-zinc-500">Total Budget</div>
            <div className="text-lg font-semibold">${totalBudget.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-zinc-500">Total Spent</div>
            <div className="text-lg font-semibold text-orange-400">${totalSpent.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
