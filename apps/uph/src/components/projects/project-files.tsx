'use client';

import { useState, useRef, memo, useCallback } from 'react';
import { Project, ProjectFile } from '@/types/project';
import { useProjectStore } from '@/stores/project-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, FileText, Image as ImageIcon, File, Download, Zap, Cpu } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface ProjectFilesProps {
    project: Project;
}

const getFileIcon = (type: string) => {
    switch (type) {
        case 'PDF': return <FileText className="h-8 w-8 text-red-500" />;
        case 'Image': return <ImageIcon className="h-8 w-8 text-blue-500" />;
        default: return <File className="h-8 w-8 text-gray-500" />;
    }
};

// Memoized File Item Component
const FileItem = memo(({ 
    file, 
    projectId, 
    onDelete 
}: { 
    file: ProjectFile, 
    projectId: string, 
    onDelete: (pid: string, fid: string) => void 
}) => {
    return (
        <div className="flex items-start gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
            <div className="mt-1">{getFileIcon(file.type)}</div>
            <div className="flex-1 overflow-hidden">
                <p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
                <p className="text-xs text-muted-foreground">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
            </div>
            <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Download" asChild>
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3" />
                    </a>
                </Button>
                
                {/* Integration Buttons */}
                {file.type === 'PDF' && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                        title="T-SA ile Analiz Et"
                        onClick={() => {
                            const url = `http://localhost:5173/?integrate=tsa&fileUrl=${encodeURIComponent(file.url)}&fileName=${encodeURIComponent(file.name)}&projectId=${projectId}`;
                            window.open(url, '_blank');
                        }}
                    >
                        <Zap className="h-3 w-3" />
                    </Button>
                )}

                {(file.type === 'Image' || file.name.match(/\.(glb|gltf|obj|stl)$/i)) && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50"
                        title="Renderci Muhittin'e Gönder"
                        onClick={() => {
                            const url = `http://localhost:5174/?integrate=render&fileUrl=${encodeURIComponent(file.url)}&fileName=${encodeURIComponent(file.name)}&projectId=${projectId}`;
                            window.open(url, '_blank');
                        }}
                    >
                        <Cpu className="h-3 w-3" />
                    </Button>
                )}

                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => onDelete(projectId, file.id)}
                    title="Delete"
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
});

FileItem.displayName = 'FileItem';

export function ProjectFiles({ project }: ProjectFilesProps) {
    const { addFile, deleteFile } = useProjectStore();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Create a storage reference
            const timestamp = Date.now();
            const storageRef = ref(storage, `projects/${project.id}/files/${timestamp}_${file.name}`);
            
            // Upload file
            await uploadBytes(storageRef, file);
            
            // Get download URL
            const url = await getDownloadURL(storageRef);

            // Determine generic type for icon
            let type = 'Document';
            if (file.type.startsWith('image/')) type = 'Image';
            else if (file.type === 'application/pdf') type = 'PDF';

            const newFile = {
                name: file.name,
                url: url,
                type: type,
                uploadedAt: new Date().toISOString()
            };

            await addFile(project.id, newFile);
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Dosya yüklenirken bir hata oluştu.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = useCallback((pid: string, fid: string) => {
        deleteFile(pid, fid);
    }, [deleteFile]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Files & Documents</CardTitle>
                    <CardDescription>
                        Manage project contracts, blueprints, and reports.
                    </CardDescription>
                </div>
                <div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload}
                    />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : (
                            <>
                                <Upload className="h-4 w-4 mr-2" /> Upload File
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                     {(project.files || []).length === 0 ? (
                        <div className="col-span-full text-center py-10 text-muted-foreground border border-dashed rounded-md">
                            No files uploaded yet.
                        </div>
                    ) : (
                        (project.files || []).map(file => (
                            <FileItem 
                                key={file.id} 
                                file={file} 
                                projectId={project.id} 
                                onDelete={handleDelete} 
                            />
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
