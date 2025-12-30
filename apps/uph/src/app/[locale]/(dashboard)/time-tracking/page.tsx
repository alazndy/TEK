"use client";

import { useEffect, useState } from "react";
import { Play, Pause, Square, Clock, Timer, List, Plus, Calendar } from "lucide-react";
import { useTimeStore } from "@/stores/time-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import type { TimeEntry } from "@/types/time";

export default function TimeTrackingPage() {
  const { user } = useAuthStore();
  const {
    entries,
    activeEntry,
    stats,
    loading,
    fetchEntries,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    calculateStats,
  } = useTimeStore();

  const [selectedProject, setSelectedProject] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isBillable, setIsBillable] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (user?.uid) {
      fetchEntries(user.uid);
      calculateStats(user.uid);
    }
  }, [user?.uid, fetchEntries, calculateStats]);

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeEntry?.status === "running") {
      interval = setInterval(() => {
        const start = new Date(activeEntry.startTime).getTime();
        let elapsed = Date.now() - start;
        
        // Subtract break time
        for (const b of activeEntry.breaks) {
          const breakEnd = b.end ? new Date(b.end).getTime() : Date.now();
          elapsed -= breakEnd - new Date(b.start).getTime();
        }
        
        setElapsedTime(Math.floor(elapsed / 1000));
      }, 1000);
    } else if (activeEntry?.status === "paused") {
      // Calculate elapsed time at pause
      const start = new Date(activeEntry.startTime).getTime();
      let elapsed = Date.now() - start;
      for (const b of activeEntry.breaks) {
        const breakEnd = b.end ? new Date(b.end).getTime() : Date.now();
        elapsed -= breakEnd - new Date(b.start).getTime();
      }
      setElapsedTime(Math.floor(elapsed / 1000));
    } else {
      setElapsedTime(0);
    }

    return () => clearInterval(interval);
  }, [activeEntry]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    if (!user?.uid) return;
    await startTimer({
      userId: user.uid,
      projectId: selectedProject,
      description,
      billable: isBillable,
      startTime: new Date(),
    });
  };

  const handlePause = async () => {
    await pauseTimer();
  };

  const handleResume = async () => {
    await resumeTimer();
  };

  const handleStop = async () => {
    await stopTimer();
    if (user?.uid) {
      calculateStats(user.uid);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}s ${mins}dk`;
    }
    return `${mins}dk`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zaman Takibi</h1>
          <p className="text-muted-foreground">Projeleriniz için zaman kayıtlarını yönetin</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bugün</CardDescription>
            <CardTitle className="text-2xl">{stats?.today || 0}s</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bu Hafta</CardDescription>
            <CardTitle className="text-2xl">{stats?.thisWeek || 0}s</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bu Ay</CardDescription>
            <CardTitle className="text-2xl">{stats?.thisMonth || 0}s</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Faturalanabilir</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats?.billableThisMonth || 0}s</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Günlük Ort.</CardDescription>
            <CardTitle className="text-2xl">{stats?.averageDaily || 0}s</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Timer Section */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Timer Display */}
            <div className="flex-1 flex items-center gap-4">
              <div className="text-5xl font-mono font-bold tabular-nums">
                {formatTime(elapsedTime)}
              </div>
              {activeEntry && (
                <Badge variant={activeEntry.status === "running" ? "default" : "secondary"}>
                  {activeEntry.status === "running" ? "Çalışıyor" : "Duraklatıldı"}
                </Badge>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-4">
              {!activeEntry ? (
                <>
                  <Input
                    placeholder="Ne üzerinde çalışıyorsunuz?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-64"
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      id="billable"
                      checked={isBillable}
                      onCheckedChange={setIsBillable}
                    />
                    <Label htmlFor="billable">Faturalanabilir</Label>
                  </div>
                  <Button size="lg" onClick={handleStart} className="gap-2">
                    <Play className="h-5 w-5" />
                    Başlat
                  </Button>
                </>
              ) : (
                <>
                  {activeEntry.status === "running" ? (
                    <Button size="lg" variant="secondary" onClick={handlePause} className="gap-2">
                      <Pause className="h-5 w-5" />
                      Duraklat
                    </Button>
                  ) : (
                    <Button size="lg" variant="secondary" onClick={handleResume} className="gap-2">
                      <Play className="h-5 w-5" />
                      Devam
                    </Button>
                  )}
                  <Button size="lg" variant="destructive" onClick={handleStop} className="gap-2">
                    <Square className="h-5 w-5" />
                    Bitir
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Bugün</TabsTrigger>
          <TabsTrigger value="week">Bu Hafta</TabsTrigger>
          <TabsTrigger value="all">Tümü</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          <TimeEntriesTable 
            entries={entries.filter(e => {
              const entryDate = new Date(e.startTime);
              const today = new Date();
              return entryDate.toDateString() === today.toDateString();
            })} 
          />
        </TabsContent>

        <TabsContent value="week" className="mt-4">
          <TimeEntriesTable 
            entries={entries.filter(e => {
              const entryDate = new Date(e.startTime);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return entryDate >= weekAgo;
            })} 
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <TimeEntriesTable entries={entries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TimeEntriesTable({ entries }: { entries: TimeEntry[] }) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}s ${mins}dk`;
    }
    return `${mins}dk`;
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Bu dönemde zaman kaydı bulunamadı.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Açıklama</TableHead>
            <TableHead>Proje</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead>Başlangıç</TableHead>
            <TableHead>Bitiş</TableHead>
            <TableHead className="text-right">Süre</TableHead>
            <TableHead>Durum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">
                {entry.description || "-"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {entry.projectId || "-"}
              </TableCell>
              <TableCell>
                {format(new Date(entry.startTime), "d MMM", { locale: tr })}
              </TableCell>
              <TableCell>
                {format(new Date(entry.startTime), "HH:mm")}
              </TableCell>
              <TableCell>
                {entry.endTime ? format(new Date(entry.endTime), "HH:mm") : "-"}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatDuration(entry.duration)}
              </TableCell>
              <TableCell>
                <Badge variant={entry.billable ? "default" : "secondary"}>
                  {entry.billable ? "Faturalanabilir" : "Faturalanmaz"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
