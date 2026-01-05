import React from 'react';
import { 
  HardHat, RotateCcw, Image as ImageIcon, Box, 
  FolderOpen, ListPlus, Download, Sun, Expand, Palette, Layers
} from 'lucide-react';
import { PremiumButton } from './ui/PremiumButton';
import { motion } from 'framer-motion';

interface HeaderProps {
    onGalleryClick: () => void;
    onReset: () => void;
    onProjectsClick: () => void;
    onBatchClick: () => void;
    onExportClick: () => void;
    onSceneClick: () => void;
    onLightingClick?: () => void;
    onOutpaintClick?: () => void;
    onStyleTransferClick?: () => void;
    hasResult?: boolean;
}

export const Header: React.FC<HeaderProps> = React.memo(({ 
    onGalleryClick, 
    onReset,
    onProjectsClick,
    onBatchClick,
    onExportClick,
    onSceneClick,
    onLightingClick,
    onOutpaintClick,
    onStyleTransferClick,
    hasResult = false
}) => {
    return (
        <header className="px-6 h-20 flex items-center justify-between border-b border-white/5 relative bg-background/60 backdrop-blur-2xl sticky top-0 z-40 overflow-hidden">
            {/* Ambient Line */}
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30"></div>

            {/* Left Side - Projects & Reset */}
            <div className="flex items-center gap-3">
                <PremiumButton 
                    variant="glass"
                    size="icon" 
                    onClick={onProjectsClick} 
                    title="Projeler"
                >
                    <FolderOpen className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </PremiumButton>

                <PremiumButton 
                    variant="glass"
                    size="icon" 
                    onClick={onReset} 
                    title="Uygulamayı sıfırla"
                >
                    <RotateCcw className="h-4 w-4 text-muted-foreground hover:rotate-180 transition-transform duration-500" />
                </PremiumButton>

                <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Box className="w-3 h-3 text-primary" />
                    Technical Visualizer
                </div>
            </div>
            
            {/* Center - Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                <motion.div 
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-3"
                >
                    <h1 className="text-2xl font-black tracking-tighter select-none flex items-center gap-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
                            RENDERCI
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"></div>
                    </h1>
                </motion.div>
                <span className="text-[9px] font-bold text-muted-foreground/40 tracking-[0.3em] uppercase -mt-1 ml-1">T-ECOSYSTEM PRO</span>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-2">
                {/* AI Tools Dropdown */}
                {hasResult && (
                    <div className="flex items-center gap-1 mr-2 p-1 rounded-xl bg-white/5 border border-white/5">
                        <PremiumButton 
                            variant="ghost"
                            size="icon" 
                            onClick={onLightingClick} 
                            title="Aydınlatma"
                            className="h-8 w-8"
                        >
                            <Sun className="h-4 w-4 text-amber-400" />
                        </PremiumButton>
                        <PremiumButton 
                            variant="ghost"
                            size="icon" 
                            onClick={onOutpaintClick} 
                            title="Outpainting"
                            className="h-8 w-8"
                        >
                            <Expand className="h-4 w-4 text-blue-400" />
                        </PremiumButton>
                        <PremiumButton 
                            variant="ghost"
                            size="icon" 
                            onClick={onStyleTransferClick} 
                            title="Style Transfer"
                            className="h-8 w-8"
                        >
                            <Palette className="h-4 w-4 text-purple-400" />
                        </PremiumButton>
                    </div>
                )}

                <PremiumButton 
                    variant="premium"
                    size="icon" 
                    onClick={onSceneClick} 
                    title="Sahne Oluştur (Çoklu Model)"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                    <Layers className="h-4 w-4" />
                </PremiumButton>

                <PremiumButton 
                    variant="glass"
                    size="icon" 
                    onClick={onBatchClick} 
                    title="Batch Render"
                >
                    <ListPlus className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </PremiumButton>

                {hasResult && (
                    <PremiumButton 
                        variant="glass"
                        size="icon" 
                        onClick={onExportClick} 
                        title="Dışa Aktar"
                    >
                        <Download className="h-4 w-4 text-muted-foreground hover:text-green-400 transition-colors" />
                    </PremiumButton>
                )}

                <PremiumButton 
                    variant="premium"
                    onClick={onGalleryClick} 
                    className="gap-2"
                >
                    <ImageIcon className="h-4 w-4" />
                    <span className="hidden md:inline uppercase tracking-widest text-[11px] font-black">Galeri</span>
                </PremiumButton>
            </div>
        </header>
    );
});
