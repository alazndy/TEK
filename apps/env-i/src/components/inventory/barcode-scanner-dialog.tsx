
"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BarcodeScanner } from "@/components/barcode-scanner"

interface BarcodeScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onBarcodeScanned: (barcode: string) => void
}

export function BarcodeScannerDialog({ open, onOpenChange, onBarcodeScanned }: BarcodeScannerDialogProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Barkod Okuyucu</DialogTitle>
          <DialogDescription>
            Ürün barkodunu kamera önüne getirerek okutun.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 rounded-md">
             {/* The BarcodeScanner component is only rendered when the dialog is open, so its effects will run on open and cleanup on close. */}
            {open && <BarcodeScanner onBarcodeScanned={onBarcodeScanned} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
