'use client';

import { useState, useEffect } from 'react';
import { WeaveDesign } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Loader2, Cable, Box } from 'lucide-react';
import { WeaveCanvasViewer } from '../weave-viewer/WeaveCanvasViewer';

interface WeaveDesignViewerProps {
  design: WeaveDesign;
  onClose: () => void;
  envEnabled?: boolean;
}

export function WeaveDesignViewer({ design, onClose, envEnabled = true }: WeaveDesignViewerProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showComponents, setShowComponents] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // 1. Try local data first
                if (design.projectData) {
                    setData(JSON.parse(design.projectData));
                    return;
                }

                // 2. Fetch from URL via Proxy (to bypass CORS)
                if (design.fileUrl) {
                    const proxyUrl = `/api/proxy-weave?url=${encodeURIComponent(design.fileUrl)}`;
                    const res = await fetch(proxyUrl);
                    if (!res.ok) throw new Error('Failed to fetch design file');
                    const json = await res.json();
                    setData(json);
                    return;
                }

                setError('Tasarım verisi bulunamadı');
            } catch (err) {
                console.error("Failed to load design:", err);
                setError('Tasarım yüklenirken hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [design]);
    
    // Extract component list
    const componentList = data ? (() => {
        const counts: Record<string, number> = {};
        const pages = data.pages || [];
        pages.forEach((p: any) => {
            (p.instances || []).forEach((inst: any) => {
                const name = inst.template?.name || 'Unknown Component';
                counts[name] = (counts[name] || 0) + 1;
            });
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]); // Sort by count desc
    })() : [];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
                <p>Tasarım yükleniyor...</p>
            </div>
        );
    }
    
    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                <Cable className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium text-lg mb-2">Tasarım Görüntülenemedi</p>
                <p className="text-sm opacity-80">{error || 'Veri eksik'}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* Metadata Bar */}
            <div className="flex items-center justify-between p-2 border-b text-xs shrink-0 bg-background/50 backdrop-blur-sm absolute top-0 left-0 right-0 z-20">
                 <div className="flex gap-4 items-center">
                     <div>
                        <span className="text-muted-foreground mr-1">Tarih:</span>
                        <span className="font-medium">{data.metadata?.date || '-'}</span>
                     </div>
                     <div>
                        <span className="text-muted-foreground mr-1">Rev:</span>
                        <span className="font-medium">{data.metadata?.revision || '-'}</span>
                     </div>
                     <div className="h-4 w-px bg-border mx-2" />
                     <Button 
                        variant={showComponents ? "secondary" : "ghost"} 
                        size="sm" 
                        className="h-6 text-xs gap-2"
                        onClick={() => setShowComponents(!showComponents)}
                     >
                        <Box className="h-3 w-3" />
                        Bileşenler ({componentList.reduce((a,b) => a + b[1], 0)})
                     </Button>
                 </div>
                 <div>
                    <span className="text-muted-foreground mr-1">Hazırlayan:</span>
                    <span className="font-medium">{data.metadata?.preparedBy || '-'}</span>
                 </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 min-h-0 relative flex pt-10">
                {/* Canvas */}
                <div className="flex-1 bg-zinc-950 relative overflow-hidden">
                    <WeaveCanvasViewer projectData={data} className="w-full h-full" />
                </div>

                {/* Component Sidebar */}
                {showComponents && (
                    <div className="w-64 border-l bg-background overflow-y-auto shrink-0 animate-in slide-in-from-right duration-200">
                        <div className="p-3 font-semibold border-b text-sm sticky top-0 bg-background/95 backdrop-blur z-10">
                            Bileşen Listesi
                        </div>
                        <div className="p-2 space-y-1">
                            {componentList.map(([name, count]) => (
                                <div key={name} className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50">
                                    <span className="truncate mr-2" title={name}>{name}</span>
                                    <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs font-medium">x{count}</span>
                                </div>
                            ))}
                            {componentList.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-xs">
                                    Bileşen bulunamadı
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
