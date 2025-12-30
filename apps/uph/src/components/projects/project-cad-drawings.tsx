'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Trash2, FileType } from 'lucide-react';
import { Project, CadDrawing } from '@/types/project';
import { useProjectStore } from '@/stores/project-store';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface ProjectCadDrawingsProps {
    project: Project;
}

export function ProjectCadDrawings({ project }: ProjectCadDrawingsProps) {
    const { addCadDrawing, deleteCadDrawing } = useProjectStore();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
            
            // Auto-detect type
            let type: CadDrawing['type'] = 'other';
            if (file.name.toLowerCase().endsWith('.dxf')) type = 'dxf';
            else if (file.name.toLowerCase().endsWith('.dwg')) type = 'dwg';

            const newDrawing: CadDrawing = {
                id: crypto.randomUUID(),
                name: file.name,
                fileUrl: URL.createObjectURL(file), // Mock URL
                uploadedAt: new Date().toISOString(),
                type: type,
                fileSize: `${(file.size / 1024).toFixed(2)} KB`
            };

            await addCadDrawing(project.id, newDrawing);

            toast.success('CAD dosyası başarıyla yüklendi');
        } catch (error) {
            console.error(error);
            toast.error('Dosya yüklenirken hata oluştu');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (drawingId: string) => {
        if (confirm('Bu CAD çizimini silmek istediğinize emin misiniz?')) {
            await deleteCadDrawing(project.id, drawingId);
            toast.success('Çizim silindi');
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <FileType className="h-5 w-5 text-blue-500" />
                        CAD Çizimleri
                    </CardTitle>
                    <CardDescription>
                        DXF ve DWG çizim dosyalarınızı yönetin
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".dxf,.dwg"
                        onChange={handleFileUpload}
                        aria-label="Upload CAD Drawing"
                        title="Upload CAD Drawing"
                    />
                    <Button 
                        variant="default" 
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <>Yükleniyor...</>
                        ) : (
                            <><Upload className="h-4 w-4 mr-2" /> Dosya Yükle</>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {(!project.cadDrawings || project.cadDrawings.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/30">
                        <FileType className="h-12 w-12 mb-4 opacity-30" />
                        <p className="text-sm font-medium">Henüz CAD çizimi yüklenmemiş</p>
                        <p className="text-xs mt-1">DXF veya DWG dosyaları yükleyebilirsiniz.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.cadDrawings.map((drawing) => (
                            <div key={drawing.id} className="group relative flex flex-col p-4 border rounded-lg bg-zinc-900/50 hover:border-blue-500/50 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
                                        <FileType className="h-6 w-6" />
                                    </div>
                                    <Badge variant="secondary" className="uppercase text-[10px]">
                                        {drawing.type}
                                    </Badge>
                                </div>
                                <div className="space-y-1 mb-4">
                                    <h4 className="font-medium text-sm truncate" title={drawing.name}>
                                        {drawing.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(drawing.uploadedAt).toLocaleDateString()} • {drawing.fileSize || 'Unknown Size'}
                                    </p>
                                </div>
                                <div className="mt-auto flex gap-2">
                                     <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1 h-8" 
                                        onClick={() => window.open(drawing.fileUrl, '_blank')}
                                    >
                                        <Download className="h-3 w-3 mr-2" /> İndir
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(drawing.id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
