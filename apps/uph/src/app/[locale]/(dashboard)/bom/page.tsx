'use client';

import React, { useEffect, useState } from 'react';
import { useBOMStore } from '@/stores/bom-store';
import { useProjectStore } from '@/stores/project-store';
import { BOMNode, BOMItem, BOM_STATUS_COLORS, BOM_SOURCE_COLORS } from '@/types/bom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Download, 
  Upload, 
  ChevronRight, 
  ChevronDown,
  Package,
  Factory,
  ShoppingCart,
  Warehouse,
  Loader2,
  Trash2,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tree Item Component
function BOMTreeItem({ 
  node, 
  onEdit, 
  onDelete,
  onAddChild 
}: { 
  node: BOMNode; 
  onEdit: (item: BOMItem) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <div 
            className="flex items-center gap-2"
            style={{ paddingLeft: node.level * 24 }}
          >
            {hasChildren ? (
              <button 
                onClick={() => setExpanded(!expanded)}
                className="p-1 hover:bg-muted rounded"
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            <span className="font-medium">{node.productName}</span>
            {node.partNumber && (
              <Badge variant="outline" className="text-xs">
                {node.partNumber}
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center">{node.quantity} {node.unit}</TableCell>
        <TableCell>
          <Badge 
            variant="outline"
            style={{ 
              borderColor: BOM_SOURCE_COLORS[node.source],
              color: BOM_SOURCE_COLORS[node.source]
            }}
          >
            {node.source === 'make' && <Factory className="h-3 w-3 mr-1" />}
            {node.source === 'buy' && <ShoppingCart className="h-3 w-3 mr-1" />}
            {node.source === 'stock' && <Warehouse className="h-3 w-3 mr-1" />}
            {node.source === 'make' ? 'Üret' : node.source === 'buy' ? 'Satın Al' : 'Stoktan'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          {node.unitCost?.toLocaleString('tr-TR', { style: 'currency', currency: node.currency || 'TRY' })}
        </TableCell>
        <TableCell className="text-right font-medium">
          {node.totalCost?.toLocaleString('tr-TR', { style: 'currency', currency: node.currency || 'TRY' })}
        </TableCell>
        <TableCell>
          <Badge 
            variant="outline"
            style={{ 
              borderColor: BOM_STATUS_COLORS[node.status],
              color: BOM_STATUS_COLORS[node.status]
            }}
          >
            {node.status === 'draft' ? 'Taslak' : 
             node.status === 'approved' ? 'Onaylı' :
             node.status === 'ordered' ? 'Sipariş' :
             node.status === 'received' ? 'Teslim' : 'Montaj'}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onAddChild(node.id)}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(node)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(node.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      {expanded && hasChildren && node.children.map(child => (
        <BOMTreeItem 
          key={child.id} 
          node={child} 
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </>
  );
}

export default function BOMPage() {
  const { 
    items, 
    isLoading, 
    error, 
    subscribeToItems, 
    unsubscribeAll,
    addItem,
    deleteItem,
    getTreeStructure,
    getSummary 
  } = useBOMStore();
  const { projects, fetchProjects } = useProjectStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<{
    productName: string;
    quantity: number;
    unit: string;
    source: 'make' | 'buy' | 'stock';
    status: 'draft' | 'approved' | 'ordered' | 'received' | 'installed';
    unitCost: number;
    currency: string;
  }>({
    productName: '',
    quantity: 1,
    unit: 'adet',
    source: 'stock',
    status: 'draft',
    unitCost: 0,
    currency: 'TRY'
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      subscribeToItems(selectedProjectId);
    }
    return () => {
      unsubscribeAll();
    };
  }, [selectedProjectId, subscribeToItems, unsubscribeAll]);

  const tree = selectedProjectId ? getTreeStructure(selectedProjectId) : [];
  const summary = selectedProjectId ? getSummary(selectedProjectId) : null;

  const handleAddItem = async () => {
    if (!selectedProjectId || !newItem.productName) return;
    
    await addItem({
      ...newItem,
      projectId: selectedProjectId,
      parentId: parentId || undefined,
    });
    
    setIsDialogOpen(false);
    setParentId(null);
    setNewItem({
      productName: '',
      quantity: 1,
      unit: 'adet',
      source: 'stock',
      status: 'draft',
      unitCost: 0,
      currency: 'TRY'
    });
  };

  const handleAddChild = (pId: string) => {
    setParentId(pId);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: BOMItem) => {
    // TODO: Open edit dialog
    console.log('Edit:', item);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu öğeyi ve alt öğelerini silmek istediğinize emin misiniz?')) {
      await deleteItem(id);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Malzeme Listesi (BOM)</h1>
          <p className="text-muted-foreground">
            Proje malzeme ağacını yönetin ve takip edin
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Proje Seçin" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedProjectId}>
                <Plus className="h-4 w-4 mr-2" />
                Malzeme Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {parentId ? 'Alt Malzeme Ekle' : 'Yeni Malzeme Ekle'}
                </DialogTitle>
                <DialogDescription>
                  Malzeme bilgilerini girin
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Malzeme Adı</Label>
                  <Input 
                    value={newItem.productName}
                    onChange={e => setNewItem({...newItem, productName: e.target.value})}
                    placeholder="Örn: Alüminyum Soğutucu"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Miktar</Label>
                    <Input 
                      type="number"
                      value={newItem.quantity}
                      onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Birim</Label>
                    <Select value={newItem.unit} onValueChange={v => setNewItem({...newItem, unit: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adet">Adet</SelectItem>
                        <SelectItem value="metre">Metre</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                        <SelectItem value="litre">Litre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Kaynak</Label>
                    <Select value={newItem.source} onValueChange={(v: 'make' | 'buy' | 'stock') => setNewItem({...newItem, source: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock">Stoktan</SelectItem>
                        <SelectItem value="buy">Satın Al</SelectItem>
                        <SelectItem value="make">Üret</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Birim Fiyat (TRY)</Label>
                    <Input 
                      type="number"
                      value={newItem.unitCost}
                      onChange={e => setNewItem({...newItem, unitCost: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleAddItem}>
                  Ekle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            İçe Aktar
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* No project selected */}
      {!selectedProjectId && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Malzeme listesini görüntülemek için bir proje seçin</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {selectedProjectId && summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Toplam Kalem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Toplam Maliyet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.totalCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Üretilecek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{summary.makeCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Satın Alınacak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.buyCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stoktan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.stockCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tamamlanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{summary.completedCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* BOM Table */}
      {selectedProjectId && (
        <Card>
          <CardHeader>
            <CardTitle>Malzeme Ağacı</CardTitle>
            <CardDescription>
              Hiyerarşik malzeme listesi • Satıra tıklayarak alt öğe ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tree.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bu projede henüz malzeme yok</p>
                <p className="text-sm mt-2">Yeni malzeme eklemek için yukarıdaki butonu kullanın</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Malzeme</TableHead>
                    <TableHead className="text-center">Miktar</TableHead>
                    <TableHead>Kaynak</TableHead>
                    <TableHead className="text-right">Birim Fiyat</TableHead>
                    <TableHead className="text-right">Toplam</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="w-[120px]">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tree.map(node => (
                    <BOMTreeItem 
                      key={node.id} 
                      node={node}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onAddChild={handleAddChild}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
