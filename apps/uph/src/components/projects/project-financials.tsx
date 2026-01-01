
"use client";

import React, { useMemo } from 'react';
import { Project } from '@/types/project';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectUsage, Product } from '@/types/inventory';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, PieChart as PieChartIcon, Wallet } from 'lucide-react';

interface ProjectFinancialsProps {
    project: Project;
    projectInventory: ProjectUsage[];
    allProducts: Product[];
}

export function ProjectFinancials({ project, projectInventory, allProducts }: ProjectFinancialsProps) {
    
    // Calculate Material Cost from Inventory Assignments
    const materialCost = useMemo(() => {
        return projectInventory.reduce((total, usage) => {
            const product = allProducts.find(p => p.id === usage.productId);
            const price = product?.price || 0;
            return total + (price * usage.quantity);
        }, 0);
    }, [projectInventory, allProducts]);

    // Assume remaining spent is Labor/Services (since we only track material items explicitly)
    // If spent < materialCost, it means we haven't updated 'spent' field correctly or data is out of sync.
    // For visualization, we will just use materialCost as one slice, and (Spent - Material) as "Labor/Other".
    const laborCost = Math.max(0, project.spent - materialCost);

    // Mock Budget Breakdown (if real data missing)
    const budgetData = [
        { name: 'Malzeme (Gerçekleşen)', value: materialCost, color: '#3b82f6' },
        { name: 'İşçilik/Diğer (Tahmini)', value: laborCost, color: '#f59e0b' },
        { name: 'Kalan Bütçe', value: Math.max(0, project.budget - project.spent), color: '#10b981' },
    ];

    // Mock Profitability (Assuming 20% Markup on Budget as Contract Value if not defined)
    const contractValue = project.budget * 1.25; 
    const projectedProfit = contractValue - project.spent;
    const margin = (projectedProfit / contractValue) * 100;

    const comparisonData = [
         { name: 'Bütçe', amount: project.budget },
         { name: 'Harcama', amount: project.spent },
         { name: 'Sözleşme', amount: contractValue },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* KPI Cards */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Toplam Maliyet</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${project.spent.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Malzeme: ${materialCost.toLocaleString()}
                        <br/>
                        İşçilik/Diğer: ${laborCost.toLocaleString()}
                    </p>
                    <div className="mt-4 h-[200px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={budgetData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {budgetData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-3">
                 <CardHeader>
                    <CardTitle className="text-sm font-medium">Bütçe vs Harcama vs Gelir</CardTitle>
                    <CardDescription>Finansal Genel Bakış</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
                                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Tutar']} />
                                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

             <Card className="lg:col-span-2">
                <CardHeader>
                     <CardTitle className="text-sm font-medium">Karlılık Analizi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                         <span className="text-sm text-muted-foreground">Sözleşme Değeri</span>
                         <span className="font-bold">${contractValue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                         <span className="text-sm text-muted-foreground">Maliyet</span>
                         <span className="font-bold text-red-500">-${project.spent.toLocaleString()}</span>
                    </div>
                     <div className="flex items-center justify-between pt-2">
                         <span className="text-sm font-medium">Net Kar</span>
                         <span className={`font-bold text-xl ${projectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${projectedProfit.toLocaleString()}
                         </span>
                    </div>
                    
                    <div className="pt-4 flex items-center gap-2">
                        {margin >= 0 ? <TrendingUp className="text-green-500 h-5 w-5"/> : <TrendingDown className="text-red-500 h-5 w-5"/>}
                        <span className="text-sm font-medium">Kar Marjı: </span>
                        <span className={`text-lg font-bold ${margin >= 20 ? 'text-green-600' : (margin > 0 ? 'text-yellow-600' : 'text-red-600')}`}>
                            %{margin.toFixed(1)}
                        </span>
                    </div>
                     <p className="text-[10px] text-muted-foreground mt-2">
                        *Tahmini sözleşme değeri bütçenin %125'i olarak hesaplanmıştır.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
