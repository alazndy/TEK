"use client"

import React, { useEffect, useState } from 'react';
import { X, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateDefectReportPDFBlob, generateDefectReportPDF } from '@/lib/pdf-generator';
import type { DefectReport } from '@/lib/types';

interface PDFPreviewModalProps {
  defect: DefectReport;
  isOpen: boolean;
  onClose: () => void;
}

export function PDFPreviewModal({ defect, isOpen, onClose }: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && defect) {
      setLoading(true);
      try {
        const blob = generateDefectReportPDFBlob(defect);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error generating PDF preview:', error);
      } finally {
        setLoading(false);
      }
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, defect]);

  if (!isOpen) return null;

  const handleDownload = () => {
    generateDefectReportPDF(defect);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-card border border-border rounded-xl shadow-2xl flex flex-col transition-all duration-300 ${
          isFullscreen 
            ? 'w-screen h-screen m-0 rounded-none' 
            : 'w-[90vw] max-w-5xl h-[85vh] m-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              PDF Önizleme
            </h2>
            <span className="text-sm text-muted-foreground font-mono">
              {defect.formNumber || 'Arıza Raporu'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-emerald-600 text-emerald-500 hover:bg-emerald-600/10"
            >
              <Download className="h-4 w-4 mr-1" />
              İndir
            </Button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              title={isFullscreen ? 'Küçült' : 'Tam Ekran'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-muted/10">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">PDF oluşturuluyor...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">PDF yüklenemedi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
