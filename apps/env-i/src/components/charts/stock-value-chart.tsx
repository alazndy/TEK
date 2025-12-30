"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Product } from "@/lib/types"

interface StockValueChartProps {
    products: Product[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function StockValueChart({ products }: StockValueChartProps) {
    
    // Calculate totals by category
    const dataDisplay = React.useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        
        products.forEach(p => {
            const val = (p.price || 0) * (p.stock || 0);
            if (val > 0) {
                 categoryMap[p.category] = (categoryMap[p.category] || 0) + val;
            }
        });

        return Object.keys(categoryMap).map(key => ({
            name: key,
            value: categoryMap[key]
        }));
    }, [products]);


    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={dataDisplay}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {dataDisplay.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₺${value.toLocaleString()}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

import React from "react";
