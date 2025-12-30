
"use client"

import React from "react";
import { useDataStore } from "@/stores/data-store";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/orders/columns"
import { PlusCircle, File, Loader2 } from "lucide-react"
import { useSearch } from "@/context/search-context";
import { OrderFormSheet } from "@/components/orders/order-form-sheet";
import { Order } from "@/lib/types";

export default function OrdersPage() {
  const { 
    orders, 
    loadingOrders,
    fetchOrders,
    hasMoreOrders,
    loadMoreOrders,
    addOrder,
    products,
  } = useDataStore();
  const { searchQuery } = useSearch();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  React.useEffect(() => {
    // Fetch initial data only if it hasn't been fetched yet
    if (orders.length === 0) {
      fetchOrders(true);
    }
  }, [fetchOrders, orders.length]);

  const filteredOrders = React.useMemo(() => {
    if (!searchQuery) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(item => 
      item.orderNumber?.toLowerCase().includes(query) ||
      item.customerName?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query)
    );
  }, [searchQuery, orders]);

  const isSearchActive = searchQuery.length > 0;
  
  const handleAddOrder = () => {
    setIsSheetOpen(true);
  };
  
  const handleFormSubmit = async (orderData: Omit<Order, 'id'>) => {
    await addOrder(orderData);
    setIsSheetOpen(false);
  };

  // Extract a list of unique customer names for the form dropdown
  const customerNames = React.useMemo(() => {
      const names = new Set(orders.map(o => o.customerName));
      return Array.from(names);
  }, [orders]);


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                  <CardTitle>Siparişler</CardTitle>
                  <CardDescription>Satış ve satın alma siparişlerinizi yönetin.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                   <Button size="sm" variant="outline">
                      <File className="h-4 w-4 mr-2" />
                      Dışa Aktar
                  </Button>
                  <Button size="sm" onClick={handleAddOrder}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Sipariş Oluştur
                  </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
         {loadingOrders && orders.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          ) : (
               <DataTable 
                  columns={columns} 
                  data={filteredOrders}
                  onLoadMore={loadMoreOrders}
                  hasMore={hasMoreOrders}
                  isLoading={loadingOrders}
                  isSearchActive={isSearchActive}
              />
          )}
        </CardContent>
      </Card>
      <OrderFormSheet 
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleFormSubmit}
        customerNames={customerNames}
        products={products}
      />
    </>
  )
}
