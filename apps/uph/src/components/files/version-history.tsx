"use client";

import React, { useState, useEffect } from "react";
import { History, Download, RotateCcw, Eye, Trash2, Lock, Unlock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileVersionStore } from "@/stores/file-version-store";
import type { FileVersion, VersionedFile } from "@/types/file-version";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface VersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: string;
  userId: string;
}

export function VersionHistory({
  open,
  onOpenChange,
  fileId,
  userId,
}: VersionHistoryProps) {
  const {
    currentFile,
    versions,
    loading,
    fetchVersionedFile,
    fetchVersions,
    restoreVersion,
    lockFile,
    unlockFile,
    deleteVersion,
  } = useFileVersionStore();

  useEffect(() => {
    if (open && fileId) {
      fetchVersionedFile(fileId);
      fetchVersions(fileId);
    }
  }, [open, fileId, fetchVersionedFile, fetchVersions]);

  const handleRestore = async (versionId: string) => {
    if (confirm("Bu versiyonu geri yüklemek istediğinize emin misiniz? Bu işlem yeni bir versiyon oluşturacak.")) {
      await restoreVersion(fileId, versionId, userId);
      await fetchVersions(fileId);
    }
  };

  const handleDelete = async (versionId: string) => {
    if (confirm("Bu versiyonu silmek istediğinize emin misiniz?")) {
      await deleteVersion(fileId, versionId);
      await fetchVersions(fileId);
    }
  };

  const handleToggleLock = async () => {
    if (!currentFile) return;

    if (currentFile.lockedBy) {
      await unlockFile(fileId);
    } else {
      await lockFile(fileId, userId);
    }
    await fetchVersionedFile(fileId);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Versiyon Geçmişi
          </DialogTitle>
          <DialogDescription>
            {currentFile?.originalName || "Dosya"} için versiyon geçmişi
          </DialogDescription>
        </DialogHeader>

        {/* File Info Bar */}
        {currentFile && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <h4 className="font-medium">{currentFile.originalName}</h4>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span>Versiyon {currentFile.currentVersionNumber}</span>
                  <span>{formatFileSize(currentFile.fileSize)}</span>
                  <span>{currentFile.mimeType}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentFile.lockedBy ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Kilitli
                </Badge>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleLock}
              >
                {currentFile.lockedBy ? (
                  <>
                    <Unlock className="h-4 w-4 mr-1" />
                    Kilidi Aç
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-1" />
                    Kilitle
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Version List */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-muted-foreground">Yükleniyor...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <History className="h-12 w-12 opacity-30 mb-2" />
              <p>Versiyon geçmişi bulunamadı</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Versiyon</TableHead>
                  <TableHead>Değişiklik</TableHead>
                  <TableHead>Yükleyen</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">Boyut</TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version, index) => (
                  <TableRow key={version.id}>
                    <TableCell>
                      <Badge
                        variant={index === 0 ? "default" : "secondary"}
                        className="font-mono"
                      >
                        v{version.versionNumber}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {version.comment || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {version.uploadedByName || version.uploadedBy}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(version.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatFileSize(version.fileSize)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a href={version.fileUrl} target="_blank" rel="noopener noreferrer" title="İndir">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        {index !== 0 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRestore(version.id)}
                              title="Geri Yükle"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(version.id)}
                              className="text-destructive"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
