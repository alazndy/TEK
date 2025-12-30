import React from 'react';
import { StyleReferenceUploader } from './StyleReferenceUploader';
import { StylePresetSelector } from './StylePresetSelector';
import { PromptLibraryModal } from './PromptLibraryModal';
import { MaterialPalette } from './MaterialPalette';
import { StylePreset, SavedPrompt } from '../types';
import { Rocket, Sparkles, Book, RefreshCcw, Loader2 } from 'lucide-react';
import { PremiumButton } from './ui/PremiumButton';
import { motion } from 'framer-motion';

interface InputPanelProps {
    stylePreviewUrl: string | null;
    onStyleFileSelect: (file: File) => void;
    onStyleFileRemove: () => void;
    selectedStylePreset: StylePreset | null;
    onSelectPreset: (preset: StylePreset | null) => void;
    prompt: string;
    setPrompt: React.Dispatch<React.SetStateAction<string>>;
    onPromptKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onRender: () => void;
    isLoading: boolean;
    loadingMessage?: string;
    resultImageUrl: string | null;
    onShowResult: () => void;
    savedPrompts: SavedPrompt[];
    onSavePrompt: (title: string, content: string) => void;
    onDeletePrompt: (id: number) => void;
    isPromptLibOpen: boolean;
    onOpenPromptLib: () => void;
    onClosePromptLib: () => void;
    onNewFile: () => void;
    onAddToQueue: () => void;
}

export const InputPanel: React.FC<InputPanelProps> = React.memo(({
    stylePreviewUrl,
    onStyleFileSelect,
    onStyleFileRemove,
    selectedStylePreset,
    onSelectPreset,
    prompt,
    setPrompt,
    onPromptKeyDown,
    onRender,
    isLoading,
    loadingMessage = "İşleniyor...",
    resultImageUrl,
    onShowResult,
    savedPrompts,
    onSavePrompt,
    onDeletePrompt,
    isPromptLibOpen,
    onOpenPromptLib,
    onClosePromptLib,
    onNewFile,
    onAddToQueue
}) => {

    const handleAddMaterial = (materialText: string) => {
        setPrompt((prev) => {
            const separator = prev.trim().length > 0 ? ', ' : '';
            return `${prev.trim()}${separator}${materialText}`;
        });
    };

    return (
        <div className="space-y-8 pb-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <StyleReferenceUploader 
                    onFileSelect={onStyleFileSelect}
                    onFileRemove={onStyleFileRemove}
                    previewUrl={stylePreviewUrl}
                />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <StylePresetSelector 
                    selectedPreset={selectedStylePreset}
                    onSelectPreset={onSelectPreset}
                />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <MaterialPalette onAddMaterial={handleAddMaterial} />
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.4 }}
                className="glass-panel p-6 rounded-3xl border-white/5 shadow-2xl relative bg-slate-900/40"
            >
                <div className="flex justify-between items-center mb-4">
                    <label htmlFor="prompt" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Ekstra Talimatlar</label>
                    <PremiumButton 
                        variant="glass" 
                        size="sm" 
                        onClick={onOpenPromptLib}
                        className="gap-2 px-4 h-9"
                    >
                        <Book size={14} className="text-primary" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Kütüphane</span>
                    </PremiumButton>
                </div>
                
                <div className="relative group">
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={onPromptKeyDown}
                        placeholder="Örn: Cyberpunk şehir, neon ışıklar, yağmurlu atmosfer..."
                        className="w-full h-36 p-5 bg-background/50 border border-white/5 rounded-2xl text-foreground placeholder-white/20 focus:outline-none focus:border-primary/50 transition-all resize-none leading-relaxed text-sm font-medium"
                    />
                </div>
            </motion.div>

            <div className="flex flex-col gap-4">
                <PremiumButton
                    variant="premium"
                    size="lg"
                    onClick={onRender}
                    disabled={isLoading}
                    className="w-full relative group"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-3">
                             <Loader2 className="w-5 h-5 animate-spin" /> 
                             <span className="truncate">{loadingMessage}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            {resultImageUrl ? <Sparkles className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
                            <span className="uppercase tracking-[0.1em]">{resultImageUrl ? 'Yeniden Render' : 'Başlat Render'}</span>
                        </div>
                    )}
                </PremiumButton>

                {!resultImageUrl && (
                    <PremiumButton
                        variant="glass"
                        size="lg"
                        onClick={onAddToQueue}
                        disabled={isLoading}
                        className="w-full"
                    >
                        <span className="uppercase tracking-[0.1em] text-xs">Kuyruğa Ekle (Batch)</span>
                    </PremiumButton>
                )}


                {resultImageUrl && (
                    <PremiumButton
                        variant="glass"
                        size="lg"
                        onClick={onShowResult}
                        disabled={isLoading}
                        className="w-full"
                    >
                        Sonucu Görüntüle
                    </PremiumButton>
                )}
                
                <div className="pt-4 flex justify-center">
                    <button 
                        onClick={onNewFile} 
                        className="flex items-center gap-2 text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-[0.2em] transition-colors py-2 px-4 rounded-xl hover:bg-red-500/5 border border-transparent hover:border-red-500/10"
                    >
                        <RefreshCcw size={12} />
                        Görseli Değiştir
                    </button>
                </div>
            </div>

            <PromptLibraryModal
                isOpen={isPromptLibOpen}
                onClose={onClosePromptLib}
                savedPrompts={savedPrompts}
                currentPrompt={prompt}
                onSaveCurrent={onSavePrompt}
                onDelete={onDeletePrompt}
                onSelect={setPrompt}
            />
        </div>
    );
});