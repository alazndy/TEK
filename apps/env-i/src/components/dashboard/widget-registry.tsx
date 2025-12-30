import { StatWidget } from "./widgets/stat-widget";
import { SalesTrendChart, TopProductsChart } from "@/components/charts";
import { ActivityListWidget } from "./widgets/activity-list-widget";
import { InventoryListWidget } from "./widgets/inventory-list-widget";
import { OrderStatusChartWidget } from "./widgets/order-status-chart-widget";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WidgetType } from "@/lib/types";
import { useTranslations } from "next-intl";

interface WidgetRegistryProps {
  type: WidgetType;
  data: any;
}

export function WidgetRegistry({ type, data }: WidgetRegistryProps) {
  const t = useTranslations('Dashboard');

  switch (type) {
    case 'stat-inventory-value':
      return (
        <StatWidget
          label={t('totalInventoryValue')}
          value={new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(data.metrics.totalValue)}
          description={t('currentStockValue')}
          icon="dollar"
        />
      );
    case 'stat-product-types':
      return (
        <StatWidget
          label={t('totalProductTypes')}
          value={data.metrics.totalProducts}
          description={t('totalRegisteredCards')}
          icon="package"
        />
      );
    case 'stat-low-stock':
      return (
        <StatWidget
          label={t('lowStockProducts')}
          value={data.metrics.lowStockCount}
          description={t('belowMinLevel')}
          icon="package-x"
          isDestructive={data.metrics.lowStockCount > 0}
        />
      );
    case 'stat-pending-orders':
      return (
        <StatWidget
          label={t('pendingOrders')}
          value={data.metrics.pendingOrdersCount}
          description={t('preparingOrWaiting')}
          icon="truck"
        />
      );
    case 'stat-total-proposals':
      return (
        <StatWidget
          label={t('totalProposals')}
          value={data.metrics.totalProposalsCount}
          description={t('totalProposalsDesc')}
          icon="dollar"
        />
      );
    case 'stat-warehouse-count':
      return (
        <StatWidget
          label={t('totalWarehouses')}
          value={data.metrics.warehouseCount}
          description={t('registeredWarehouses')}
          icon="package"
        />
      );
    case 'chart-sales-trend':
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{t('salesTrends')}</CardTitle>
            <CardDescription>{t('salesTrendDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesTrendChart data={data.salesTrendData} />
          </CardContent>
        </Card>
      );
    case 'chart-category-dist':
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{t('categoryDistribution')}</CardTitle>
            <CardDescription>{t('categoryDistributionDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsChart data={data.topProductsData} />
          </CardContent>
        </Card>
      );
    case 'chart-order-status':
      return <OrderStatusChartWidget orders={data.orders} />;
    case 'list-recent-activities':
      return <ActivityListWidget logs={data.logs} />;
    case 'list-low-stock':
      return <InventoryListWidget products={data.products} type="low-stock" />;
    case 'list-recent-orders':
      return <InventoryListWidget products={data.products} type="recent" />;
    default:
      return <div>Unknown Widget Type</div>;
  }
}
