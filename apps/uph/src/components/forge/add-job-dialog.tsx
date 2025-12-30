"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Hammer, Clipboard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForgeStore } from "@/stores/forge-store";
import { TechnicianSelect } from "./technician-select";

interface AddJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  project: string;
  projectId: string; 
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  technician: string;
  step: string;
}

export function AddJobDialog({ open, onOpenChange }: AddJobDialogProps) {
  const { addJob, loading } = useForgeStore();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      priority: 'Medium',
      step: 'Hazırlık'
    }
  });

  const technicianValue = watch("technician");

  const onSubmit = async (data: FormData) => {
    await addJob({
      project: data.project,
      projectId: data.projectId || `proj-${Date.now()}`,
      priority: data.priority,
      technician: data.technician,
      step: data.step
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni İş Emri</DialogTitle>
          <DialogDescription>
             Üretim hattına yeni bir iş emri ekleyin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project" className="flex items-center gap-2">
              <Clipboard className="w-4 h-4" />
              Proje / İş Adı
            </Label>
            <Input 
              id="project" 
              placeholder="örn: Pano Montajı v2" 
              {...register("project", { required: true })} 
            />
            {errors.project && <span className="text-xs text-red-500">Proje adı gerekli</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Öncelik</Label>
              <Select onValueChange={(val: any) => setValue("priority", val)} defaultValue="Medium">
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Düşük</SelectItem>
                  <SelectItem value="Medium">Orta</SelectItem>
                  <SelectItem value="High">Yüksek</SelectItem>
                  <SelectItem value="Critical">Kritik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
             <div className="space-y-2">
                <Label htmlFor="technician" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Teknisyen
                </Label>
                <TechnicianSelect 
                    value={technicianValue} 
                    onValueChange={(val) => setValue("technician", val)} 
                />
             </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="step">Başlangıç Aşaması</Label>
            <Input 
              id="step" 
              placeholder="örn: Hazırlık" 
              {...register("step")} 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
              {loading ? "Ekleniyor..." : "İş Emri Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
