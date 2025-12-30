'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { Product } from '@/types/inventory';
import { BOMService, BOMItem } from "@/services/bom-service";
import { useInventoryStore } from '@/stores/inventory-store';
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRightLeft, Check, AlertTriangle, Package } from 'lucide-react';

interface BOMExtractorProps {
  project: Project;
  envEnabled: boolean;
  products: Product[];
}

export function BOMExtractor({ project, envEnabled, products }: BOMExtractorProps) {
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [selectedDesignId, setSelectedDesignId] = useState<string>("");
  const [bomProcessing, setBomProcessing] = useState(false);

  const handleScanBOM = async () => {
    const design = project?.weaveDesigns?.find(d => d.id === selectedDesignId);
    if (design) {
      setBomProcessing(true);
      setTimeout(() => {
        const items = BOMService.parseWeaveDesign(design, envEnabled ? products : []);
        setBomItems(items);
        setBomProcessing(false);
      }, 500);
    }
  };

  const handleDeductStock = async () => {
    if (!project) return;
    if (!confirm(`Are you sure you want to deduct ${bomItems.length} types of items from inventory?`)) return;

    setBomProcessing(true);
    try {
      const { assignToProject } = useInventoryStore.getState();
      const user = useAuthStore.getState().user;

      for (const item of bomItems) {
        if (item.status === 'matched' && item.matchedInventoryId) {
          await assignToProject(
            item.matchedInventoryId, 
            project.id, 
            project.name, 
            item.quantity, 
            user?.displayName || 'Admin',
            'product'
          );
        }
      }
      alert("Stock deducted successfully. Activity logged.");
      setBomItems([]);
    } catch (e) {
      console.error(e);
      alert("Failed to deduct stock. Check console.");
    } finally {
      setBomProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Otomatik BOM Çıkarıcı</CardTitle>
        <CardDescription>
          Weave tasarımlarından malzeme listesi çıkarın ve stoktan düşürün.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-end gap-4 border-b pb-6">
          <div className="grid gap-2 flex-1">
            <Label>Tasarım Seçin</Label>
            <Select value={selectedDesignId} onValueChange={setSelectedDesignId}>
              <SelectTrigger>
                <SelectValue placeholder="Weave Dosyası Seçin..." />
              </SelectTrigger>
              <SelectContent>
                {project.weaveDesigns?.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name} (v1.0)</SelectItem>
                ))}
                {(!project.weaveDesigns || project.weaveDesigns.length === 0) && (
                  <SelectItem value="none" disabled>Tasarım dosyası yok</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleScanBOM} disabled={!selectedDesignId || bomProcessing}>
            {bomProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
            Tara & Eşleştir
          </Button>
        </div>

        {bomItems.length > 0 && (
          <div className="rounded-md border animate-fade-in-up">
            <div className="p-4 bg-muted/50 border-b flex justify-between items-center">
              <span className="font-semibold text-sm">
                Bulunan: {bomItems.length} parça ({bomItems.filter(i => i.status === 'matched').length} eşleşti)
              </span>
              <Button size="sm" onClick={handleDeductStock} disabled={bomProcessing}>
                Stoktan Düş
              </Button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="text-left bg-muted/20 sticky top-0 backdrop-blur-sm">
                  <tr>
                    <th className="p-3 font-medium">Durum</th>
                    <th className="p-3 font-medium">Parça Adı</th>
                    <th className="p-3 font-medium text-right">Adet</th>
                    <th className="p-3 font-medium">Eşleşen Stok</th>
                  </tr>
                </thead>
                <tbody>
                  {bomItems.map((item, i) => (
                    <tr key={i} className="border-t hover:bg-muted/10 transition-colors">
                      <td className="p-3">
                        {item.status === 'matched' ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            <Check className="w-3 h-3 mr-1" /> Hazır
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Bilinmiyor
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-muted-foreground">
                        {item.matchedInventoryId ? (
                          <span className="flex items-center gap-2">
                            <Package className="w-3 h-3" />
                            {products.find(p => p.id === item.matchedInventoryId)?.name}
                          </span>
                        ) : (
                          "Eşleşme yok"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
