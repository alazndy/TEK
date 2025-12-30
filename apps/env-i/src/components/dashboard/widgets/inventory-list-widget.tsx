import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Product } from "@/lib/types";
import { List, AlertTriangle } from "lucide-react";

interface InventoryListWidgetProps {
  products: Product[];
  type: 'low-stock' | 'recent';
}

export function InventoryListWidget({ products, type }: InventoryListWidgetProps) {
  const t = useTranslations('Dashboard');

  const filteredProducts = type === 'low-stock' 
    ? products.filter(p => (p.stock || 0) < (p.minStock || 5)).slice(0, 5)
    : [...products].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5); // Sort by ID descending as a proxy for "recent" if date is missing

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {type === 'low-stock' ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : (
            <List className="h-5 w-5 text-emerald-400" />
          )}
          {type === 'low-stock' ? t('lowStockItems') : t('recentProducts')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 pt-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div key={`${product.id}-${index}`} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 transition-colors hover:border-white/10">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{product.name}</span>
                  <span className="text-xs text-muted-foreground">{product.productCategory || product.category}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-bold ${type === 'low-stock' ? 'text-destructive' : 'text-emerald-400'}`}>
                    {product.stock}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase">{product.room}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              {t('noProductsFound')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
