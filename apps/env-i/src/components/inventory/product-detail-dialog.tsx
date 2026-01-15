
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Product, StockMovement } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, Copy, Check, ExternalLink } from "lucide-react"
import { useCurrencyStore, currencySymbols, currencyNames } from "@/stores/currency-store"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"

interface ProductDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => {
    if (!value && typeof value !== 'number') return null;
    return (
      <div className="grid grid-cols-2 items-start">
        <div className="font-medium text-muted-foreground">{label}</div>
        <div>{value}</div>
      </div>
    )
}

const DetailSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-3">
        <h4 className="font-medium text-lg">{title}</h4>
        <div className="space-y-3 rounded-md border p-4">
         {children}
        </div>
    </div>
)

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({ title: "Kopyalandı", description: "Dosya yolu panoya kopyalandı." });
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground" 
            onClick={handleCopy}
            title="Dosya yolunu kopyala"
        >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </Button>
    )
}

export function ProductDetailDialog({ open, onOpenChange, product }: ProductDetailDialogProps) {
  const { rates, formatPrice, convertPrice } = useCurrencyStore();
  
  if (!product) return null

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("tr-TR")
  
  const getMovementBadge = (type: StockMovement["type"]) => {
      switch(type) {
          case 'Giriş': return <Badge variant="default" className="bg-green-600">Giriş</Badge>
          case 'Satış': return <Badge variant="destructive">Satış</Badge>
          case 'İade': return <Badge variant="secondary">İade</Badge>
          case 'Sayım Düzeltme': return <Badge variant="outline">Sayım</Badge>
          default: return <Badge>{type}</Badge>
      }
  }
  
  const getCategoryBadge = (category: string) => {
      let variant: "default" | "secondary" | "outline" = "secondary";
      if (category === "Demirbaş") variant = "default";
      if (category === "Sarf Malzeme") variant = "outline";
      return <Badge variant={variant}>{category}</Badge>
  }

  // Get price conversions
  const getPriceConversions = () => {
    if (!product.price || !rates) return null;
    
    const sourceCurrency = product.priceCurrency || 'TRY';
    const sourcePrice = product.price;
    
    const conversions = (['TRY', 'EUR', 'GBP'] as const).map(currency => {
      const converted = sourceCurrency === currency 
        ? sourcePrice 
        : (sourcePrice / rates[sourceCurrency]) * rates[currency];
      return {
        currency,
        symbol: currencySymbols[currency],
        name: currencyNames[currency],
        value: converted,
        isSource: sourceCurrency === currency
      };
    });
    
    return conversions;
  };

  const priceConversions = getPriceConversions();


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{product.name}</DialogTitle>
            {product.isFaulty && (
                <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Arızalı
                </Badge>
            )}
          </div>
          <DialogDescription>
            {product.manufacturer} • {product.barcode}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Ürün Detayları</TabsTrigger>
            <TabsTrigger value="history">Stok Geçmişi</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="py-4">
            <ScrollArea className="h-[50vh]">
                <div className="space-y-6 pr-6">
                    {product.description && (
                         <div className="space-y-2">
                            <h4 className="font-medium text-lg">Açıklama</h4>
                            <p className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-md">
                                {product.description}
                            </p>
                        </div>
                    )}
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                        <DetailSection title="Genel Bilgiler">
                             {/* Gallery Preview */}
                             {product.images && product.images.length > 0 && (
                                <div className="mb-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        {product.images.map((img, i) => (
                                            <div key={i} className="aspect-square rounded-md overflow-hidden border bg-muted">
                                                <img src={img} alt={`Product ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => window.open(img, '_blank')} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <DetailItem label="Durum" value={product.isFaulty ? <Badge variant="destructive">Arızalı</Badge> : <Badge variant="default" className="bg-green-600">Sağlam</Badge>} />
                            <DetailItem label="Kategori" value={getCategoryBadge(product.category)} />
                            <DetailItem label="Üretici" value={product.manufacturer} />
                            <DetailItem label="Model Numarası" value={product.modelNumber || "-"} />
                            <DetailItem label="Parça Numarası" value={product.partNumber || "-"} />
                            <DetailItem label="Barkod" value={product.barcode} />
                        </DetailSection>
                        
                        <DetailSection title="Stok ve Fiyat">
                            <DetailItem label="Stok Adedi" value={`${product.stock} adet`} />
                            <DetailItem label="Min. Stok" value={`${product.minStock ?? '-'} adet`} />
                            
                            {/* Multi-currency price display */}
                            {priceConversions ? (
                              <div className="space-y-2">
                                <div className="font-medium text-muted-foreground">Fiyat</div>
                                <div className="grid grid-cols-3 gap-2">
                                  {priceConversions.map(({ currency, symbol, name, value, isSource }) => (
                                    <div 
                                      key={currency}
                                      className={`text-center p-2 rounded ${isSource ? 'bg-primary/20 ring-1 ring-primary' : 'bg-muted'}`}
                                    >
                                      <div className="text-xs text-muted-foreground">{name}</div>
                                      <div className={`font-medium ${isSource ? 'text-primary font-bold' : ''}`}>
                                        {symbol}{Number(value).toFixed(2)}
                                      </div>
                                      {isSource && <div className="text-[10px] text-primary">Kaynak</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <DetailItem label="Fiyat" value="-" />
                            )}
                        </DetailSection>

                        <DetailSection title="Konum">
                            <DetailItem label="Oda" value={product.room} />
                            <DetailItem label="Raf" value={product.shelf} />
                        </DetailSection>

                        <DetailSection title="Belgeler">
                             <DetailItem label="Kullanım Kılavuzu" value={product.guideUrl ? <a href={product.guideUrl} target="_blank" className="text-primary hover:underline">Görüntüle</a> : "-"} />
                             <DetailItem label="Broşür" value={product.brochureUrl ? <a href={product.brochureUrl} target="_blank" className="text-primary hover:underline">Görüntüle</a> : "-"} />
                             <DetailItem label="Weave Tasarımı" value={product.weaveFileUrl ? (
                                 <div className="flex items-center gap-2">
                                     <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 gap-1 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                                        onClick={() => window.open(product.weaveFileUrl, '_blank')}
                                     >
                                         <ExternalLink className="h-3 w-3" />
                                         Weave'de Aç
                                     </Button>
                                     <CopyButton text={product.weaveFileUrl} />
                                 </div>
                             ) : "-"} />
                        </DetailSection>
                    </div>
                </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="history" className="py-4">
            <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-secondary">
                        <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>İşlem Türü</TableHead>
                            <TableHead className="text-center">Değişim</TableHead>
                            <TableHead className="text-center">Son Stok</TableHead>
                            <TableHead>Notlar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {product.history && product.history.length > 0 ? (
                            product.history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{formatDate(item.date)}</TableCell>
                                    <TableCell>{getMovementBadge(item.type)}</TableCell>
                                    <TableCell className={`text-center font-medium ${item.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.quantityChange > 0 ? `+${item.quantityChange}` : item.quantityChange}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">{item.newStock}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.notes}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Bu ürün için stok hareketi bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
