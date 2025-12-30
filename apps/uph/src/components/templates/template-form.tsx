"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Minus, Trash2, GripVertical, Copy } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplateStore } from "@/stores/template-store";
import type { ProjectTemplate, TaskTemplate, MilestoneTemplate } from "@/types/template";

interface TemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ProjectTemplate;
  userId: string;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
  isPublic: boolean;
}

const CATEGORIES = [
  "Yazılım",
  "Donanım",
  "Mekanik",
  "Elektrik",
  "Tasarım",
  "Genel",
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export function TemplateForm({
  open,
  onOpenChange,
  template,
  userId,
}: TemplateFormProps) {
  const { createTemplate, updateTemplate, loading } = useTemplateStore();
  const isEdit = !!template;

  const [tasks, setTasks] = useState<Omit<TaskTemplate, "id">[]>(
    template?.tasks.map(({ id, ...rest }) => rest) || []
  );

  const [milestones, setMilestones] = useState<Omit<MilestoneTemplate, "id">[]>(
    template?.milestones.map(({ id, ...rest }) => rest) || []
  );

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      category: template?.category || "Genel",
      estimatedDuration: template?.estimatedDuration || 30,
      isPublic: template?.isPublic || false,
    },
  });

  const category = watch("category");
  const isPublic = watch("isPublic");

  // Task management
  const addTask = () => {
    setTasks([
      ...tasks,
      {
        title: "",
        description: "",
        daysOffset: 0,
        estimatedHours: 8,
        priority: "Medium",
        assigneeRole: "",
        tags: [],
      },
    ]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof Omit<TaskTemplate, "id">, value: any) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const duplicateTask = (index: number) => {
    const task = tasks[index];
    setTasks([...tasks.slice(0, index + 1), { ...task }, ...tasks.slice(index + 1)]);
  };

  // Milestone management
  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        name: "",
        description: "",
        daysOffset: 0,
        deliverables: [],
      },
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof Omit<MilestoneTemplate, "id">, value: any) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestones(newMilestones);
  };

  const onSubmit = async (data: FormData) => {
    const templateData: Omit<ProjectTemplate, "id" | "createdAt" | "updatedAt" | "usageCount"> = {
      name: data.name,
      description: data.description,
      category: data.category,
      estimatedDuration: data.estimatedDuration,
      isPublic: data.isPublic,
      createdBy: userId,
      tasks: tasks.map((task, i) => ({
        id: `task-${i + 1}`,
        ...task,
      })),
      milestones: milestones.map((m, i) => ({
        id: `milestone-${i + 1}`,
        ...m,
      })),
      materials: [],
      tags: [],
      defaultStatus: "Planning",
      defaultPriority: "Medium"
    };

    if (isEdit && template) {
      await updateTemplate(template.id, templateData);
    } else {
      await createTemplate(templateData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Şablon Düzenle" : "Yeni Şablon"}</DialogTitle>
          <DialogDescription>
            Proje şablonunuzu oluşturun. Görevler ve kilometre taşları ekleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Şablon Adı *</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="örn: Web Sitesi Geliştirme"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Şablonun ne için kullanılacağını açıklayın..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={category} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Tahmini Süre (gün)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                min="1"
                {...register("estimatedDuration", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-center gap-3 col-span-2">
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(v) => setValue("isPublic", v)}
              />
              <Label htmlFor="isPublic">Herkese açık şablon (diğer kullanıcılar görebilir)</Label>
            </div>
          </div>

          {/* Tabs for Tasks and Milestones */}
          <Tabs defaultValue="tasks">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks">
                Görevler ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="milestones">
                Kilometre Taşları ({milestones.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Projede yer alacak görevleri tanımlayın
                </p>
                <Button type="button" variant="outline" size="sm" onClick={addTask}>
                  <Plus className="h-4 w-4 mr-1" />
                  Görev Ekle
                </Button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>Henüz görev eklenmedi</p>
                  <Button type="button" variant="link" onClick={addTask}>
                    İlk görevi ekle
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                              <Label className="text-xs">Görev Başlığı</Label>
                              <Input
                                value={task.title}
                                onChange={(e) => updateTask(index, "title", e.target.value)}
                                placeholder="Görev başlığı"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs">Başlama (gün)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={task.daysOffset}
                                onChange={(e) => updateTask(index, "daysOffset", Number(e.target.value))}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs">Süre (saat)</Label>
                              <Input
                                type="number"
                                min="1"
                                value={task.estimatedHours}
                                onChange={(e) => updateTask(index, "estimatedHours", Number(e.target.value))}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs">Öncelik</Label>
                              <Select
                                value={task.priority}
                                onValueChange={(v) => updateTask(index, "priority", v)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRIORITIES.map((p) => (
                                    <SelectItem key={p} value={p}>
                                      {p}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-12">
                              <Label className="text-xs">Açıklama</Label>
                              <Input
                                value={task.description || ""}
                                onChange={(e) => updateTask(index, "description", e.target.value)}
                                placeholder="Görev açıklaması (opsiyonel)"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => duplicateTask(index)}
                              title="Kopyala"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTask(index)}
                              className="text-destructive"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Proje kilometre taşlarını belirleyin
                </p>
                <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                  <Plus className="h-4 w-4 mr-1" />
                  Kilometre Taşı Ekle
                </Button>
              </div>

              {milestones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>Henüz kilometre taşı eklenmedi</p>
                  <Button type="button" variant="link" onClick={addMilestone}>
                    İlk kilometre taşını ekle
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((milestone, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                              <Label className="text-xs">Kilometre Taşı Adı</Label>
                              <Input
                                value={milestone.name}
                                onChange={(e) => updateMilestone(index, "name", e.target.value)}
                                placeholder="örn: Alfa Sürümü"
                              />
                            </div>
                            <div className="col-span-4">
                              <Label className="text-xs">Hedef Gün</Label>
                              <Input
                                type="number"
                                min="0"
                                value={milestone.daysOffset}
                                onChange={(e) => updateMilestone(index, "daysOffset", Number(e.target.value))}
                              />
                            </div>
                            <div className="col-span-12">
                              <Label className="text-xs">Açıklama</Label>
                              <Textarea
                                value={milestone.description || ""}
                                onChange={(e) => updateMilestone(index, "description", e.target.value)}
                                placeholder="Bu kilometre taşında neler teslim edilecek?"
                                rows={2}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMilestone(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
