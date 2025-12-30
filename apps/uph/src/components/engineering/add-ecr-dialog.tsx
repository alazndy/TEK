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
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ECOPriority } from '@/types/engineering';
import { toast } from 'sonner';

interface AddECRDialogProps {
  projectId?: string;
  trigger?: React.ReactNode;
}

export function AddECRDialog({ projectId, trigger }: AddECRDialogProps) {
  const [open, setOpen] = useState(false);
  const addECR = useECMStore((state) => state.addECR);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'routine' as ECOPriority,
    departmentId: 'dept-eng'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    try {
      await addECR({
        ...formData,
        status: 'open',
        requestorId: 'current-user', // In real app, get from auth store
        projectId, // Optional: associates ECR with a project
      });
      
      toast.success('Değişim talebi başarıyla oluşturuldu.');
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        priority: 'routine',
        departmentId: 'dept-eng'
      });
    } catch {
      toast.error('Talep oluşturulurken bir hata oluştu.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg border-0 px-6">
            <Plus className="h-4 w-4 mr-2" /> Yeni Talep (ECR)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10 rounded-3xl shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Mühendislik Değişim Talebi
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Yeni bir teknik sorun veya iyileştirme talebi başlatın.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-white/80">
                Talep Başlığı
              </Label>
              <Input
                id="title"
                placeholder="Örn: Anakart PWM Devresi Aşırı Isınması"
                className="bg-white/5 border-white/10 rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 h-11"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-semibold text-white/80">
                  Öncelik
                </Label>
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
              <div className="space-y-2">
                <Label htmlFor="dept" className="text-sm font-semibold text-white/80">
                  Sorumlu Departman
                </Label>
                <Select 
                  value={formData.departmentId} 
                  onValueChange={(val) => setFormData({ ...formData, departmentId: val })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-11">
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    <SelectItem value="dept-eng">Mühendislik</SelectItem>
                    <SelectItem value="dept-prod">Üretim</SelectItem>
                    <SelectItem value="dept-qa">Kalite (QA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-white/80">
                Detaylı Açıklama
              </Label>
              <Textarea
                id="description"
                placeholder="Lütfen sorunu veya önerilen değişikliği detaylandırın..."
                className="bg-white/5 border-white/10 rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 min-h-[120px] resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 flex gap-3">
              <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-400">
                Bu talep onaylandığında bir <strong>ECO (Mühendislik Değişim Emri)</strong> sürecine dönüşecektir.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 hover:bg-white/5"
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 shadow-lg dark:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              Talebi Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
