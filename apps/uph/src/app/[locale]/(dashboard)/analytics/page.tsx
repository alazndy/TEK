'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { ProjectProgressChart, BudgetChart, InventoryTrendChart } from '@/components/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectStore } from '@/stores/project-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { exportToExcel, exportToCSV } from '@/lib/export-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useTranslations } from 'next-intl';

export default function AnalyticsPage() {
  const t = useTranslations('Analytics');
  const { projects, fetchProjects } = useProjectStore();
  const { products, fetchInventory } = useInventoryStore();

  useEffect(() => {
    fetchProjects();
    fetchInventory();
  }, [fetchProjects, fetchInventory]);

  const handleExportProjects = (format: 'excel' | 'csv') => {
    const data = projects.map(p => ({
      Name: p.name,
      Status: p.status,
      Budget: p.budget,
      Spent: p.spent,
      Progress: `${p.completionPercentage}%`,
      Tags: p.tags.join(', '),
    }));
    
    const options = {
      title: 'Proje Raporu',
      filename: 'projects-report',
      columns: [
        { header: 'Ad', key: 'Name' },
        { header: 'Durum', key: 'Status' },
        { header: 'Bütçe', key: 'Budget' },
        { header: 'Harcanan', key: 'Spent' },
        { header: 'İlerleme', key: 'Progress' },
        { header: 'Etiketler', key: 'Tags' },
      ],
      data,
    };
    
    if (format === 'excel') {
      exportToExcel(options);
    } else {
      exportToCSV(options);
    }
  };

  const handleExportInventory = (format: 'excel' | 'csv') => {
    const data = products.map(p => ({
      Name: p.name,
      SKU: p.partNumber || p.barcode || '',
      Stock: p.stock,
      MinStock: p.minStock || 5,
      Price: p.price || 0,
      Value: (p.stock * (p.price || 0)),
      Category: p.category || '',
    }));
    
    const options = {
      title: 'Envanter Raporu',
      filename: 'inventory-report',
      columns: [
        { header: 'Ad', key: 'Name' },
        { header: 'SKU', key: 'SKU' },
        { header: 'Stok', key: 'Stock' },
        { header: 'Min Stok', key: 'MinStock' },
        { header: 'Fiyat', key: 'Price' },
        { header: 'Değer', key: 'Value' },
        { header: 'Kategori', key: 'Category' },
      ],
      data,
    };
    
    if (format === 'excel') {
      exportToExcel(options);
    } else {
      exportToCSV(options);
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                {t('exportProjects')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportProjects('excel')}>
                <Download className="mr-2 h-4 w-4" />
                {t('exportExcel')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportProjects('csv')}>
                <Download className="mr-2 h-4 w-4" />
                {t('exportCSV')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                {t('exportInventory')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportInventory('excel')}>
                <Download className="mr-2 h-4 w-4" />
                {t('exportExcel')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportInventory('csv')}>
                <Download className="mr-2 h-4 w-4" />
                {t('exportCSV')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProjectProgressChart />
        <BudgetChart />
        <InventoryTrendChart />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">{t('totalProjects')}</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-bold">{projects.length}</div>
           </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">{t('activeProjects')}</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-bold text-green-600 dark:text-green-400">
               {projects.filter(p => p.status === 'Active').length}
             </div>
           </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">{t('inventoryItems')}</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-bold">{products.length}</div>
           </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">{t('lowStockAlerts')}</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-bold text-red-600 dark:text-red-400">
               {products.filter(p => p.stock <= (p.minStock || 5)).length}
             </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
