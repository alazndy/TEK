'use client';

import { useState, useEffect, useRef } from 'react';
import { GoogleDriveService } from '@/services/google-drive-service';
import { useAuthStore } from '@/stores/auth-store';
import { useProjectStore } from '@/stores/project-store';
import { Project } from '@/types/project';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    HardDrive, 
    Plus, 
    Upload, 
    Loader2, 
    ExternalLink, 
    FileText, 
    FolderPlus,
    AlertCircle,
    RefreshCw
} from 'lucide-react';

interface DriveBrowserProps {
    project: Project;
}

export function DriveBrowser({ project }: DriveBrowserProps) {
    const { googleAccessToken, loginWithGoogle } = useAuthStore();
    const { updateProject } = useProjectStore();
    const [files, setFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isConnected = !!googleAccessToken;

    useEffect(() => {
        if (isConnected && project.googleDriveFolderId) {
            fetchFiles();
        }
    }, [isConnected, project.googleDriveFolderId]);

    const fetchFiles = async () => {
        if (!project.googleDriveFolderId) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const driveFiles = await GoogleDriveService.listFiles(project.googleDriveFolderId);
            setFiles(driveFiles);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProjectFolder = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const folder = await GoogleDriveService.createFolder(`UPH - ${project.name}`);
            await updateProject(project.id, { googleDriveFolderId: folder.id });
            // The project update will eventually trigger a re-render or state update
            // For immediate feedback, we could manually set the ID if updateProject is local-first
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !project.googleDriveFolderId) return;

        setIsUploading(true);
        setError(null);
        try {
            await GoogleDriveService.uploadFile(file, project.googleDriveFolderId);
            await fetchFiles();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!isConnected) {
        return (
            <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                    <div className="p-4 rounded-full bg-primary/10">
                        <HardDrive className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Google Drive Bağlantısı Gerekli</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Drive dosyalarına erişmek ve proje dökümanlarını merkezi olarak yönetmek için Google hesabınızı bağlayın.
                        </p>
                    </div>
                    <Button onClick={() => loginWithGoogle()} className="gap-2">
                        <HardDrive className="h-4 w-4" /> Google ile Bağlan
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!project.googleDriveFolderId) {
        return (
            <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                    <div className="p-4 rounded-full bg-primary/10">
                        <FolderPlus className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Proje Klasörü Oluşturulmadı</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Bu proje için henüz bir Google Drive klasörü tanımlanmadı. Otomatik olarak bir tane oluşturabilirsiniz.
                        </p>
                    </div>
                    <Button onClick={handleCreateProjectFolder} disabled={isLoading} className="gap-2">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Proje Klasörü Oluştur
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-primary" />
                        Google Drive
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                            BAĞLI
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Proje klasöründeki dosyalar senkronize edildi.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload}
                        aria-label="Google Drive'a Dosya Yükle"
                    />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isLoading} title="Dosya Yükle">
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Dosya Yükle
                    </Button>
                    <Button variant="ghost" size="sm" onClick={fetchFiles} disabled={isLoading} title="Yenile">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} aria-label="Yenile" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}
                
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                        {files.length === 0 && !isLoading ? (
                            <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                Bu klasörde henüz dosya yok.
                            </div>
                        ) : (
                            files.map((file) => (
                                <div key={file.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 transition-all group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 rounded-md bg-background group-hover:bg-primary/5 transition-colors">
                                           {file.mimeType.includes('folder') ? (
                                             <FolderPlus className="h-5 w-5 text-yellow-500" />
                                           ) : (
                                             <FileText className="h-5 w-5 text-primary" />
                                           )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {file.mimeType.split('.').pop()} • {file.size ? `${(parseInt(file.size)/1024).toFixed(1)} KB` : 'Folder'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" title="Google Drive'da Görüntüle" asChild>
                                        <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" aria-label={`${file.name} dosyasını Google Drive'da aç`}>
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
