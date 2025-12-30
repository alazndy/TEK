
"use client"

import React, { useRef, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
}

export function BarcodeScanner({ onBarcodeScanned }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const codeReaderRef = useRef(new BrowserMultiFormatReader());
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const codeReader = codeReaderRef.current;

    const startScanning = async () => {
      try {
        if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
           throw new Error('getUserMedia not supported');
        }
        
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        const videoElement = videoRef.current;
        if (videoElement) {
          videoElement.srcObject = stream;
          
          // Wait for video metadata to load to get correct dimensions
          videoElement.onloadedmetadata = () => {
            if (isScanning) {
                codeReader.decodeFromVideoElement(videoElement, (result, error) => {
                  if (result && isScanning) {
                    setIsScanning(false);
                    onBarcodeScanned(result.getText());
                    toast({
                        title: "Barkod Bulundu!",
                        description: `Değer: ${result.getText()}`
                    });
                  }
                  if (error && !(error.name === 'NotFoundException')) {
                     // console.error('Barcode detection failed:', error);
                  }
                }).catch(err => {
                    if (err && err.name !== 'NotFoundException') {
                        console.error('Decode error:', err);
                    }
                });
            }
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Kamera İzni Reddedildi',
          description: 'Lütfen bu özelliği kullanmak için tarayıcı ayarlarınızdan kamera izinlerini etkinleştirin.',
        });
      }
    };

    startScanning();

    return () => {
      // Stop the scanner and the video stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // No need to call reset or stop on the codeReader instance as per latest usage patterns
    };
  }, [onBarcodeScanned, toast, isScanning]);

  return (
    <div className="relative w-full">
        {hasCameraPermission === null && (
             <div className="flex items-center justify-center h-48 bg-secondary rounded-md">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Kamera başlatılıyor...</p>
            </div>
        )}

      <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay playsInline muted />
      
      {hasCameraPermission === false && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Kamera Erişimi Gerekli</AlertTitle>
          <AlertDescription>
            Lütfen barkod okutmak için kamera erişimine izin verin.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
