"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Server, MapPin, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFluxStore } from "@/stores/flux-store";

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  location: string;
  ipAddress: string;
  powerConsumption: number;
}

export function AddDeviceDialog({ open, onOpenChange }: AddDeviceDialogProps) {
  const { addDevice, loading } = useFluxStore();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    await addDevice({
      name: data.name,
      location: data.location,
      ipAddress: data.ipAddress,
      powerConsumption: data.powerConsumption
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Cihaz Ekle</DialogTitle>
          <DialogDescription>
             Ağa yeni bir IoT cihazı veya sensörü ekleyin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Cihaz Adı
            </Label>
            <Input 
              id="name" 
              placeholder="örn: Ana Dağıtım Panosu" 
              {...register("name", { required: true })} 
            />
            {errors.name && <span className="text-xs text-red-500">Cihaz adı gerekli</span>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Konum
            </Label>
            <Input 
              id="location" 
              placeholder="örn: Blok B - Zemin Kat" 
              {...register("location", { required: true })} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="ip" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  IP Adresi
                </Label>
                <Input 
                  id="ip" 
                  placeholder="192.168.1.X" 
                  {...register("ipAddress")} 
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="power">Güç (kW)</Label>
                <Input 
                  id="power" 
                  type="number"
                  step="0.1"
                  placeholder="0.0" 
                  {...register("powerConsumption", { valueAsNumber: true })} 
                />
             </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              {loading ? "Ekleniyor..." : "Cihazı Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
