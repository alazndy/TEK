'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useInventoryStore } from '@/stores/inventory-store';
import { Product } from '@/types/inventory';

interface ProductUsageViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { useTranslations } from 'next-intl';

export function ProductUsageView({ product, open, onOpenChange }: ProductUsageViewProps) {
  const t = useTranslations('Inventory.usage');
  const { getProductUsages } = useInventoryStore();
  
  if (!product) return null;

  const usages = getProductUsages(product.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle>{t('title', { name: product.name })}</SheetTitle>
          <SheetDescription>
            {t('description')}
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
            <h3 className="text-sm font-medium mb-4">{t('activeAssignments')}</h3>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('table.project')}</TableHead>
                            <TableHead>{t('table.quantity')}</TableHead>
                            <TableHead>{t('table.date')}</TableHead>
                            <TableHead>{t('table.by')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    {t('noAssignments')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            usages.map((usage) => (
                                <TableRow key={usage.id}>
                                    <TableCell className="font-medium">{usage.projectName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{usage.quantity}</Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(usage.assignedDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-xs">{usage.assignedBy}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <div className="mt-8">
               <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-lg">
                       <div className="text-xs text-muted-foreground uppercase font-bold">{t('totalStock')}</div>
                       <div className="text-2xl font-bold">{product.stock + (product.totalAllocated || 0)}</div>
                   </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                       <div className="text-xs text-blue-700 uppercase font-bold">{t('allocated')}</div>
                       <div className="text-2xl font-bold text-blue-700">{product.totalAllocated || 0}</div>
                   </div>
               </div>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
