"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FileText, MoreHorizontal, Eye, Pencil, Trash2, Package, Check } from "lucide-react";
import { usePurchaseStore } from "@/stores/purchase-store";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PurchaseOrderForm } from "@/components/purchases/purchase-order-form";
import { ReceiveItemsDialog } from "@/components/purchases/receive-items-dialog";
import { PageWrapper } from "@/components/layout/page-wrapper";
import type { PurchaseOrder, POStatus } from "@/lib/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const STATUS_LABELS: Record<POStatus, string> = {
  draft: "Taslak",
  sent: "Gönderildi",
  confirmed: "Onaylandı",
  partially_received: "Kısmi Teslim",
  received: "Teslim Alındı",
  cancelled: "İptal",
};

const STATUS_COLORS: Record<POStatus, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "outline",
  confirmed: "default",
  partially_received: "outline",
  received: "default",
  cancelled: "destructive",
};

export default function PurchasesPage() {
  const { purchaseOrders, loading, fetchPurchaseOrders, deletePurchaseOrder, updatePOStatus } = usePurchaseStore();
  const { suppliers, fetchSuppliers } = useSupplierStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<POStatus | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [poToDelete, setPOToDelete] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
  }, [fetchPurchaseOrders, fetchSuppliers]);

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (po: PurchaseOrder) => {
    setEditingPO(po);
    setIsFormOpen(true);
  };

  const handleReceive = (po: PurchaseOrder) => {
    setReceivingPO(po);
    setReceiveDialogOpen(true);
  };

  const handleDelete = async () => {
    if (poToDelete) {
      await deletePurchaseOrder(poToDelete.id);
      setDeleteConfirmOpen(false);
      setPOToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPO(null);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { TRY: "₺", EUR: "€", USD: "$", GBP: "£" };
    return `${symbols[currency] || currency} ${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
  };

  return (
    <PageWrapper
      title="Satın Alma Siparişleri"
      description="Satın alma siparişlerini oluşturun ve takip edin"
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sipariş veya tedarikçi ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as POStatus | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="sent">Gönderildi</SelectItem>
                <SelectItem value="confirmed">Onaylandı</SelectItem>
                <SelectItem value="partially_received">Kısmi Teslim</SelectItem>
                <SelectItem value="received">Teslim Alındı</SelectItem>
                <SelectItem value="cancelled">İptal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Sipariş
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sipariş No</TableHead>
                <TableHead>Tedarikçi</TableHead>
                <TableHead>Depo</TableHead>
                <TableHead>Kalemler</TableHead>
                <TableHead>Toplam</TableHead>
                <TableHead>Beklenen Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : filteredPOs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "Aramanızla eşleşen sipariş bulunamadı" 
                      : "Henüz sipariş oluşturulmamış"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPOs.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {po.poNumber}
                    </TableCell>
                    <TableCell>{po.supplierName || "-"}</TableCell>
                    <TableCell>{po.warehouseName || "-"}</TableCell>
                    <TableCell>{po.items.length} kalem</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(po.total, po.currency)}
                    </TableCell>
                    <TableCell>
                      {po.expectedDate 
                        ? format(new Date(po.expectedDate), "d MMM yyyy", { locale: tr })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[po.status]}>
                        {STATUS_LABELS[po.status]}
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
                          <DropdownMenuItem onClick={() => handleEdit(po)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Görüntüle
                          </DropdownMenuItem>
                          {po.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleEdit(po)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                          )}
                          {(po.status === "confirmed" || po.status === "partially_received") && (
                            <DropdownMenuItem onClick={() => handleReceive(po)}>
                              <Package className="h-4 w-4 mr-2" />
                              Teslim Al
                            </DropdownMenuItem>
                          )}
                          {po.status === "draft" && (
                            <DropdownMenuItem onClick={() => updatePOStatus(po.id, "sent")}>
                              <FileText className="h-4 w-4 mr-2" />
                              Gönder
                            </DropdownMenuItem>
                          )}
                          {po.status === "sent" && (
                            <DropdownMenuItem onClick={() => updatePOStatus(po.id, "confirmed", "admin")}>
                              <Check className="h-4 w-4 mr-2" />
                              Onayla
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {po.status !== "received" && po.status !== "cancelled" && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setPOToDelete(po);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          )}
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

      {/* PO Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPO ? `Sipariş: ${editingPO.poNumber}` : "Yeni Satın Alma Siparişi"}
            </DialogTitle>
            <DialogDescription>
              Sipariş detaylarını girin
            </DialogDescription>
          </DialogHeader>
          <PurchaseOrderForm
            purchaseOrder={editingPO}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Receive Items Dialog */}
      {receivingPO && (
        <ReceiveItemsDialog
          open={receiveDialogOpen}
          onOpenChange={setReceiveDialogOpen}
          purchaseOrder={receivingPO}
          onSuccess={() => {
            setReceiveDialogOpen(false);
            setReceivingPO(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Siparişi Sil</DialogTitle>
            <DialogDescription>
              <strong>{poToDelete?.poNumber}</strong> siparişini silmek istediğinize emin misiniz?
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
