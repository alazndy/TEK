'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useProjectStore } from '@/stores/project-store';

const statusColors: Record<string, string> = {
  Planning: '#6366f1',
  Active: '#22c55e',
  'On Hold': '#f59e0b',
  Completed: '#8b5cf6',
};

export function ProjectProgressChart() {
  const { projects } = useProjectStore();

  // Group projects by status
  const statusData = projects.reduce((acc, project) => {
    const status = project.status;
    const existing = acc.find(d => d.status === status);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ status, count: 1 });
    }
    return acc;
  }, [] as { status: string; count: number }[]);

  // Ensure all statuses are represented
  const allStatuses = ['Planning', 'Active', 'On Hold', 'Completed'];
  const chartData = allStatuses.map(status => ({
    status,
    count: statusData.find(d => d.status === status)?.count || 0,
    rawStatus: status,
  }));

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg">Project Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis 
                dataKey="status" 
                type="category" 
                stroke="#9ca3af"
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={statusColors[entry.rawStatus] || '#6366f1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
