"use client";

import { useProjectStore } from "@/stores/project-store";
import { useAuthStore } from "@/stores/auth-store"; // You might need a user list store later
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function UserPerformanceChart() {
  const { tasks } = useProjectStore();
  const allTasks = Object.values(tasks).flat();

  const data = [
    { name: 'Completed', value: allTasks.filter(t => t.status === 'done').length },
    { name: 'In Progress', value: allTasks.filter(t => t.status === 'in-progress').length },
    { name: 'To Do', value: allTasks.filter(t => t.status === 'todo').length },
    { name: 'Review', value: allTasks.filter(t => t.status === 'review').length },
  ];


  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Status Distribution</CardTitle>
        <CardDescription>
          Overall distribution of tasks by status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
