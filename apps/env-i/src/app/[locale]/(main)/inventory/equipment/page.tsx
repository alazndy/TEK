"use client"

import * as React from "react"
import { useDataStore } from "@/stores/data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/inventory/columns"
import { PlusCircle, Loader2, HardDrive } from "lucide-react"
import { ProductFormSheet } from "@/components/inventory/product-form-sheet"
import { ProductDetailDialog } from "@/components/inventory/product-detail-dialog"
import { BarcodeLabelDialog } from "@/components/inventory/barcode-label-dialog"
import { Equipment, Product } from "@/lib/types"
import { seedProducts } from "@/lib/seed-data"

export default function EquipmentPage() {
  // Use equipment from store (separate collection)
  const equipment = useDataStore(state => state.equipment);
  const loadingEquipment = useDataStore(state => state.loadingEquipment);
  const addEquipment = useDataStore(state => state.addEquipment);
  const updateEquipment = useDataStore(state => state.updateEquipment);
  const deleteEquipment = useDataStore(state => state.deleteEquipment);
  const loadMoreEquipment = useDataStore(state => state.loadMoreEquipment);
  const hasMoreEquipment = useDataStore(state => state.hasMoreEquipment);
  const fetchEquipment = useDataStore(state => state.fetchEquipment);

  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>(undefined);

  // Fetch equipment on mount
  React.useEffect(() => {
    if (equipment.length === 0) {
      fetchEquipment(true);
    }
  }, [fetchEquipment, equipment.length]);

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setIsSheetOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (selectedProduct) {
      await updateEquipment(selectedProduct.id, data);
    } else {
      await addEquipment({ ...data, category: "Demirbaş" });
    }
    setIsSheetOpen(false);
  };

  const dynamicColumns = columns({ 
    onEdit: handleEditProduct, 
    onDelete: (productId) => deleteEquipment(productId, equipment.find((e: Equipment) => e.id === productId)?.name || ''),
    onPrintLabel: (product) => {
      setSelectedProduct(product);
      setIsLabelDialogOpen(true);
    },
    onView: handleViewProduct,
    onShowOnMap: (product) => {
      const zoneParam = encodeURIComponent(product.room || '');
      window.location.href = `/warehouse-map?zone=${zoneParam}&product=${product.id}`;
    },
  }) as any;

  const manufacturers = [...new Set(equipment.map((e: Equipment) => e.manufacturer).filter(Boolean))];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <HardDrive className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <CardTitle>Demirbaşlar</CardTitle>
                <CardDescription>Demirbaş envanterini görüntüleyin ve yönetin.</CardDescription>
              </div>
            </div>
            <Button onClick={handleAddProduct}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Demirbaş Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingEquipment && equipment.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable 
              columns={dynamicColumns} 
              data={equipment}
              onLoadMore={loadMoreEquipment}
              hasMore={hasMoreEquipment}
              isLoading={loadingEquipment}
            />
          )}
        </CardContent>
      </Card>
      
      <ProductFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        product={selectedProduct}
        onSubmit={handleFormSubmit}
        manufacturers={manufacturers}
        productTemplates={seedProducts}
      />
      <ProductDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        product={selectedProduct}
      />
      <BarcodeLabelDialog
        open={isLabelDialogOpen}
        onOpenChange={setIsLabelDialogOpen}
        product={selectedProduct}
      />
    </>
  )
}
