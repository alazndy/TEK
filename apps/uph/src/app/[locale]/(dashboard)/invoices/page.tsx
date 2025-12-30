"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FileText, MoreHorizontal, Eye, Send, Check, Ban, DollarSign, Printer } from "lucide-react";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Invoice, InvoiceStatus } from "@/types/invoice";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Taslak",
  sent: "Gönderildi",
  viewed: "Görüntülendi",
  paid: "Ödendi",
  overdue: "Gecikmiş",
  cancelled: "İptal",
  refunded: "İade",
};

const STATUS_COLORS: Record<InvoiceStatus, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  sent: "outline",
  viewed: "outline",
  paid: "default",
  overdue: "destructive",
  cancelled: "destructive",
  refunded: "secondary",
};

export default function InvoicesPage() {
  const { user } = useAuthStore();
  const { 
    invoices, 
    settings,
    loading, 
    fetchInvoices, 
    fetchSettings,
    updateStatus,
    markAsPaid,
    sendReminder,
    getOverdueInvoices,
    getMonthlyRevenue,
  } = useInvoiceStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchInvoices(user.uid);
      fetchSettings(user.uid);
    }
  }, [user?.uid, fetchInvoices, fetchSettings]);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const overdueCount = getOverdueInvoices().length;
  const monthlyRevenue = getMonthlyRevenue();
  const pendingTotal = invoices
    .filter(i => i.status === "sent" || i.status === "viewed")
    .reduce((sum, i) => sum + i.total, 0);

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    const symbols: Record<string, string> = { TRY: "₺", EUR: "€", USD: "$", GBP: "£" };
    return `${symbols[currency] || currency} ${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Faturalar</h1>
          <p className="text-muted-foreground">Faturalarınızı oluşturun ve takip edin</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Fatura
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bu Ay Gelir</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {formatCurrency(monthlyRevenue)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bekleyen</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">
              {formatCurrency(pendingTotal)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Fatura</CardDescription>
            <CardTitle className="text-2xl">{invoices.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gecikmiş</CardDescription>
            <CardTitle className="text-2xl text-red-600">{overdueCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Fatura veya müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="draft">Taslak</SelectItem>
            <SelectItem value="sent">Gönderildi</SelectItem>
            <SelectItem value="paid">Ödendi</SelectItem>
            <SelectItem value="overdue">Gecikmiş</SelectItem>
            <SelectItem value="cancelled">İptal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fatura No</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Proje</TableHead>
              <TableHead>Düzenleme</TableHead>
              <TableHead>Vade</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
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
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Fatura bulunamadı</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.projectName || "-"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.issueDate), "d MMM yyyy", { locale: tr })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.dueDate), "d MMM yyyy", { locale: tr })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[invoice.status]}>
                      {STATUS_LABELS[invoice.status]}
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="h-4 w-4 mr-2" />
                          PDF Oluştur
                        </DropdownMenuItem>
                        {invoice.status === "draft" && (
                          <DropdownMenuItem onClick={() => updateStatus(invoice.id, "sent")}>
                            <Send className="h-4 w-4 mr-2" />
                            Gönder
                          </DropdownMenuItem>
                        )}
                        {(invoice.status === "sent" || invoice.status === "viewed" || invoice.status === "overdue") && (
                          <>
                            <DropdownMenuItem onClick={() => markAsPaid(invoice.id, "bank_transfer")}>
                              <Check className="h-4 w-4 mr-2" />
                              Ödendi İşaretle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sendReminder(invoice.id)}>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Hatırlatma Gönder
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => updateStatus(invoice.id, "cancelled")}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            İptal Et
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
      </Card>

      {/* New Invoice Dialog - Placeholder */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Yeni Fatura</DialogTitle>
            <DialogDescription>
              Fatura detaylarını girin
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            Fatura formu burada olacak...
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
