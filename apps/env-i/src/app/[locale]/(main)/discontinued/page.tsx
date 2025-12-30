
"use client"

import React from "react";
import Link from "next/link";
import { useDataStore } from "@/stores/data-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { columns as columnsFn } from "@/components/inventory/columns"
import { Archive, Loader2, List } from "lucide-react"
import { useSearch } from "@/context/search-context";
import { Button } from "@/components/ui/button";

export default function DiscontinuedPage() {
  const { products, loadingProducts, fetchProducts } = useDataStore();
  const { searchQuery } = useSearch();
  const columns = columnsFn({});

  React.useEffect(() => {
    if (products.length === 0) {
      fetchProducts(true);
    }
  }, [fetchProducts, products.length]);
  
  const discontinuedProducts = React.useMemo(() => 
    products.filter(p => p.isDiscontinued),
    [products]
  );

  const filteredProducts = React.useMemo(() => {
    if (!searchQuery) return discontinuedProducts;
    const query = searchQuery.toLowerCase();
    return discontinuedProducts.filter(item => 
      item.name?.toLowerCase().includes(query) ||
      item.manufacturer?.toLowerCase().includes(query) ||
      item.barcode?.toLowerCase().includes(query)
    );
  }, [searchQuery, discontinuedProducts]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Archive className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle>Üretilmeyen Ürünler</CardTitle>
                    <CardDescription>Artık üretilmeyen ve stoklarınızda bulunan ürünler.</CardDescription>
                </div>
            </div>
             <Link href="/discontinued/replacement-list" passHref>
                <Button variant="outline">
                    <List className="mr-2 h-4 w-4" />
                    Değişim Listesini Görüntüle
                </Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loadingProducts && products.length === 0 ? (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <DataTable 
                columns={columns} 
                data={filteredProducts}
            />
        )}
      </CardContent>
    </Card>
  )
}
