"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    date: "Oca",
    value: 12400,
  },
  {
    date: "Şub",
    value: 14300,
  },
  {
    date: "Mar",
    value: 11200,
  },
  {
    date: "Nis",
    value: 15800,
  },
  {
    date: "May",
    value: 18900,
  },
  {
    date: "Haz",
    value: 23900,
  },
  {
    date: "Tem",
    value: 24500,
  },
]

export function StockHistoryChart() {
  return (
    <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
            <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            </defs>
            <XAxis
            dataKey="date"
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
            tickFormatter={(value) => `₺${value}`}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip />
            <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorValue)"
            />
        </AreaChart>
        </ResponsiveContainer>
    </div>
  )
}
