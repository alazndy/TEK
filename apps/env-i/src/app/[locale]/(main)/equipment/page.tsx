
"use client"

import * as React from "react"
import { useDataStore } from "@/stores/data-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { columns as createColumns } from "@/components/equipment/columns"
import { PlusCircle, File, Camera, Loader2 } from "lucide-react"
import { EquipmentFormSheet } from "@/components/equipment/equipment-form-sheet"
import { Equipment } from "@/lib/types"
import { useSearch } from "@/context/search-context"

export default function EquipmentPage() {
  const { 
    equipment, 
    loadingEquipment, 
    addEquipment, 
    updateEquipment, 
    deleteEquipment,
    loadMoreEquipment,
    hasMoreEquipment,
  } = useDataStore();
  
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [selectedEquipment, setSelectedEquipment] = React.useState<Equipment | undefined>(undefined)
  const { searchQuery } = useSearch()

  const handleAddEquipment = () => {
    setSelectedEquipment(undefined)
    setIsSheetOpen(true)
  }

  const handleEditEquipment = (item: Equipment) => {
    setSelectedEquipment(item)
    setIsSheetOpen(true)
  }

  const handleDelete = (equipmentId: string, equipmentName: string) => {
    deleteEquipment(equipmentId, equipmentName)
  }
  
  const handleFormSubmit = async (data: any) => {
    const { id, ...formData } = data;
    if (id) {
      await updateEquipment(id, formData);
    } else {
      await addEquipment(formData);
    }
    setIsSheetOpen(false);
  }

  const columns = createColumns({ 
    onEdit: handleEditEquipment, 
    onDelete: (equipmentId) => {
        const item = equipment?.find(e => e.id === equipmentId);
        if (item) {
            handleDelete(equipmentId, item.name);
        }
    },
  });
  
  const filteredEquipment = React.useMemo(() => {
    if (!equipment) return [];
    if (!searchQuery) return equipment;
    const query = searchQuery.toLowerCase();
    return equipment.filter(item => 
      item.name?.toLowerCase().includes(query) ||
      item.manufacturer?.toLowerCase().includes(query) ||
      item.barcode?.toLowerCase().includes(query) ||
      item.modelNumber?.toLowerCase().includes(query) ||
      item.partNumber?.toLowerCase().includes(query)
    );
  }, [searchQuery, equipment]);
  
  const isSearchActive = searchQuery.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                  <CardTitle>Demirbaşlar</CardTitle>
                  <CardDescription>İşletmenizdeki demirbaş ve ekipmanlarınızı yönetin.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                      <File className="h-4 w-4 mr-2" />
                      Dışa Aktar
                  </Button>
                  <Button size="sm" onClick={handleAddEquipment}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Ekipman Ekle
                  </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
            {loadingEquipment && equipment?.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredEquipment} 
                    onLoadMore={loadMoreEquipment}
                    hasMore={hasMoreEquipment}
                    isLoading={loadingEquipment}
                    isSearchActive={isSearchActive}
                />
            )}
        </CardContent>
      </Card>
      <EquipmentFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        equipment={selectedEquipment}
        onSubmit={handleFormSubmit}
      />
    </>
  )
}
