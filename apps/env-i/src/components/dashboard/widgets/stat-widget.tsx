import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, PackageX, Truck } from "lucide-react";
import { useTranslations } from "next-intl";

interface StatWidgetProps {
  value: string | number;
  label: string;
  description: string;
  icon: "dollar" | "package" | "package-x" | "truck";
  isDestructive?: boolean;
}

const icons = {
  dollar: DollarSign,
  package: Package,
  "package-x": PackageX,
  truck: Truck,
};

export function StatWidget({ value, label, description, icon, isDestructive }: StatWidgetProps) {
  const Icon = icons[icon];
  
  return (
    <Card className={`transition-all hover:shadow-lg hover:-translate-y-1 ${isDestructive ? 'border-destructive/20 bg-destructive/5' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${isDestructive ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${isDestructive ? 'text-destructive' : ''}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
