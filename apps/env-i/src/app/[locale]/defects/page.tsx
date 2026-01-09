"use client"

import React, { useEffect, useState } from 'react';
import { useDefectStore } from '@/stores/defect-store';
import { DefectForm } from '@/components/forms/defect-form';
import { PDFPreviewModal } from '@/components/pdf-preview-modal';
import { generateDefectReportPDF } from '@/lib/pdf-generator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  MoreHorizontal, 
  Pencil,
  Package,
  Eye,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { DefectReport } from '@/lib/types';

export default function DefectsPage() {
  const { defects, fetchDefects, subscribeToDefects, loading } = useDefectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<DefectReport | undefined>(undefined);
  const [previewDefect, setPreviewDefect] = useState<DefectReport | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchDefects();
    
    // Real-time subscription
    const unsubscribe = subscribeToDefects();
    return () => unsubscribe();
  }, []);

  const filteredDefects = defects.filter(defect => {
    const searchLower = searchTerm.toLowerCase();
    
    // Arama: Form numarası, müşteri adı, inspector adı
    const matchesFormNumber = defect.formNumber?.toLowerCase().includes(searchLower);
    const matchesCustomer = defect.customerName?.toLowerCase().includes(searchLower);
    const matchesInspector = defect.inspectorName?.toLowerCase().includes(searchLower);
    
    // Arama: Ürünlerin içinde (model, seri no)
    const matchesProducts = defect.inspectedProducts?.some(product => 
      product.model?.toLowerCase().includes(searchLower) ||
      product.serialNumber?.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower)
    );
    
    return matchesFormNumber || matchesCustomer || matchesInspector || matchesProducts;
  });

  const handleEdit = (defect: DefectReport) => {
    setEditingDefect(defect);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingDefect(undefined);
    setIsDialogOpen(true);
  };

  const handleExportPDF = (defect: DefectReport) => {
    generateDefectReportPDF(defect);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="default" className="bg-blue-500">Yeni</Badge>;
      case 'investigating': return <Badge variant="secondary" className="bg-orange-500 text-white">İnceleniyor</Badge>;
      case 'resolved': return <Badge variant="default" className="bg-emerald-600">Çözüldü</Badge>;
      case 'discarded': return <Badge variant="outline">İptal</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  // İlk ürünü ve toplam sayıyı göster
  const renderProducts = (defect: DefectReport) => {
    const products = defect.inspectedProducts || [];
    if (products.length === 0) {
      return <span className="text-zinc-500">-</span>;
    }
    
    const firstProduct = products[0];
    const hasMore = products.length > 1;
    
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-zinc-200 font-medium">
            {firstProduct.brand} {firstProduct.model}
          </span>
          {hasMore && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              +{products.length - 1}
            </Badge>
          )}
        </div>
        <span className="text-xs text-zinc-500">{firstProduct.serialNumber}</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Arıza Tespit Formu
          </h1>
          <p className="text-zinc-400 mt-1">
            Arızalı cihaz girişleri, teknik servis takibi ve raporlama.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kayıt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800">
            <DialogHeader>
              <DialogTitle>
                {editingDefect ? 'Arıza Kaydını Düzenle' : 'Yeni Arıza Kaydı Oluştur'}
              </DialogTitle>
            </DialogHeader>
            <DefectForm 
              initialData={editingDefect} 
              onSuccess={() => setIsDialogOpen(false)}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Ara: Form No, Müşteri, Model, Seri No..."
            className="pl-9 bg-zinc-950/50 border-zinc-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-white/5 rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>Tarih</TableHead>
              <TableHead>Form No</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Ürünler</TableHead>
              <TableHead>İnspektör</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-zinc-400">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : filteredDefects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                  Kayıt bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              filteredDefects.map((defect) => (
                <TableRow key={defect.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-zinc-300">
                    {format(defect.createdAt, 'dd MMM yyyy', { locale: tr })}
                  </TableCell>
                  <TableCell className="text-emerald-400 font-mono">
                    {defect.formNumber || '-'}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {defect.customerName}
                  </TableCell>
                  <TableCell>
                    {renderProducts(defect)}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {defect.inspectorName || '-'}
                  </TableCell>
                  <TableCell>
                    {statusBadge(defect.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800">
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(defect)} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />
                          Düzenle / Detay
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem onClick={() => setPreviewDefect(defect)} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          PDF Önizle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportPDF(defect)} className="cursor-pointer">
                          <Download className="mr-2 h-4 w-4" />
                          PDF İndir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PDF Preview Modal */}
      {previewDefect && (
        <PDFPreviewModal
          defect={previewDefect}
          isOpen={!!previewDefect}
          onClose={() => setPreviewDefect(null)}
        />
      )}
    </div>
  );
}
