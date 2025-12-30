import React, { useState, useCallback } from 'react';
import { NavigationControls } from './NavigationControls';
import { ImageViewerModal } from './ImageViewerModal';
import { ResultActions } from './ResultActions';
import { HistoryThumbnails } from './HistoryThumbnails';
import { CompareSlider } from './CompareSlider';
import { NavigationDirection } from '../types';
import { SplitSquareHorizontal, Maximize2, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultDisplayProps {
    imageUrl: string;
    sourceImageUrl: string | null;
    onEdit: () => void;
    isLoading: boolean;
    loadingMessage?: string;
    onUndo: () => void;
    canUndo: boolean;
    onRegenerate: () => void;
    onGoBack: () => void;
    onGenerateVariations: () => void;
    onGenerateDifferentAngle: (file: File) => void;
    onGenerateFromSource: () => void;
    historyStack: string[];
    currentIndex: number;
    onThumbnailClick: (index: number) => void;
    isExplorerMode: boolean;
    onEnterExplorer: () => void;
    onExitExplorer: () => void;
    onNavigate: (direction: NavigationDirection) => void;
    onSaveToUPH?: () => void;
}

interface ResultDisplayPropsWithUpscale extends ResultDisplayProps {
    onUpscale: () => void;
    onNewFile: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayPropsWithUpscale> = React.memo(({ 
    imageUrl, sourceImageUrl, onEdit, isLoading, loadingMessage = "Render İşleniyor...", onUndo, canUndo, onRegenerate, onGoBack, onGenerateVariations, 
    onGenerateDifferentAngle, onGenerateFromSource, onUpscale, onNewFile, historyStack, currentIndex, onThumbnailClick,
    isExplorerMode, onEnterExplorer, onExitExplorer, onNavigate, onSaveToUPH
}) => {
    
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isCompareMode, setIsCompareMode] = useState(false);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `render-${timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleViewer = useCallback(() => {
        if (!isCompareMode) setIsViewerOpen(prev => !prev);
    }, [isCompareMode]);

    return (
        <div className="w-full h-full flex flex-col gap-8">
            
            {/* Image Container - Sci-Fi/Modern Frame */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "relative w-full flex-grow bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl group flex items-center justify-center border border-white/5",
                    isExplorerMode ? 'h-full' : 'min-h-[50vh]'
                )}
            >
                <AnimatePresence>
                    {isLoading && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col justify-center items-center bg-background/80 backdrop-blur-xl z-20 p-8 text-center"
                        >
                            <div className="relative">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-indigo-400 animate-pulse" />
                            </div>
                            <p className="mt-6 text-primary font-black tracking-tighter text-xl italic uppercase">
                                 "{loadingMessage}"
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Main Content Area */}
                <div 
                    className={cn(
                        "w-full h-full relative flex items-center justify-center",
                        !isExplorerMode && !isLoading && !isCompareMode && "cursor-zoom-in"
                    )}
                    onClick={!isExplorerMode && !isLoading && !isCompareMode ? toggleViewer : undefined}
                >
                    {isCompareMode && sourceImageUrl ? (
                        <CompareSlider beforeImage={sourceImageUrl} afterImage={imageUrl} />
                    ) : (
                        <>
                            <motion.img 
                                layoutId="main-image"
                                src={imageUrl} 
                                alt="Generated result" 
                                className="max-w-full max-h-full object-contain" 
                            />
                            
                            {/* Hover Overlay */}
                            {!isExplorerMode && !isLoading && (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-primary/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 duration-500 pointer-events-none">
                                    <div className="bg-background/80 text-foreground px-6 py-3 rounded-2xl flex items-center gap-3 backdrop-blur-2xl border border-white/10 shadow-3xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                                        <Maximize2 className="h-5 w-5 text-primary" />
                                        <span className="text-xs font-black uppercase tracking-widest">Tam Ekran</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Compare Button Toggle */}
                {!isExplorerMode && sourceImageUrl && !isLoading && (
                    <div className="absolute top-6 left-6 z-30">
                        <button
                            onClick={() => setIsCompareMode(prev => !prev)}
                            className={cn(
                                "flex items-center gap-3 px-5 py-2.5 rounded-2xl backdrop-blur-2xl border transition-all duration-300",
                                isCompareMode 
                                    ? "bg-primary text-white border-primary shadow-2xl shadow-primary/40" 
                                    : "bg-background/40 text-muted-foreground border-white/10 hover:bg-background/60 hover:text-foreground"
                            )}
                        >
                            <SplitSquareHorizontal size={18} />
                            <span className="text-[10px] uppercase font-black tracking-widest">
                                {isCompareMode ? 'Kapat' : 'Kıyasla'}
                            </span>
                        </button>
                    </div>
                )}

                {/* Navigation Controls (Explorer Mode) */}
                {isExplorerMode && (
                    <NavigationControls 
                        isLoading={isLoading}
                        onNavigate={onNavigate}
                        onExit={onExitExplorer}
                    />
                )}
            </motion.div>

            {/* Thumbnails */}
            {!isExplorerMode && (
                <HistoryThumbnails 
                    historyStack={historyStack}
                    currentIndex={currentIndex}
                    onThumbnailClick={onThumbnailClick}
                />
            )}
            
            {/* Action Buttons */}
            {!isExplorerMode && (
                <div className="glass-panel p-4 rounded-[2rem] border-white/5 bg-slate-900/40">
                    <ResultActions 
                        onEnterExplorer={onEnterExplorer}
                        onGoBack={onGoBack}
                        onUndo={onUndo}
                        onRegenerate={onRegenerate}
                        onGenerateFromSource={onGenerateFromSource}
                        onGenerateVariations={onGenerateVariations}
                        onGenerateDifferentAngle={onGenerateDifferentAngle}
                        onUpscale={onUpscale}
                        onEdit={onEdit}
                        onDownload={handleDownload}
                        onNewFile={onNewFile}
                        isLoading={isLoading}
                        canUndo={canUndo}
                        onSaveToUPH={onSaveToUPH}
                    />
                </div>
            )}

            <ImageViewerModal 
                isOpen={isViewerOpen} 
                onClose={() => setIsViewerOpen(false)} 
                imageUrl={imageUrl} 
            />
        </div>
    );
});
