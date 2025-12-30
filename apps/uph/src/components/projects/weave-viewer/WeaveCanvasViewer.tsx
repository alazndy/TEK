'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Box } from 'lucide-react';

interface WeavePage {
    instances?: unknown[];
    connections?: unknown[];
}

interface WeaveCanvasViewerProps {
    projectData: { pages?: WeavePage[] }; // More specific type
    className?: string;
}

export function WeaveCanvasViewer({ projectData, className }: WeaveCanvasViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Derived state directly from props to avoid effect sync issues
    const pages = projectData?.pages || [];

    // Basic count of items
    const totalInstances = pages.reduce((acc: number, page: WeavePage) => acc + (page.instances?.length || 0), 0);
    const totalConnections = pages.reduce((acc: number, page: WeavePage) => acc + (page.connections?.length || 0), 0);

    return (
        <div ref={containerRef} className={cn("relative bg-zinc-950 text-white overflow-hidden flex items-center justify-center", className)}>
            <div className="text-center p-8 opacity-50">
                <Box className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
                <h3 className="text-lg font-semibold mb-2">Weave Tasarım Önizleme</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto mb-4">
                    Bu tasarım {pages.length} sayfa, {totalInstances} bileşen ve {totalConnections} bağlantı içeriyor.
                    <br/>
                    Tam düzenleme için Weave uygulamasını kullanın.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto text-left bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <div>
                        <span className="text-xs text-zinc-500 block">Sayfalar</span>
                        <span className="font-mono text-xl">{pages.length}</span>
                    </div>
                    <div>
                         <span className="text-xs text-zinc-500 block">Bileşenler</span>
                         <span className="font-mono text-xl">{totalInstances}</span>
                    </div>
                </div>
            </div>
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle,#3f3f46_1px,transparent_1px)] bg-size-[24px_24px]" />
        </div>
    );
}
