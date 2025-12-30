'use client';

import { useState, useRef } from 'react';
import { Project, ThreeDModel } from '@/types/project';
import { useProjectStore } from '@/stores/project-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cuboid, Upload, Trash2, Eye, Box, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModelViewer } from '../3d/model-viewer';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Project3DModelsProps {
    project: Project;
}

export function Project3DModels({ project }: Project3DModelsProps) {
    const { addThreeDModel, deleteThreeDModel } = useProjectStore();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedModel, setSelectedModel] = useState<ThreeDModel | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate format
        const validExtensions = ['.glb', '.gltf', '.obj'];
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(ext)) {
            alert(`Lütfen geçerli bir 3D model yükleyin (${validExtensions.join(', ')})`);
            return;
        }

        setIsUploading(true);
        try {
            // 1. Upload to Firebase Storage
            const storageRef = ref(storage, `3d-models/${project.id}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Add metadata to Firestore
            const newModel: Omit<ThreeDModel, 'id'> = {
                name: file.name,
                fileUrl: downloadURL,
                uploadedAt: new Date().toISOString(),
                format: ext.replace('.', '') as any,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
            };

            await addThreeDModel(project.id, newModel);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Yükleme başarısız oldu.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const models = project.threeDModels || [];

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <Cuboid className="h-5 w-5 text-blue-500" />
                            3D Modeller
                        </CardTitle>
                        <CardDescription>
                            Fusion360, Blender ve STEP dosyalarınızı görüntüleyin (.glb, .gltf, .obj)
                        </CardDescription>
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".glb,.gltf,.obj"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                            {isUploading ? 'Yükleniyor...' : 'Model Yükle'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {models.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/30">
                                <Box className="h-12 w-12 mb-4 opacity-30" />
                                <p className="text-sm font-medium">Henüz 3D model yüklenmemiş</p>
                                <p className="text-xs mt-1">Görüntülemek için .glb veya .gltf dosyası yükleyin</p>
                            </div>
                        ) : (
                            models.map(model => (
                                <div key={model.id} className="group relative flex flex-col p-3 border rounded-lg hover:shadow-md transition-all bg-card">
                                    <div 
                                        className="aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-md mb-3 flex items-center justify-center cursor-pointer overflow-hidden relative"
                                        onClick={() => setSelectedModel(model)}
                                    >
                                        <Cuboid className="h-10 w-10 text-blue-500/50 group-hover:scale-110 transition-transform" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <Eye className="text-white drop-shadow-md" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-medium text-sm truncate" title={model.name}>{model.name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                <span>{new Date(model.uploadedAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span className="uppercase">{model.format}</span>
                                            </p>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => { e.stopPropagation(); deleteThreeDModel(project.id, model.id); }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
                <DialogContent 
                    className="p-0 gap-0 overflow-hidden flex flex-col"
                    style={{
                        width: '90vw',
                        maxWidth: '1800px',
                        aspectRatio: '16/9',
                        maxHeight: '90vh'
                    }}
                >
                    <DialogHeader className="p-4 border-b bg-background z-10 shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <Cuboid className="h-5 w-5 text-blue-500" />
                            {selectedModel?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 bg-zinc-900 relative overflow-hidden">
                        {selectedModel && <ModelViewer url={selectedModel.fileUrl} className="w-full h-full" />}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
