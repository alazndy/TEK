"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Product } from "@/lib/types"
import { Printer, Download } from "lucide-react"
import QRCode from "qrcode"
import jsPDF from "jspdf"
import { useCurrencyStore, currencySymbols } from "@/stores/currency-store"

interface BarcodeLabelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | undefined
}

export function BarcodeLabelDialog({
  open,
  onOpenChange,
  product
}: BarcodeLabelDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("")
  const { formatPrice, convertPrice, rates, selectedCurrency } = useCurrencyStore();

  React.useEffect(() => {
    if (product && open) {
      // Generate QR code including ID and basic info
      const qrData = JSON.stringify({
        id: product.id,
        n: product.name,
        m: product.modelNumber || "",
        p: product.price || 0,
        c: product.priceCurrency || 'TRY'
      })
      
      QRCode.toDataURL(qrData, { width: 256, margin: 2 }, (err: Error | null | undefined, url: string) => {
        if (!err) {
          setQrCodeUrl(url)
        }
      })
    }
  }, [product, open])

  // Get price in different currencies
  const getPriceDisplay = () => {
    if (!product?.price || !rates) return null;
    
    const sourceCurrency = product.priceCurrency || 'TRY';
    const sourcePrice = product.price;
    
    // Convert to all currencies
    const prices = {
      TRY: sourceCurrency === 'TRY' ? sourcePrice : convertPrice(sourcePrice, sourceCurrency as any),
      EUR: sourceCurrency === 'EUR' ? sourcePrice : convertPrice(sourcePrice, sourceCurrency as any),
      GBP: sourceCurrency === 'GBP' ? sourcePrice : convertPrice(sourcePrice, sourceCurrency as any),
    };
    
    // Recalculate based on target
    const tryPrice = sourceCurrency === 'TRY' ? sourcePrice : convertPrice(sourcePrice, sourceCurrency as any);
    
    return {
      source: { amount: sourcePrice, currency: sourceCurrency as 'TRY' | 'EUR' | 'GBP' },
      try: formatPrice(sourceCurrency === 'TRY' ? sourcePrice : convertPrice(sourcePrice, sourceCurrency as any), 'TRY'),
      eur: formatPrice(sourceCurrency === 'EUR' ? sourcePrice : (sourcePrice / rates[sourceCurrency as keyof typeof rates]) * rates.EUR, 'EUR'),
      gbp: formatPrice(sourceCurrency === 'GBP' ? sourcePrice : (sourcePrice / rates[sourceCurrency as keyof typeof rates]) * rates.GBP, 'GBP'),
    };
  };

  const priceInfo = getPriceDisplay();

  const handlePrint = () => {
    if (!product || !qrCodeUrl) return

    // Create a PDF with label dimensions (e.g., 60mm x 40mm for more space)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [60, 40] 
    })

    // Add Content
    doc.setFontSize(9)
    doc.text(product.name.substring(0, 30), 2, 5)
    
    doc.setFontSize(6)
    doc.text(product.manufacturer || "Unknown", 2, 9)
    doc.text(product.modelNumber || "No Model", 2, 13)
    
    // Add price if exists
    if (priceInfo) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(priceInfo.try, 2, 18)
      doc.setFontSize(5)
      doc.setFont('helvetica', 'normal')
      doc.text(`(${priceInfo.gbp} / ${priceInfo.eur})`, 2, 22)
    }
    
    doc.addImage(qrCodeUrl, "PNG", 38, 2, 20, 20)
    
    doc.setFontSize(4)
    doc.text(product.id.substring(0, 20), 2, 35)
    
    // Auto print
    doc.autoPrint()
    window.open(doc.output("bloburl"))
  }

  const handleDownload = () => {
    if (!product || !qrCodeUrl) return

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [60, 40] 
    })

    doc.setFontSize(9)
    doc.text(product.name.substring(0, 30), 2, 5)
    
    doc.setFontSize(6)
    doc.text(product.manufacturer || "Unknown", 2, 9)
    doc.text(product.modelNumber || "No Model", 2, 13)
    
    if (priceInfo) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(priceInfo.try, 2, 18)
      doc.setFontSize(5)
      doc.setFont('helvetica', 'normal')
      doc.text(`(${priceInfo.gbp} / ${priceInfo.eur})`, 2, 22)
    }
    
    doc.addImage(qrCodeUrl, "PNG", 38, 2, 20, 20)
    
    doc.setFontSize(4)
    doc.text(product.id, 2, 35)
    
    doc.save(`${product.name}-label.pdf`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ürün Etiketi Yazdır</DialogTitle>
          <DialogDescription>
            Depo rafları veya ürün üzerine yapıştırmak için etiket oluşturun.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-white">
             {/* Label Preview */}
            <div className="w-[360px] h-[240px] border-2 border-dashed border-gray-300 relative bg-white shadow-sm p-4 flex flex-row items-start justify-between">
                <div className="flex flex-col gap-1 items-start w-[60%]">
                    <span className="font-bold text-lg leading-tight text-black line-clamp-2">{product?.name}</span>
                    <span className="text-sm text-gray-600">{product?.manufacturer}</span>
                    <span className="text-xs text-mono bg-gray-100 px-1 rounded">{product?.modelNumber}</span>
                    
                    {priceInfo && (
                      <div className="mt-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-black">{priceInfo.try}</span>
                          {priceInfo.source.currency !== 'TRY' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                              {currencySymbols[priceInfo.source.currency]}{priceInfo.source.amount.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {priceInfo.gbp} • {priceInfo.eur}
                        </div>
                      </div>
                    )}
                    
                    <span className="text-[10px] text-gray-400 mt-auto font-mono">{product?.id}</span>
                </div>
                <div className="w-[35%] flex justify-center">
                    {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-[100px] h-[100px]" />}
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Önizleme (60mm x 40mm)</p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          <Button variant="secondary" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            İndir (PDF)
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Yazdır
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
