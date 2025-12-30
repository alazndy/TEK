"use client";

import { useProjectStore } from "@/stores/project-store";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ProfitabilityChart() {
  const { projects } = useProjectStore();

  const data = projects.map(p => ({
    name: p.name,
    budget: p.budget,
    spent: p.spent,
    profit: Math.max(0, p.budget - p.spent) // Simplified profit calculation
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Project Profitability Analysis</CardTitle>
        <CardDescription>
          Budget vs. Spent comparison across projects
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
            />
            <Legend />
            <Bar dataKey="budget" name="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="spent" name="spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
