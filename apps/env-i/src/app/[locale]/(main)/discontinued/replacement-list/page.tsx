
"use client"

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ListChecks } from "lucide-react";
import { replacementList } from "@/lib/replacement-data";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ReplacementListPage() {

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'YES':
        return <Badge variant="default" className="bg-green-600">EVET</Badge>;
      case 'NO':
        return <Badge variant="destructive">HAYIR</Badge>;
      case 'TBC':
        return <Badge variant="secondary">TBC</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ListChecks className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Üretilmeyen Ürün Değişim Listesi</CardTitle>
              <CardDescription>
                Üretimden kalkan ürünler ve yerlerine kullanılabilecek alternatiflerin referans listesi.
              </CardDescription>
            </div>
          </div>
          <Link href="/discontinued" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[70vh] w-full">
            <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                    <TableHead>Ürün Kodu</TableHead>
                    <TableHead>Model No</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Mevcut Stok</TableHead>
                    <TableHead>Yeni Ürün</TableHead>
                    <TableHead>Değişim?</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {replacementList.map((item, index) => (
                    <TableRow key={index}>
                    <TableCell className="font-medium">{item.productCode}</TableCell>
                    <TableCell>{item.modelNo}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.currentStock}</TableCell>
                    <TableCell>{item.replacement}</TableCell>
                    <TableCell>{getStatusBadge(item.replacementAvailable)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
