
"use client"

import * as React from "react"
import { useDataStore } from "@/stores/data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/inventory/columns"
import { PlusCircle, Loader2, Package } from "lucide-react"
import { ProductFormSheet } from "@/components/inventory/product-form-sheet"
import { StockProductViewer } from "@/components/inventory/stock-product-viewer"
import { BarcodeLabelDialog } from "@/components/inventory/barcode-label-dialog"
import { Product } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export default function StockProductsPage() {
  const products = useDataStore(state => state.products);
  const loadingProducts = useDataStore(state => state.loadingProducts);
  const addProduct = useDataStore(state => state.addProduct);
  const updateProduct = useDataStore(state => state.updateProduct);
  const deleteProduct = useDataStore(state => state.deleteProduct);
  const fetchProducts = useDataStore(state => state.fetchProducts);

  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>(undefined);

  // Fetch products on mount (Fetch All)
  React.useEffect(() => {
     fetchProducts(true);
  }, [fetchProducts]);

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
      await updateProduct(selectedProduct.id, data);
    } else {
      await addProduct({ ...data, category: "Stok Malzemesi" });
    }
    setIsSheetOpen(false);
  };

  const handleStockUpdate = async (id: string, newStock: number, note: string, type: 'Giriş' | 'Satış' | 'Sayım Düzeltme') => {
      const product = products.find(p => p.id === id);
      if (!product) return;

      const change = newStock - product.stock;
      if (change === 0) return;

      const historyItem = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          type: type,
          quantityChange: change,
          newStock: newStock,
          notes: note,
          user: "Mevcut Kullanıcı" 
      };

      const updatedHistory = [historyItem, ...(product.history || [])];

      await updateProduct(id, {
          stock: newStock,
          history: updatedHistory
      });
      
      toast({ title: "Başarılı", description: "Stok güncellendi." });
  };

  const dynamicColumns = columns({ 
    onEdit: handleEditProduct, 
    onDelete: (productId) => deleteProduct(productId, products.find(p => p.id === productId)?.name || ''),
    onPrintLabel: (product) => {
      setSelectedProduct(product);
      setIsLabelDialogOpen(true);
    },
    onView: handleViewProduct
  });

  return (
    <div className="space-y-4 h-full flex flex-col">
       <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Stok Ürünleri</h2>
            <p className="text-muted-foreground">
              Depodaki tüm stok malzemelerinin listesi ({products.length} ürün)
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddProduct} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Yeni Ürün Ekle
            </Button>
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardContent className="flex-1 p-0 overflow-hidden">
             <DataTable 
              columns={dynamicColumns as any} 
              data={products}
              isLoading={loadingProducts}
            />
          </CardContent>
        </Card>

        <ProductFormSheet 
          open={isSheetOpen} 
          onOpenChange={setIsSheetOpen} 
          onSubmit={handleFormSubmit}
          product={selectedProduct}
          manufacturers={["Brigade", "Luminex", "Sony", "Samsung", "LG", "Panasonic", "Diğer"]}
          productTemplates={[]}
        />

        {selectedProduct && (
          <StockProductViewer
            open={isDetailDialogOpen}
            onOpenChange={setIsDetailDialogOpen}
            product={selectedProduct}
            onStockUpdate={handleStockUpdate}
          />
        )}

        {selectedProduct && (
          <BarcodeLabelDialog
            open={isLabelDialogOpen}
            onOpenChange={setIsLabelDialogOpen}
            product={selectedProduct}
          />
        )}
    </div>
  )
}
