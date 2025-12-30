"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FileStack, Copy, Trash2, MoreHorizontal, Star, Users } from "lucide-react";
import { useTemplateStore } from "@/stores/template-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectTemplate } from "@/types/template";

const CATEGORIES = [
  "Yazılım",
  "Donanım",
  "Mekanik",
  "Elektrik",
  "Genel",
  "Custom",
];

export default function TemplatesPage() {
  const { user } = useAuthStore();
  const { 
    templates, 
    loading, 
    fetchTemplates, 
    deleteTemplate,
    duplicateTemplate,
    getPopularTemplates,
    getTemplatesByCategory,
  } = useTemplateStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<ProjectTemplate | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchTemplates(user.uid, true);
    }
  }, [user?.uid, fetchTemplates]);

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const myTemplates = templates.filter(t => t.createdBy === user?.uid);
  const publicTemplates = templates.filter(t => t.isPublic && t.createdBy !== user?.uid);
  const popularTemplates = getPopularTemplates(6);

  const handleDuplicate = async (template: ProjectTemplate) => {
    await duplicateTemplate(template.id, `${template.name} (Kopya)`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu şablonu silmek istediğinize emin misiniz?")) {
      await deleteTemplate(id);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Proje Şablonları</h1>
          <p className="text-muted-foreground">Şablonları kullanarak hızlıca proje oluşturun</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Şablon
        </Button>
      </div>

      {/* Popular Templates */}
      {popularTemplates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Popüler Şablonlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularTemplates.slice(0, 3).map(template => (
              <TemplateCard 
                key={template.id} 
                template={template}
                onView={() => setViewingTemplate(template)}
                onDuplicate={() => handleDuplicate(template)}
                onDelete={() => handleDelete(template.id)}
                isOwner={template.createdBy === user?.uid}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Şablon ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tümü ({filteredTemplates.length})</TabsTrigger>
          <TabsTrigger value="mine">Benim Şablonlarım ({myTemplates.length})</TabsTrigger>
          <TabsTrigger value="public">Paylaşılan ({publicTemplates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <TemplateGrid 
            templates={filteredTemplates}
            userId={user?.uid}
            onView={setViewingTemplate}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="mine" className="mt-6">
          <TemplateGrid 
            templates={myTemplates.filter(t => 
              t.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
              (categoryFilter === "all" || t.category === categoryFilter)
            )}
            userId={user?.uid}
            onView={setViewingTemplate}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="public" className="mt-6">
          <TemplateGrid 
            templates={publicTemplates.filter(t => 
              t.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
              (categoryFilter === "all" || t.category === categoryFilter)
            )}
            userId={user?.uid}
            onView={setViewingTemplate}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      {/* View Template Dialog */}
      {viewingTemplate && (
        <Dialog open={!!viewingTemplate} onOpenChange={() => setViewingTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{viewingTemplate.name}</DialogTitle>
              <DialogDescription>{viewingTemplate.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge>{viewingTemplate.category}</Badge>
                <Badge variant="outline">{viewingTemplate.estimatedDuration} gün</Badge>
                {viewingTemplate.isPublic && (
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    Paylaşılan
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Görevler ({viewingTemplate.tasks.length})</h4>
                <ul className="space-y-1 text-sm">
                  {viewingTemplate.tasks.slice(0, 5).map(task => (
                    <li key={task.id} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {task.title}
                    </li>
                  ))}
                  {viewingTemplate.tasks.length > 5 && (
                    <li className="text-muted-foreground">
                      +{viewingTemplate.tasks.length - 5} daha fazla görev
                    </li>
                  )}
                </ul>
              </div>

              {viewingTemplate.milestones.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Kilometre Taşları ({viewingTemplate.milestones.length})</h4>
                  <ul className="space-y-1 text-sm">
                    {viewingTemplate.milestones.map(m => (
                      <li key={m.id} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        {m.name} (Gün {m.daysOffset})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setViewingTemplate(null)}>
                  Kapat
                </Button>
                <Button>
                  Bu Şablonla Proje Oluştur
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Template Dialog - Placeholder */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Yeni Şablon</DialogTitle>
            <DialogDescription>
              Proje şablonu oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            Şablon formu burada olacak...
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplateGrid({ 
  templates, 
  userId,
  onView, 
  onDuplicate, 
  onDelete 
}: { 
  templates: ProjectTemplate[];
  userId?: string;
  onView: (t: ProjectTemplate) => void;
  onDuplicate: (t: ProjectTemplate) => void;
  onDelete: (id: string) => void;
}) {
  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <FileStack className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Şablon bulunamadı</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          onView={() => onView(template)}
          onDuplicate={() => onDuplicate(template)}
          onDelete={() => onDelete(template.id)}
          isOwner={template.createdBy === userId}
        />
      ))}
    </div>
  );
}

function TemplateCard({ 
  template, 
  onView, 
  onDuplicate, 
  onDelete,
  isOwner,
}: { 
  template: ProjectTemplate;
  onView: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isOwner: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {template.description || "Açıklama yok"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                Görüntüle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Kopyala
              </DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{template.category}</Badge>
          <Badge variant="secondary">{template.estimatedDuration} gün</Badge>
          {template.isPublic && (
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              Paylaşılan
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {template.tasks.length} görev · {template.milestones.length} kilometre taşı
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>{template.usageCount} kez kullanıldı</span>
          <Button size="sm" onClick={onView}>Kullan</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
