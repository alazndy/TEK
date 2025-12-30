'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cpu, Upload, CircuitBoard, Download, Trash2, FileCode, CheckCircle2 } from 'lucide-react';
import { Project, PCBDesign } from '@/types/project';
import { useProjectStore } from '@/stores/project-store';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface ProjectPCBDesignsProps {
    project: Project;
}

export function ProjectPCBDesigns({ project }: ProjectPCBDesignsProps) {
    const { addPCBDesign, deletePCBDesign } = useProjectStore();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        
        // Simulating upload delay and getting a "URL"
        // In a real app, integrate with Firebase Storage here
        // const storageRef = ref(storage, `projects/${project.id}/pcb/${file.name}`);
        // await uploadBytes(storageRef, file);
        // const url = await getDownloadURL(storageRef);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
            
            // Auto-detect type
            let type: PCBDesign['type'] = 'other';
            if (file.name.endsWith('.kicad_pcb')) type = 'kicad';
            else if (file.name.endsWith('.PcbDoc')) type = 'altium';
            else if (file.name.endsWith('.brd')) type = 'eagle';
            else if (file.name.endsWith('.zip') || file.name.endsWith('.gbr')) type = 'gerber';

            await addPCBDesign(project.id, {
                name: file.name,
                fileUrl: URL.createObjectURL(file), // Temporary local URL for demo. For prod, use Firebase Storage URL.
                uploadedAt: new Date().toISOString(),
                type: type,
                fileSize: `${(file.size / 1024).toFixed(2)} KB`
            });

            toast.success('PCB dosyası başarıyla yüklendi');
        } catch (error) {
            console.error(error);
            toast.error('Dosya yüklenirken hata oluştu');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (designId: string) => {
        if (confirm('Bu PCB tasarımını silmek istediğinize emin misiniz?')) {
            await deletePCBDesign(project.id, designId);
            toast.success('Tasarım silindi');
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <CircuitBoard className="h-5 w-5 text-emerald-500" />
                        PCB Tasarımları
                    </CardTitle>
                    <CardDescription>
                        Altium, KiCad, Eagle veya Gerber dosyalarınızı yönetin
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".zip,.gbr,.kicad_pcb,.PcbDoc,.brd"
                        onChange={handleFileUpload}
                    />
                    <Button 
                        variant="default" 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <>Yükleniyor...</>
                        ) : (
                            <><Upload className="h-4 w-4 mr-2" /> Tasarım Yükle</>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {(!project.pcbDesigns || project.pcbDesigns.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/30">
                        <Cpu className="h-12 w-12 mb-4 opacity-30" />
                        <p className="text-sm font-medium">Henüz PCB tasarımı yüklenmemiş</p>
                        <p className="text-xs mt-1">Gerber (.zip), KiCad veya Altium dosyaları yükleyebilirsiniz.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.pcbDesigns.map((design) => (
                            <div key={design.id} className="group relative flex flex-col p-4 border rounded-lg bg-zinc-900/50 hover:border-emerald-500/50 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500">
                                        <FileCode className="h-6 w-6" />
                                    </div>
                                    <Badge variant="secondary" className="uppercase text-[10px]">
                                        {design.type}
                                    </Badge>
                                </div>
                                <div className="space-y-1 mb-4">
                                    <h4 className="font-medium text-sm truncate" title={design.name}>
                                        {design.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(design.uploadedAt).toLocaleDateString()} • {design.fileSize || 'Unknown Size'}
                                    </p>
                                </div>
                                <div className="mt-auto flex gap-2">
                                     <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1 h-8" 
                                        onClick={() => window.open(design.fileUrl, '_blank')}
                                    >
                                        <Download className="h-3 w-3 mr-2" /> İndir
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(design.id)}
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
