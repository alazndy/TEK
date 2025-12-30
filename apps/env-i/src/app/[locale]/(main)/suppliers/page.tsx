"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search, Filter, Star, MoreHorizontal, Pencil, Trash2, Phone, Mail, Globe } from "lucide-react";
import { useSupplierStore } from "@/stores/supplier-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SupplierForm } from "@/components/suppliers/supplier-form";
import { PageWrapper } from "@/components/layout/page-wrapper";
import type { Supplier } from "@/lib/types";

export default function SuppliersPage() {
  const t = useTranslations();
  const { suppliers, loading, fetchSuppliers, deleteSupplier } = useSupplierStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (supplierToDelete) {
      await deleteSupplier(supplierToDelete.id);
      setDeleteConfirmOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <PageWrapper
      title="Tedarikçiler"
      description="Tedarikçileri yönetin ve ürün-tedarikçi ilişkilerini takip edin"
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tedarikçi ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tedarikçi Ekle
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kod</TableHead>
                <TableHead>Tedarikçi Adı</TableHead>
                <TableHead>İletişim</TableHead>
                <TableHead>Ödeme Koşulları</TableHead>
                <TableHead>Değerlendirme</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Aramanızla eşleşen tedarikçi bulunamadı" : "Henüz tedarikçi eklenmemiş"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-mono text-sm">{supplier.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{supplier.name}</div>
                      {supplier.city && (
                        <div className="text-xs text-muted-foreground">{supplier.city}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.contactPerson && (
                          <div className="text-sm">{supplier.contactPerson}</div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {supplier.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {supplier.phone}
                            </span>
                          )}
                          {supplier.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{supplier.paymentTerms || "-"}</TableCell>
                    <TableCell>{renderRating(supplier.rating)}</TableCell>
                    <TableCell>
                      <Badge variant={supplier.isActive ? "default" : "secondary"}>
                        {supplier.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          {supplier.website && (
                            <DropdownMenuItem onClick={() => window.open(supplier.website, "_blank")}>
                              <Globe className="h-4 w-4 mr-2" />
                              Web Sitesi
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSupplierToDelete(supplier);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
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
      </div>

      {/* Supplier Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}
            </DialogTitle>
            <DialogDescription>
              Tedarikçi bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <SupplierForm
            supplier={editingSupplier}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tedarikçiyi Sil</DialogTitle>
            <DialogDescription>
              <strong>{supplierToDelete?.name}</strong> tedarikçisini silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
