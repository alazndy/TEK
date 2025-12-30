"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Clock, Calendar, DollarSign, Link2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useTimeStore } from "@/stores/time-store";

interface TimeEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  projectId?: string;
  taskId?: string;
}

interface FormData {
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  manualDuration: boolean;
  billable: boolean;
  hourlyRate: number;
  tags: string;
}

export function TimeEntryForm({
  open,
  onOpenChange,
  userId,
  projectId,
  taskId,
}: TimeEntryFormProps) {
  const { createManualEntry, loading } = useTimeStore();
  const [manualDuration, setManualDuration] = useState(false);

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    defaultValues: {
      description: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
      duration: 480,
      manualDuration: false,
      billable: true,
      hourlyRate: 0,
      tags: "" as string, // Force string type for input compatibility
    },
  });

  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const date = watch("date");
  const billable = watch("billable");
  const duration = watch("duration");

  // Calculate duration from start/end times
  const calculateDuration = () => {
    if (manualDuration) return duration;

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return Math.max(0, endMinutes - startMinutes);
  };

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0 && minutes > 0) return `${hours}s ${minutes}dk`;
    if (hours > 0) return `${hours}s`;
    return `${minutes}dk`;
  };

  const onSubmit = async (data: FormData) => {
    const calculatedDuration = manualDuration ? data.duration : calculateDuration();

    // Create start and end dates
    const [startH, startM] = data.startTime.split(":").map(Number);
    const [endH, endM] = data.endTime.split(":").map(Number);

    const startDate = new Date(data.date);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(data.date);
    endDate.setHours(endH, endM, 0, 0);

    await createManualEntry({
      userId: userId as string,
      projectId: projectId || "", // Fallback to empty string if undefined
      taskId: taskId || undefined, // undefined is strict here
      description: data.description,
      startTime: startDate,
      endTime: endDate,
      duration: calculatedDuration,
      billable: data.billable,
      hourlyRate: data.billable && data.hourlyRate > 0 ? data.hourlyRate : undefined,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manuel Zaman Kaydı</DialogTitle>
          <DialogDescription>
            Geçmiş bir çalışma için zaman kaydı oluşturun
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Ne üzerinde çalıştınız?"
              rows={2}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Tarih</Label>
              <Input id="date" type="date" {...register("date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Başlangıç</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
                disabled={manualDuration}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Bitiş</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
                disabled={manualDuration}
              />
            </div>
          </div>

          {/* Manual Duration Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {manualDuration
                  ? "Manuel süre girişi"
                  : `Hesaplanan süre: ${formatDuration(calculateDuration())}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="manualDuration" className="text-xs text-muted-foreground">
                Manuel
              </Label>
              <Switch
                id="manualDuration"
                checked={manualDuration}
                onCheckedChange={setManualDuration}
              />
            </div>
          </div>

          {/* Manual Duration Input */}
          {manualDuration && (
            <div className="space-y-2">
              <Label htmlFor="duration">Süre (dakika)</Label>
              <div className="flex gap-2">
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  {...register("duration", { valueAsNumber: true })}
                />
                <div className="flex items-center gap-1">
                  {[15, 30, 60, 120, 240, 480].map((mins) => (
                    <Button
                      key={mins}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue("duration", mins)}
                      className="text-xs px-2"
                    >
                      {formatDuration(mins)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Billable */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="billable">Faturalanabilir</Label>
            </div>
            <Switch
              id="billable"
              checked={billable}
              onCheckedChange={(v) => setValue("billable", v)}
            />
          </div>

          {/* Hourly Rate */}
          {billable && (
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Saatlik Ücret (opsiyonel)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                {...register("hourlyRate", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Etiketler
            </Label>
            <Input
              id="tags"
              {...register("tags")}
              placeholder="virgülle ayırın: tasarım, toplantı, geliştirme"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
