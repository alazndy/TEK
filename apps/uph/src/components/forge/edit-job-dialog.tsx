"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Hammer, Clipboard, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForgeStore } from "@/stores/forge-store";
import { ForgeJob } from "@/types/forge";

interface EditJobDialogProps {
  job: ForgeJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  progress: number;
  step: string;
}

export function EditJobDialog({ job, open, onOpenChange }: EditJobDialogProps) {
  const { updateJobProgress, loading } = useForgeStore();
  const { register, handleSubmit, reset, setValue, watch, control } = useForm<FormData>({
    defaultValues: {
      progress: 0,
      step: ''
    }
  });

  useEffect(() => {
    if (job) {
      setValue('progress', job.progress);
      setValue('step', job.step);
    }
  }, [job, setValue]);

  const progressValue = watch("progress");

  const onSubmit = async (data: FormData) => {
    if (job) {
      await updateJobProgress(job.id, data.progress, data.step);
      onOpenChange(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>İş Emri Düzenle</DialogTitle>
          <DialogDescription>
             {job.project} - {job.id}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label htmlFor="progress">Tamamlanma Oranı</Label>
                <span className="text-sm font-bold text-cyan-500">%{progressValue}</span>
            </div>
            <Slider 
                defaultValue={[job.progress]} 
                max={100} 
                step={5} 
                value={[progressValue]}
                onValueChange={(vals) => setValue("progress", vals[0])}
                className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step">Mevcut Aşama / Not</Label>
            <Input 
              id="step" 
              placeholder="örn: Montaj tamamlandı, teste geçiliyor." 
              {...register("step")} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground p-3 bg-white/5 rounded-lg">
             <div>
                <span className="block opacity-50">Teknisyen</span>
                <span className="font-medium text-white">{job.technician || '-'}</span>
             </div>
             <div>
                <span className="block opacity-50">Öncelik</span>
                <span className="font-medium text-white">{job.priority}</span>
             </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              Güncelle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
