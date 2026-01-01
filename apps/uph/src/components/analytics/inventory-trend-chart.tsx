'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useInventoryStore } from '@/stores/inventory-store';
import { useMemo } from 'react';

export function InventoryTrendChart() {
  const { products } = useInventoryStore();

  // Generate mock trend data based on current state
  const trendData = useMemo(() => {
    const baseValue = products.reduce((acc, p) => acc + (p.stock * (p.price || 0)), 0);
    
    // Generate last 7 days of deterministic mock data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    return days.map((day, i) => ({
      day,
      value: Math.round(baseValue * (0.85 + (i * 0.025))),
    }));
  }, [products]);

  const currentValue = products.reduce((acc, p) => acc + (p.stock * (p.price || 0)), 0);
  const lowStockCount = products.filter(p => p.stock <= (p.minStock || 5)).length;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg">Inventory Value Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis 
                stroke="#9ca3af"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-zinc-500">Current Value</div>
            <div className="text-lg font-semibold text-purple-400">${currentValue.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-zinc-500">Low Stock Items</div>
            <div className={`text-lg font-semibold ${lowStockCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {lowStockCount}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
