'use client';

import { useState } from 'react';
import { useECMStore } from '@/stores/ecm-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Rocket, 
  Layers, 
  PlusCircle, 
  Trash2,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ECOPriority, DispositionCode, RevisedItem } from '@/types/engineering';
import { toast } from 'sonner';

interface AddECODialogProps {
  projectId?: string;
  trigger?: React.ReactNode;
}

export function AddECODialog({ projectId, trigger }: AddECODialogProps) {
  const [open, setOpen] = useState(false);
  const { addECO, ecrs } = useECMStore();
  
  const [formData, setFormData] = useState({
    title: '',
    ecrId: '',
    priority: 'routine' as ECOPriority,
    responsibleDept: 'Mühendislik',
    mrpActive: true,
  });

  const [revisedItems, setRevisedItems] = useState<Partial<RevisedItem>[]>([]);

  const addRevisedItem = () => {
    setRevisedItems([...revisedItems, {
      id: Math.random().toString(36).substr(2, 9),
      itemId: '',
      itemName: '',
      currentRevision: 'A',
      newRevision: 'B',
      effectivityType: 'date',
      disposition: 'use_as_is',
      wipUpdate: true
    }]);
  };

  const removeRevisedItem = (id: string) => {
    setRevisedItems(revisedItems.filter(item => item.id !== id));
  };

  const updateRevisedItem = (id: string, updates: Partial<RevisedItem>) => {
    setRevisedItems(revisedItems.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || revisedItems.length === 0) {
      toast.error('Lütfen başlık doldurun ve en az bir revize kalem ekleyin.');
      return;
    }

    try {
      await addECO({
        ...formData,
        status: 'open',
        requestorId: 'current-user',
        revisedItems: revisedItems as RevisedItem[],
        projectId, // Optional: associates ECO with a project
      });
      
      toast.success('Değişim emri başarıyla oluşturuldu.');
      setOpen(false);
      resetForm();
    } catch {
      toast.error('Emir oluşturulurken bir hata oluştu.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      ecrId: '',
      priority: 'routine',
      responsibleDept: 'Mühendislik',
      mrpActive: true,
    });
    setRevisedItems([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg border-0 px-6">
            <Plus className="h-4 w-4 mr-2" /> Yeni Emir (ECO)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-zinc-950 border-white/10 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Mühendislik Değişim Emri (ECO)
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tasarım değişikliklerini yayına almak için resmi bir emir oluşturun.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title" className="text-sm font-semibold text-white/80">
                  Emir Başlığı
                </Label>
                <Input
                  id="title"
                  placeholder="Örn: Rev2 Soğutucu Blok Seri Üretim Geçişi"
                  className="bg-white/5 border-white/10 rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 h-11"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-white/80">İlgili ECR (Opsiyonel)</Label>
                <Select 
                  value={formData.ecrId} 
                  onValueChange={(val) => setFormData({ ...formData, ecrId: val })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                    <SelectValue placeholder="Talep Seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    {ecrs.map(ecr => (
                      <SelectItem key={ecr.id} value={ecr.id}>{ecr.identifier} - {ecr.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-white/80">Öncelik</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(val: ECOPriority) => setFormData({ ...formData, priority: val })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="routine">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Revize Edilecek Parçalar
                </Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addRevisedItem}
                  className="h-8 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> Kalem Ekle
                </Button>
              </div>

              <div className="space-y-3">
                {revisedItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <Input 
                        placeholder="Parça Adı / Kodu" 
                        className="bg-transparent border-white/10 h-9 text-sm"
                        value={item.itemName}
                        onChange={(e) => updateRevisedItem(item.id!, { itemName: e.target.value })}
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeRevisedItem(item.id!)}
                        className="h-8 w-8 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase">Eski Rev</Label>
                        <Input 
                          placeholder="A" 
                          className="bg-transparent border-white/10 h-8 text-xs"
                          value={item.currentRevision}
                          onChange={(e) => updateRevisedItem(item.id!, { currentRevision: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase">Yeni Rev</Label>
                        <Input 
                          placeholder="B" 
                          className="bg-transparent border-white/10 h-8 text-xs text-primary font-bold"
                          value={item.newRevision}
                          onChange={(e) => updateRevisedItem(item.id!, { newRevision: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase">Eylem</Label>
                        <Select 
                          value={item.disposition} 
                          onValueChange={(val: DispositionCode) => updateRevisedItem(item.id!, { disposition: val })}
                        >
                          <SelectTrigger className="bg-transparent border-white/10 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-white/10 text-white">
                            <SelectItem value="use_as_is">Olduğu gibi kullan</SelectItem>
                            <SelectItem value="scrap">Hurdaya ayır</SelectItem>
                            <SelectItem value="rework">Yeniden işle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
                
                {revisedItems.length === 0 && (
                  <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl text-muted-foreground text-sm">
                    Henüz parça eklenmedi.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 hover:bg-white/5 text-muted-foreground"
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 shadow-lg dark:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              Emri Yayınla
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
