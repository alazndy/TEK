"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ArrowLeftRight, MoreHorizontal, Eye, Truck, Package, X } from "lucide-react";
import { useTransferStore } from "@/stores/transfer-store";
import { useDataStore } from "@/stores/data-store";
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
import { TransferForm } from "@/components/transfers/transfer-form";
import { PageWrapper } from "@/components/layout/page-wrapper";
import type { StockTransfer, TransferStatus } from "@/lib/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const STATUS_LABELS: Record<TransferStatus, string> = {
  pending: "Beklemede",
  in_transit: "Yolda",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const STATUS_COLORS: Record<TransferStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  in_transit: "outline",
  completed: "default",
  cancelled: "destructive",
};

export default function TransfersPage() {
  const { transfers, loading, fetchTransfers, shipTransfer, cancelTransfer } = useTransferStore();
  const { warehouses, fetchWarehouses } = useDataStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransferStatus | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingTransfer, setViewingTransfer] = useState<StockTransfer | null>(null);

  useEffect(() => {
    fetchTransfers();
    fetchWarehouses();
  }, [fetchTransfers, fetchWarehouses]);

  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = 
      t.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fromWarehouseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.toWarehouseName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleShip = async (transfer: StockTransfer) => {
    if (confirm(`${transfer.transferNumber} transferini göndermek istediğinize emin misiniz?`)) {
      await shipTransfer(transfer.id);
    }
  };

  const handleCancel = async (transfer: StockTransfer) => {
    if (confirm(`${transfer.transferNumber} transferini iptal etmek istediğinize emin misiniz?`)) {
      await cancelTransfer(transfer.id);
    }
  };

  return (
    <PageWrapper
      title="Stok Transferleri"
      description="Depolar arası stok transferlerini yönetin"
    >
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Transfer ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TransferStatus | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="in_transit">Yolda</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="cancelled">İptal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Transfer
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer No</TableHead>
                <TableHead>Kaynak Depo</TableHead>
                <TableHead></TableHead>
                <TableHead>Hedef Depo</TableHead>
                <TableHead className="text-center">Kalemler</TableHead>
                <TableHead>Tarih</TableHead>
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
              ) : filteredTransfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Transfer bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {transfer.transferNumber}
                    </TableCell>
                    <TableCell>{transfer.fromWarehouseName}</TableCell>
                    <TableCell>
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>{transfer.toWarehouseName}</TableCell>
                    <TableCell className="text-center">{transfer.items.length}</TableCell>
                    <TableCell>
                      {format(new Date(transfer.createdAt), "d MMM yyyy", { locale: tr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[transfer.status]}>
                        {STATUS_LABELS[transfer.status]}
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
                          <DropdownMenuItem onClick={() => setViewingTransfer(transfer)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detaylar
                          </DropdownMenuItem>
                          {transfer.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleShip(transfer)}>
                              <Truck className="h-4 w-4 mr-2" />
                              Gönder
                            </DropdownMenuItem>
                          )}
                          {transfer.status === "in_transit" && (
                            <DropdownMenuItem>
                              <Package className="h-4 w-4 mr-2" />
                              Teslim Al
                            </DropdownMenuItem>
                          )}
                          {(transfer.status === "pending" || transfer.status === "in_transit") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleCancel(transfer)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                İptal Et
                              </DropdownMenuItem>
                            </>
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

      {/* Transfer Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Stok Transferi</DialogTitle>
            <DialogDescription>
              Depolar arasında stok transferi oluşturun
            </DialogDescription>
          </DialogHeader>
          <TransferForm
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Transfer Dialog */}
      {viewingTransfer && (
        <Dialog open={!!viewingTransfer} onOpenChange={() => setViewingTransfer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transfer: {viewingTransfer.transferNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Kaynak Depo</div>
                  <div className="font-medium">{viewingTransfer.fromWarehouseName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Hedef Depo</div>
                  <div className="font-medium">{viewingTransfer.toWarehouseName}</div>
                </div>
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ürün</TableHead>
                      <TableHead className="text-right">İstenen</TableHead>
                      <TableHead className="text-right">Gönderilen</TableHead>
                      <TableHead className="text-right">Teslim Alınan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingTransfer.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">{item.requestedQuantity}</TableCell>
                        <TableCell className="text-right">{item.shippedQuantity}</TableCell>
                        <TableCell className="text-right">{item.receivedQuantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {viewingTransfer.notes && (
                <div>
                  <div className="text-sm text-muted-foreground">Notlar</div>
                  <div>{viewingTransfer.notes}</div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageWrapper>
  );
}
