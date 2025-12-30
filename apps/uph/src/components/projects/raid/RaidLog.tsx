"use client";

import { useState } from "react";
import { useRiskStore } from "@/stores/risk-store";
import { RAIDEntry, RAIDType, RAIDStatus } from "@/types/risk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, List, Shield, HelpCircle } from "lucide-react";

interface RaidLogProps {
  projectId: string;
}

export function RaidLog({ projectId }: RaidLogProps) {
  const { entries, addEntry, deleteEntry, updateEntry } = useRiskStore();
  const projectEntries = entries.filter((e) => e.projectId === projectId);
  const [activeTab, setActiveTab] = useState<RAIDType>("risk");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RAIDEntry | null>(null);

  const filteredEntries = projectEntries.filter((e) => e.type === activeTab);

  const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const entry: any = {
      projectId,
      type: activeTab,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      ownerId: formData.get("ownerId") as string || "current-user",
      status: formData.get("status") as RAIDStatus,
    };

    if (activeTab === "risk") {
      entry.probability = Number(formData.get("probability"));
      entry.impact = Number(formData.get("impact"));
      entry.mitigationPlan = formData.get("mitigationPlan") as string;
    }

    if (editingEntry) {
      updateEntry(editingEntry.id, entry);
    } else {
      addEntry(entry);
    }
    setIsAddOpen(false);
    setEditingEntry(null);
  };

  const statusColors: Record<RAIDStatus, "default" | "secondary" | "destructive" | "outline"> = {
    identified: "outline",
    analyzed: "secondary",
    mitigating: "default",
    resolved: "default", // success color usually, default as placeholder
    closed: "secondary",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">RAID Log</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingEntry(null)}>
              <Plus className="h-4 w-4 mr-2" /> Yeni Kayıt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Kaydı Düzenle" : "Yeni RAID Kaydı Ekle"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Başlık</Label>
                <Input
                  name="title"
                  defaultValue={editingEntry?.title}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Input
                  name="description"
                  defaultValue={editingEntry?.description}
                />
              </div>
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select
                  name="status"
                  defaultValue={editingEntry?.status || "identified"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identified">Tespit Edildi</SelectItem>
                    <SelectItem value="analyzed">Analiz Edildi</SelectItem>
                    <SelectItem value="mitigating">Önleniyor</SelectItem>
                    <SelectItem value="resolved">Çözüldü</SelectItem>
                    <SelectItem value="closed">Kapandı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeTab === "risk" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Olasılık (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        name="probability"
                        defaultValue={editingEntry?.probability || 1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Etki (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        name="impact"
                        defaultValue={editingEntry?.impact || 1}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Önleme Planı</Label>
                    <Input
                      name="mitigationPlan"
                      defaultValue={editingEntry?.mitigationPlan}
                    />
                  </div>
                </>
              )}

              <DialogFooter>
                <Button type="submit">Kaydet</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as RAIDType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Riskler
          </TabsTrigger>
          <TabsTrigger value="assumption" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" /> Varsayımlar
          </TabsTrigger>
          <TabsTrigger value="issue" className="flex items-center gap-2">
            <List className="h-4 w-4" /> Sorunlar
          </TabsTrigger>
          <TabsTrigger value="dependency" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Bağımlılıklar
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Durum</TableHead>
                  {activeTab === "risk" && (
                    <>
                      <TableHead>Skor</TableHead>
                      <TableHead>Önleme Planı</TableHead>
                    </>
                  )}
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={activeTab === "risk" ? 6 : 4}
                      className="text-center h-24 text-muted-foreground"
                    >
                      Kayıt bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.title}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[entry.status]}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      {activeTab === "risk" && (
                        <>
                          <TableCell>
                            {entry.probability && entry.impact ? (
                              <Badge
                                className={
                                  entry.probability * entry.impact >= 15
                                    ? "bg-red-500 hover:bg-red-600"
                                    : entry.probability * entry.impact >= 8
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-green-500 hover:bg-green-600"
                                }
                              >
                                {entry.probability * entry.impact}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {entry.mitigationPlan || "-"}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsAddOpen(true);
                          }}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          Sil
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
