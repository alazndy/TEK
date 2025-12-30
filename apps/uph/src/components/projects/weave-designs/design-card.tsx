'use client';

import { WeaveDesign } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, Cable, Layers, Box } from 'lucide-react';
import Image from 'next/image';

interface DesignCardProps {
  design: WeaveDesign;
  onView: (design: WeaveDesign) => void;
  onDelete: (id: string) => void;
}

export function DesignCard({ design, onView, onDelete }: DesignCardProps) {
  return (
    <div className="flex flex-col p-4 border rounded-lg hover:shadow-sm transition-shadow bg-linear-to-br from-background to-muted/30">
        <div className="flex flex-col mb-3">
            {design.thumbnailUrl ? (
                <div className="w-full aspect-video bg-zinc-900 rounded-md mb-3 overflow-hidden border border-border/50 relative group-hover:border-primary/50 transition-colors">
                    <Image 
                        src={design.thumbnailUrl} 
                        alt={design.name} 
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 400px"
                    />
                </div>
            ) : (
                <div className="w-full aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-md mb-3 flex items-center justify-center">
                    <Cable className="h-10 w-10 text-muted-foreground/50" />
                </div>
            )}
            
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm truncate" title={design.name}>{design.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {new Date(design.uploadedAt).toLocaleDateString('tr-TR')}
                    </p>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
                <Layers className="h-3 w-3" /> {design.pageCount} sayfa
            </span>
            <span className="flex items-center gap-1">
                <Box className="h-3 w-3" /> {design.componentCount} bileşen
            </span>
        </div>

        <div className="flex gap-2 mt-auto">
            <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onView(design)}
            >
                <Eye className="h-3 w-3 mr-1" /> Görüntüle
            </Button>
            <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(design.id)}
            >
                <Trash2 className="h-3 w-3" />
            </Button>
        </div>
    </div>
  );
}
