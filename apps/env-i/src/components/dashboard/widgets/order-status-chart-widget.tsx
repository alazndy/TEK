import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Order } from "@/lib/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";

interface OrderStatusChartWidgetProps {
  orders: Order[];
}

export function OrderStatusChartWidget({ orders }: OrderStatusChartWidgetProps) {
  const t = useTranslations('Dashboard');

  const statusCounts: Record<string, number> = {};
  orders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const chartData = Object.entries(statusCounts).map(([name, value], index) => ({
    name,
    value,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`
  }));

  const chartConfig = {
    value: {
      label: "Sipariş Sayısı",
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('orderStatuses')}</CardTitle>
        <CardDescription>{t('orderStatusDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={2} />
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
