"use client"

import { useEffect, useMemo } from "react"
import {
  useDataStore 
} from "@/stores/data-store"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from 'next-intl';
import { useDashboardStore } from "@/stores/dashboard-store"
import { WidgetWrapper } from "@/components/dashboard/widget-wrapper"
import { WidgetRegistry } from "@/components/dashboard/widget-registry"
import { WidgetAddDialog } from "@/components/dashboard/widget-add-dialog"
import { Button } from "@/components/ui/button"
import { Edit2, Save, RotateCcw } from "lucide-react"

import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

export default function Dashboard() {
  const { 
    products, 
    orders, 
    proposals,
    logs,
    warehouses,
    fetchAllData 
  } = useDataStore()
  
  const { widgets, isEditing, toggleEditing, resetToDefault, setWidgets } = useDashboardStore()
  const t = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Metrics Calculations
  const metrics = useMemo(() => {
    const totalValue = products.reduce((sum, product) => sum + ((product.stock || 0) * (product.price || 0)), 0)
    const totalProducts = products.length
    const lowStockCount = products.filter(p => (p.stock || 0) < (p.minStock || 5)).length
    const pendingOrdersCount = orders.filter(o => o.status === 'Beklemede').length
    const totalProposalsCount = proposals.length
    const warehouseCount = warehouses.length
    return { 
      totalValue, 
      totalProducts, 
      lowStockCount, 
      pendingOrdersCount,
      totalProposalsCount,
      warehouseCount
    }
  }, [products, orders, proposals, warehouses])

  const salesTrendData = useMemo(() => {
      const last6Months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          return d.toLocaleString('tr-TR', { month: 'short' });
      });
      return last6Months.map(month => ({
          month,
          sales: Math.floor(Math.random() * 5000) + 1000
      }));
  }, [orders]);

  const topProductsData = useMemo(() => {
      const categoryCounts: Record<string, number> = {};
      products.forEach(p => {
          const cat = p.category || "Diğer";
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      return Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, quantity], index) => ({
            name,
            quantity,
            fill: `hsl(var(--chart-${index + 1}))`
        }));
  }, [products]);

  const widgetData = {
    metrics,
    salesTrendData,
    topProductsData,
    products,
    orders,
    proposals,
    logs,
    warehouses
  }

  const statWidgetIds = useMemo(() => widgets.filter(w => w.type.startsWith('stat-')).map(w => w.id), [widgets]);
  const otherWidgetIds = useMemo(() => widgets.filter(w => !w.type.startsWith('stat-')).map(w => w.id), [widgets]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      
      const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex).map((w, idx) => ({
        ...w,
        order: idx
      }));
      
      setWidgets(reorderedWidgets);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col gap-6 p-2 md:p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <div className="flex items-center gap-2">
            {isEditing && (
                <>
                    <WidgetAddDialog />
                    <Button variant="ghost" size="icon" onClick={resetToDefault} className="text-muted-foreground hover:text-foreground" title="Sıfırla">
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </>
            )}
            <Button 
                variant={isEditing ? "default" : "outline"} 
                className={`gap-2 ${isEditing ? 'bg-primary hover:bg-primary/90' : 'hover:bg-accent'}`}
                onClick={toggleEditing}
            >
                {isEditing ? (
                    <>
                        <Save className="h-4 w-4" />
                        {tCommon('saveDashboard')}
                    </>
                ) : (
                    <>
                        <Edit2 className="h-4 w-4" />
                        {tCommon('editDashboard')}
                    </>
                )}
            </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <motion.div 
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
        >
          <SortableContext items={statWidgetIds} strategy={rectSortingStrategy}>
            <div className="grid gap-4 w-full md:grid-cols-2 lg:grid-cols-4">
                {widgets.filter(w => w.type.startsWith('stat-')).map((widget) => (
                  <WidgetWrapper 
                    key={widget.id} 
                    id={widget.id} 
                    title={widget.title} 
                    visible={widget.visible}
                    variants={item}
                  >
                    <WidgetRegistry type={widget.type} data={widgetData} />
                  </WidgetWrapper>
                ))}
            </div>
          </SortableContext>

          <SortableContext items={otherWidgetIds} strategy={rectSortingStrategy}>
            <div className="grid gap-4 w-full md:grid-cols-2 lg:grid-cols-12">
                {widgets.filter(w => !w.type.startsWith('stat-')).map((widget) => (
                  <WidgetWrapper 
                    key={widget.id} 
                    id={widget.id} 
                    title={widget.title} 
                    visible={widget.visible}
                    className={widget.type.startsWith('chart-') ? 'col-span-full lg:col-span-8' : 'col-span-full md:col-span-1 lg:col-span-4'}
                    variants={item}
                  >
                    <div className={widget.type === 'chart-sales-trend' ? 'h-full min-h-[300px]' : 'min-h-[300px]'}>
                        <WidgetRegistry type={widget.type} data={widgetData} />
                    </div>
                  </WidgetWrapper>
                ))}
            </div>
          </SortableContext>
        </motion.div>
      </DndContext>
    </div>
  )
}
