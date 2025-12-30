
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useDataStore } from "@/stores/data-store";
import { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ClipboardCheck, AlertTriangle, Loader2 } from "lucide-react"

type CountedProduct = Product & { countedStock?: number; initialStock: number }

export default function PhysicalCountPage() {
  const { products, loadingProducts, finishPhysicalCount, fetchProducts } = useDataStore();
  const [countedProducts, setCountedProducts] = useState<CountedProduct[]>([])
  const [isFinishing, setIsFinishing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentCount, setCurrentCount] = useState("")
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts(true);
    }
  }, [fetchProducts, products.length]);

  useEffect(() => {
    // Initialize countedProducts once products are loaded
    if (products.length > 0) {
        setCountedProducts(products.map(p => ({
            ...p,
            initialStock: p.stock,
        })));
    }
  }, [products]);

  const handleNext = () => {
    const newProducts = [...countedProducts]
    newProducts[currentIndex].countedStock = Number.parseInt(currentCount, 10)
    setCountedProducts(newProducts)
    setCurrentCount("")
    
    if (currentIndex < countedProducts.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      handleFinishCount();
    }
  }

  const handleFinishCount = async () => {
      setIsFinishing(true);
      await finishPhysicalCount(countedProducts);
      setIsFinished(true);
      setIsFinishing(false);
  }
  
  const handleRestart = () => {
      setCurrentIndex(0)
      setCurrentCount("")
      setIsFinished(false)
      // Refetch initial data
       if (products.length > 0) {
        setCountedProducts(products.map(p => ({ ...p, initialStock: p.stock })));
       }
  }

  const currentProduct = countedProducts[currentIndex]
  const progress = countedProducts.length > 0 ? ((currentIndex + 1) / countedProducts.length) * 100 : 0
  
  const diffReport = countedProducts
    .filter(p => p.countedStock !== undefined && p.countedStock !== p.initialStock)
    .map(p => ({ ...p, diff: p.countedStock! - p.initialStock }));

  if (loadingProducts && products.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
  }

  if (isFinished) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Fiziksel Sayım Raporu</CardTitle>
                <CardDescription>Stok sayımı tamamlandı. Farklar aşağıda listelenmiştir.</CardDescription>
            </CardHeader>
            <CardContent>
                {diffReport.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ürün Adı</TableHead>
                                <TableHead>Beklenen Stok</TableHead>
                                <TableHead>Sayılan Stok</TableHead>
                                <TableHead>Fark</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {diffReport.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell>{p.initialStock}</TableCell>
                                    <TableCell>{p.countedStock}</TableCell>
                                    <TableCell>
                                        <Badge variant={p.diff > 0 ? "default" : "destructive"} className={p.diff > 0 ? "bg-green-600" : ""}>
                                            {p.diff > 0 ? `+${p.diff}`: p.diff}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Alert>
                        <ClipboardCheck className="h-4 w-4" />
                        <AlertTitle>Stoklar Eşleşiyor!</AlertTitle>
                        <AlertDescription>
                            Fiziksel sayım ile sistemdeki stoklar arasında bir fark bulunamadı. Harika iş!
                        </AlertDescription>
                    </Alert>
                )}
                 <div className="mt-6 flex justify-end">
                    <Button onClick={handleRestart}>Yeni Sayım Başlat</Button>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <ClipboardCheck className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle>Fiziksel Sayım Modu</CardTitle>
                        <CardDescription>Envanterdeki ürünleri sayarak stokları güncelleyin.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {countedProducts.length > 0 && currentProduct ? (
                    <>
                        <div>
                            <Progress value={progress} className="w-full" />
                            <p className="text-sm text-muted-foreground mt-2 text-center">{currentIndex + 1} / {countedProducts.length}</p>
                        </div>

                        <div className="text-center p-8 border rounded-lg bg-secondary/50">
                            <p className="text-lg text-muted-foreground">Ürün Adı:</p>
                            <h2 className="text-3xl font-bold tracking-tight">{currentProduct.name}</h2>
                            <p className="text-sm text-muted-foreground mt-2">Konum: {currentProduct.room} / {currentProduct.shelf}</p>
                            <p className="text-sm text-muted-foreground">Mevcut Stok: {currentProduct.stock} adet</p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <label htmlFor="stock-count" className="font-medium">Sayılan Stok Miktarı:</label>
                            <Input
                                id="stock-count"
                                type="number"
                                value={currentCount}
                                onChange={(e) => setCurrentCount(e.target.value)}
                                placeholder="Miktarı girin..."
                                className="w-48 text-center text-lg h-12"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                            />
                            <Button onClick={handleNext} disabled={!currentCount || isFinishing}>
                                {isFinishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {currentIndex < countedProducts.length - 1 ? 'Sonraki Ürün' : 'Sayımı Bitir'}
                            </Button>
                        </div>
                    </>
                ) : (
                     <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Envanter Boş</AlertTitle>
                        <AlertDescription>
                           Sayım yapabilmek için önce envantere ürün eklemelisiniz.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    </div>
  )
}
