'use client';

import { useState, useRef } from 'react';
import { Project, WeaveDesign } from '@/types/project';
import { useProjectStore } from '@/stores/project-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Cable } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Sub-components
import { WeaveDesignViewer } from './weave-designs/weave-design-viewer';
import { DesignCard } from './weave-designs/design-card';

interface ProjectDesignsProps {
    project: Project;
}

export function ProjectDesigns({ project }: ProjectDesignsProps) {
    const { addWeaveDesign, deleteWeaveDesign } = useProjectStore();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState<WeaveDesign | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        
        try {
            const content = await file.text();
            const projectData = JSON.parse(content);
            
            const pages = projectData.pages || [];
            const pageCount = pages.length;
            const componentCount = pages.reduce((acc: number, p: any) => acc + (p.instances?.length || 0), 0);

            const newDesign: Omit<WeaveDesign, 'id'> = {
                name: file.name.replace('.tsproj', ''),
                fileUrl: '#',
                uploadedAt: new Date().toISOString(),
                pageCount,
                componentCount,
                projectData: content
            };

            await addWeaveDesign(project.id, newDesign);
        } catch (error) {
            console.error('Error uploading design:', error);
            alert('Tasarım dosyası okunamadı. Geçerli bir .tsproj dosyası yükleyin.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const designs = project.weaveDesigns || [];

    const handleDelete = async (id: string) => {
        if (confirm('Bu tasarımı silmek istediğinize emin misiniz?')) {
            await deleteWeaveDesign(project.id, id);
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <Cable className="h-5 w-5 text-primary" />
                            Weave Tasarımları
                        </CardTitle>
                        <CardDescription>
                            Weave Final'dan dışa aktarılan sistem şemaları
                        </CardDescription>
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".tsproj,.json"
                            onChange={handleFileUpload}
                            className="hidden"
                            aria-label="Upload weave design file"
                            title="Upload weave design file"
                        />
                        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? 'Yükleniyor...' : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" /> Tasarım Yükle
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {designs.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg">
                                <Cable className="h-12 w-12 mb-4 opacity-30" />
                                <p className="text-sm font-medium">Henüz tasarım yüklenmemiş</p>
                                <p className="text-xs mt-1">Weave Final'dan .tsproj dosyası yükleyin</p>
                            </div>
                        ) : (
                            designs.map(design => (
                                <DesignCard 
                                    key={design.id}
                                    design={design}
                                    onView={setSelectedDesign}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedDesign} onOpenChange={() => setSelectedDesign(null)}>
                <DialogContent 
                    className="p-0 gap-0 overflow-hidden flex flex-col"
                    style={{
                        width: '90vw',
                        height: '85vh',
                        maxWidth: '1600px', 
                        maxHeight: '1000px'
                    }}
                >
                    <DialogHeader className="p-4 border-b shrink-0 bg-background z-10">
                        <DialogTitle className="flex items-center gap-2">
                            <Cable className="h-5 w-5" />
                            {selectedDesign?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedDesign && (
                        <div className="flex-1 min-h-0 relative w-full h-full"> 
                            <WeaveDesignViewer design={selectedDesign} onClose={() => setSelectedDesign(null)} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
