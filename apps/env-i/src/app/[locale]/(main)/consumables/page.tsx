
"use client"

import * as React from "react"
import { useDataStore } from "@/stores/data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { columns as createColumns } from "@/components/consumables/columns"
import { PlusCircle, File, Loader2 } from "lucide-react"
import { ConsumableFormSheet } from "@/components/consumables/consumable-form-sheet"
import { Consumable } from "@/lib/types"
import { useSearch } from "@/context/search-context"

export default function ConsumablesPage() {
  const { 
    consumables, 
    loadingConsumables, 
    addConsumable, 
    updateConsumable, 
    deleteConsumable,
    loadMoreConsumables,
    hasMoreConsumables,
  } = useDataStore();
  
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [selectedConsumable, setSelectedConsumable] = React.useState<Consumable | undefined>(undefined)
  const { searchQuery } = useSearch()

  const handleAddConsumable = () => {
    setSelectedConsumable(undefined)
    setIsSheetOpen(true)
  }

  const handleEditConsumable = (item: Consumable) => {
    setSelectedConsumable(item)
    setIsSheetOpen(true)
  }

  const handleDelete = (consumableId: string, consumableName: string) => {
    deleteConsumable(consumableId, consumableName)
  }
  
  const handleFormSubmit = async (data: any) => {
    const { id, ...formData } = data;
    if (id) {
      await updateConsumable(id, formData);
    } else {
      await addConsumable(formData);
    }
    setIsSheetOpen(false);
  }

  const columns = createColumns({ 
    onEdit: handleEditConsumable, 
    onDelete: (consumableId) => {
        const item = consumables?.find(c => c.id === consumableId);
        if (item) {
            handleDelete(consumableId, item.name);
        }
    },
  });
  
  const filteredConsumables = React.useMemo(() => {
    if (!consumables) return [];
    if (!searchQuery) return consumables;
    const query = searchQuery.toLowerCase();
    return consumables.filter(item => 
      item.name?.toLowerCase().includes(query) ||
      item.manufacturer?.toLowerCase().includes(query) ||
      item.barcode?.toLowerCase().includes(query) ||
      item.partNumber?.toLowerCase().includes(query)
    );
  }, [searchQuery, consumables]);

  const isSearchActive = searchQuery.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                  <CardTitle>Sarf Malzemeler</CardTitle>
                  <CardDescription>Operasyonlarınızda kullanılan sarf malzemeleri yönetin.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                      <File className="h-4 w-4 mr-2" />
                      Dışa Aktar
                  </Button>
                  <Button size="sm" onClick={handleAddConsumable}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Sarf Malzeme Ekle
                  </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
             {loadingConsumables && consumables?.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredConsumables} 
                    onLoadMore={loadMoreConsumables}
                    hasMore={hasMoreConsumables}
                    isLoading={loadingConsumables}
                    isSearchActive={isSearchActive}
                />
            )}
        </CardContent>
      </Card>
      <ConsumableFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        consumable={selectedConsumable}
        onSubmit={handleFormSubmit}
      />
    </>
  )
}
