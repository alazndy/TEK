"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Pie, PieChart, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

// NOTE: Charts are temporarily disabled as they relied on static data that has been removed.
// They can be re-enabled and connected to dynamic data from Firestore in the future.

const chartConfig = {
  sales: {
    label: "Satış",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function SalesTrendChart({ data }: { data: { month: string; sales: number }[] }) {
  if (!data || data.length === 0) {
     return (
        <div className="flex items-center justify-center h-full bg-secondary/50 rounded-lg">
          <p className="text-muted-foreground">Satış trendi verisi bulunmuyor.</p>
        </div>
      )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

const topProductsConfig = {
    quantity: {
        label: "Miktar",
        theme: {
            light: "hsl(var(--primary))",
            dark: "hsl(var(--primary))",
        }
    }
} satisfies ChartConfig

export function TopProductsChart({ data }: { data: { name: string; quantity: number, fill?: string }[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-secondary/50 rounded-lg">
              <p className="text-muted-foreground">Ürün verisi bulunmuyor.</p>
            </div>
        )
    }

    // Assign colors dynamically if not provided
    const coloredData = data.map((item, index) => ({
        ...item,
        fill: item.fill || `hsl(var(--chart-${(index % 5) + 1}))`,
    }));


    return (
        <ChartContainer config={topProductsConfig} className="mx-auto aspect-square max-h-[250px] [&_.recharts-pie-label-text]:fill-foreground">
            <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={coloredData} dataKey="quantity" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={2} />
                 <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                  />
            </PieChart>
        </ChartContainer>
    )
}
