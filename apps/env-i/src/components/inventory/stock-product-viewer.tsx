"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Product, StockMovement } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  AlertTriangle, Copy, Check, ExternalLink, Box, Archive, MapPin, 
  History, Settings2, Printer, Share2, Plus, Minus, Info, 
  ArrowUpRight, ArrowDownRight, RefreshCcw, TrendingUp, DollarSign
} from "lucide-react"
import { useCurrencyStore, currencySymbols } from "@/stores/currency-store"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface StockProductViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onStockUpdate?: (id: string, newStock: number, note: string, type: 'Giriş' | 'Satış' | 'Sayım Düzeltme') => Promise<void>
}

export function StockProductViewer({ open, onOpenChange, product, onStockUpdate }: StockProductViewerProps) {
  const { rates } = useCurrencyStore();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [stockInput, setStockInput] = React.useState("");
  const [stockReason, setStockReason] = React.useState("");

  if (!product) return null

  const getStockStatus = (stock: number, minStock: number = 0) => {
    if (stock <= 0) return { label: 'Stok Tükendi', color: 'destructive', icon: AlertTriangle };
    if (stock <= minStock) return { label: 'Kritik Stok', color: 'orange', icon: Info };
    return { label: 'Stokta Var', color: 'green', icon: Check };
  };

  const status = getStockStatus(product.stock, product.minStock || 5);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopyalandı", description: "Panoya kopyalandı." });
  }

  const handleStockAction = async (action: 'add' | 'remove') => {
      if (!stockInput || isNaN(Number(stockInput))) return;
      if (!onStockUpdate) return;
      
      const amount = Number(stockInput);
      const newStock = action === 'add' ? product.stock + amount : product.stock - amount;
      
      if (newStock < 0) {
          toast({ title: "Hata", description: "Stok negatif olamaz.", variant: "destructive" });
          return;
      }

      await onStockUpdate(
          product.id, 
          newStock, 
          stockReason || (action === 'add' ? 'Manuel Stok Girişi' : 'Manuel Stok Çıkışı'),
          action === 'add' ? 'Giriş' : 'Satış'
      );
      
      setStockInput("");
      setStockReason("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl">
        {/* Header */}
        <div className="p-6 border-b bg-card/50">
           <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="h-20 w-20 rounded-xl bg-muted border flex items-center justify-center overflow-hidden shadow-sm">
                        {product.images && product.images.length > 0 ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <Box className="h-8 w-8 text-muted-foreground/50" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <Badge variant="outline" className="h-6">
                                {product.category}
                             </Badge>
                             {product.isFaulty && (
                                <Badge variant="destructive" className="h-6 gap-1">
                                    <AlertTriangle className="h-3 w-3" /> Arızalı
                                </Badge>
                             )}
                        </div>
                        <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <span>{product.manufacturer}</span>
                            <span>•</span>
                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{product.barcode}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleCopy(product.barcode)}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Printer className="h-4 w-4" />
                        Etiket Yazdır
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
           </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
            
            {/* Left Sidebar (Key Info) */}
            <div className="border-r bg-muted/30 p-6 space-y-6 overflow-y-auto">
                {/* Stock Status Card */}
                <div className={`p-4 rounded-xl border bg-card shadow-sm relative overflow-hidden`}>
                    <div className={`absolute top-0 left-0 w-1 h-full bg-${status.color === 'green' ? 'emerald' : status.color === 'orange' ? 'orange' : 'red'}-500`} />
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-muted-foreground font-medium">Mevcut Stok</span>
                        <status.icon className={`h-5 w-5 text-${status.color === 'green' ? 'emerald' : status.color === 'orange' ? 'orange' : 'red'}-500`} />
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                        {product.stock} <span className="text-sm font-normal text-muted-foreground">adet</span>
                    </div>
                    <div className="mt-4 pt-4 border-t flex gap-2">
                        <Button className="flex-1" variant="outline" size="sm" onClick={() => setActiveTab("stock")}>
                            Stok Düzenle
                        </Button>
                    </div>
                </div>

                {/* Location Card */}
                <div className="p-4 rounded-xl border bg-card shadow-sm cursor-pointer hover:border-primary/50 transition-colors" 
                     onClick={() => window.open(`/warehouse-map?zone=${encodeURIComponent(product.room || '')}&product=${product.id}`, '_self')}>
                    <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">Depo Konumu</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-xs text-muted-foreground">Oda / Bölge</div>
                            <div className="font-semibold">{product.room || "-"}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Raf / Dolap</div>
                            <div className="font-semibold">{product.shelf || "-"}</div>
                        </div>
                    </div>
                     <div className="mt-3 text-xs text-blue-500 flex items-center justify-end gap-1">
                        Haritada Göster <ArrowUpRight className="h-3 w-3" />
                    </div>
                </div>

                {/* Price Card */}
                <div className="p-4 rounded-xl border bg-card shadow-sm">
                     <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm font-medium">Fiyat Bilgisi</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {currencySymbols[product.priceCurrency || 'TRY']}{Number(product.price || 0).toFixed(2)}
                    </div>
                    {product.priceCurrency !== 'TRY' && rates && (
                         <div className="text-sm text-muted-foreground mt-1">
                            ≈ ₺{(Number(product.price || 0) / rates[product.priceCurrency || 'TRY'] * rates['TRY']).toFixed(2)}
                         </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-2 flex flex-col">
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <div className="px-6 pt-4 border-b">
                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-0 font-medium">Genel Bakış</TabsTrigger>
                            <TabsTrigger value="stock" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-0 font-medium">Stok Hareketleri</TabsTrigger>
                            <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-0 font-medium">Geçmiş</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-6">
                            <TabsContent value="overview" className="mt-0 space-y-6">
                                <div>
                                    <h3 className="font-medium mb-2 text-muted-foreground">Açıklama</h3>
                                    <p className="text-sm leading-relaxed">
                                        {product.description || "Açıklama bulunmuyor."}
                                    </p>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                    <div className="flex justify-between py-2 border-b border-dashed">
                                        <span className="text-muted-foreground">Model No</span>
                                        <span className="font-medium">{product.modelNumber || "-"}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-dashed">
                                        <span className="text-muted-foreground">Parça No</span>
                                        <span className="font-medium">{product.partNumber || "-"}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-dashed">
                                        <span className="text-muted-foreground">Oluşturulma</span>
                                        <span className="font-medium">
                                            {new Date().toLocaleDateString('tr-TR')} {/* Mock for now */}
                                        </span>
                                    </div>
                                </div>

                                {product.images && product.images.length > 0 && (
                                    <div className="space-y-2">
                                         <h3 className="font-medium text-muted-foreground">Galeri</h3>
                                         <div className="flex gap-2 overflow-x-auto pb-2">
                                             {product.images.map((img, i) => (
                                                 <img key={i} src={img} className="h-24 w-24 object-cover rounded-lg border cursor-pointer hover:opacity-80" onClick={() => window.open(img, '_blank')}/>
                                             ))}
                                         </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="stock" className="mt-0 space-y-6">
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-medium mb-4 flex items-center gap-2">
                                            <Settings2 className="h-4 w-4" /> Hızlı Stok Düzenle
                                        </h3>
                                        <div className="flex gap-4 items-end">
                                            <div className="space-y-2 flex-1">
                                                 <label className="text-xs font-medium text-muted-foreground">Miktar</label>
                                                 <input 
                                                    type="number" 
                                                    className="w-full h-10 px-3 rounded-md border bg-background"
                                                    placeholder="0"
                                                    value={stockInput}
                                                    onChange={(e) => setStockInput(e.target.value)}
                                                 />
                                            </div>
                                            <div className="space-y-2 flex-[2]">
                                                 <label className="text-xs font-medium text-muted-foreground">Açıklama / Sebep</label>
                                                 <input 
                                                    type="text" 
                                                    className="w-full h-10 px-3 rounded-md border bg-background"
                                                    placeholder="Örn: Yeni sevkiyat, sayım eksiği..."
                                                    value={stockReason}
                                                    onChange={(e) => setStockReason(e.target.value)}
                                                 />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleStockAction('add')}>
                                                    <Plus className="h-4 w-4 mr-1" /> Ekle
                                                </Button>
                                                <Button variant="destructive" onClick={() => handleStockAction('remove')}>
                                                    <Minus className="h-4 w-4 mr-1" /> Çıkar
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="history" className="mt-0">
                                <div className="space-y-4">
                                     {product.history && product.history.length > 0 ? (
                                        product.history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, i) => (
                                            <div key={i} className="flex gap-4 relative pb-8 last:pb-0">
                                                <div className="flex flex-col items-center">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 
                                                        ${item.type === 'Giriş' ? 'bg-green-100 text-green-600' : 
                                                          item.type === 'Satış' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {item.type === 'Giriş' ? <ArrowDownRight className="h-4 w-4" /> : 
                                                         item.type === 'Satış' ? <ArrowUpRight className="h-4 w-4" /> : <RefreshCcw className="h-4 w-4" />}
                                                    </div>
                                                    <div className="w-px h-full bg-border absolute top-8" />
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="font-medium text-sm">{item.type}</div>
                                                            <div className="text-xs text-muted-foreground">{new Date(item.date).toLocaleString('tr-TR')}</div>
                                                        </div>
                                                        <div className={`font-mono font-bold ${item.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {item.quantityChange > 0 ? '+' : ''}{item.quantityChange}
                                                        </div>
                                                    </div>
                                                    {item.notes && (
                                                        <div className="mt-2 text-sm bg-muted/40 p-2 rounded text-muted-foreground">
                                                            {item.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                     ) : (
                                         <div className="text-center py-12 text-muted-foreground">
                                             <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                             <p>Henüz işlem geçmişi yok.</p>
                                         </div>
                                     )}
                                </div>
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
