
import React, { useRef } from 'react';
import { 
    Globe, 
    Settings, 
    Undo2, 
    RefreshCw, 
    Sparkles, 
    Dices, 
    Axis3d, 
    Palette, 
    Download,
    Wand2,
    FolderUp,
    Zap
} from 'lucide-react';

interface ResultActionsProps {
    onEnterExplorer: () => void;
    onGoBack: () => void;
    onUndo: () => void;
    onRegenerate: () => void;
    onGenerateFromSource: () => void;
    onGenerateVariations: () => void;
    onGenerateDifferentAngle: (file: File) => void;
    onUpscale: () => void;
    onEdit: () => void;
    onDownload: () => void;
    onNewFile: () => void;
    isLoading: boolean;
    canUndo: boolean;
    onSaveToUPH?: () => void;
}

type ActionButtonProps = {
    onClick: () => void;
    disabled: boolean;
    className?: string;
    children?: React.ReactNode;
    colorClass: string;
};

const ActionButton = ({ onClick, disabled, className, children, colorClass }: ActionButtonProps) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`px-5 py-3 text-white font-bold rounded-xl transition-all duration-300 text-sm md:text-base border border-white/10 shadow-lg backdrop-blur-sm relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-1 ${colorClass} ${className || ''}`}
    >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10 flex items-center gap-2">{children}</div>
    </button>
);

export const ResultActions: React.FC<ResultActionsProps> = React.memo(({
    onEnterExplorer,
    onGoBack,
    onUndo,
    onRegenerate,
    onGenerateFromSource,
    onGenerateVariations,
    onGenerateDifferentAngle,
    onUpscale,
    onEdit,
    onDownload,
    onNewFile,
    isLoading,
    canUndo,
    onSaveToUPH
}) => {
    const angleInputRef = useRef<HTMLInputElement>(null);

    const handleAngleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onGenerateDifferentAngle(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    return (
        <div className="flex justify-center flex-wrap gap-4 pb-6">
             <input
                type="file"
                ref={angleInputRef}
                onChange={handleAngleFileSelect}
                accept="image/*"
                className="hidden"
            />

            <ActionButton 
                onClick={onNewFile}
                disabled={isLoading}
                colorClass="bg-red-600/20 hover:bg-red-600/40 text-red-100 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] border-red-500/30"
            >
                <FolderUp className="w-5 h-5" /> Yeni Dosya
            </ActionButton>
            
            <ActionButton 
                onClick={onEnterExplorer} 
                disabled={isLoading}
                colorClass="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-100 hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] border-cyan-500/30"
            >
                <Globe className="w-5 h-5" /> 3D Keşfet
            </ActionButton>

            <ActionButton 
                onClick={onGoBack} 
                disabled={isLoading}
                colorClass="bg-slate-700/40 hover:bg-slate-700/60 hover:shadow-[0_0_15px_rgba(148,163,184,0.2)]"
            >
                <Settings className="w-5 h-5" /> Ayarlar
            </ActionButton>

            <ActionButton 
                onClick={onUndo} 
                disabled={isLoading || !canUndo}
                colorClass="bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-100 hover:shadow-[0_0_20px_rgba(202,138,4,0.4)] border-yellow-500/30"
            >
                <Undo2 className="w-5 h-5" /> Geri Al
            </ActionButton>

            <ActionButton 
                onClick={onUpscale}
                disabled={isLoading}
                colorClass="bg-fuchsia-600/30 hover:bg-fuchsia-600/50 text-fuchsia-100 hover:shadow-[0_0_25px_rgba(192,38,211,0.5)] border-fuchsia-500/50"
            >
                <Wand2 className="w-5 h-5" /> Magic Upscale
            </ActionButton>

            <ActionButton 
                onClick={onRegenerate}
                disabled={isLoading}
                colorClass="bg-teal-600/20 hover:bg-teal-600/40 text-teal-100 hover:shadow-[0_0_20px_rgba(13,148,136,0.4)] border-teal-500/30"
            >
                <RefreshCw className="w-5 h-5" /> Tekrar
            </ActionButton>

            <ActionButton 
                onClick={onGenerateFromSource}
                disabled={isLoading}
                colorClass="bg-blue-600/20 hover:bg-blue-600/40 text-blue-100 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] border-blue-500/30"
            >
                <Sparkles className="w-5 h-5" /> Yeni Render
            </ActionButton>

            <ActionButton 
                onClick={onGenerateVariations}
                disabled={isLoading}
                colorClass="bg-purple-600/20 hover:bg-purple-600/40 text-purple-100 hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] border-purple-500/30"
            >
                <Dices className="w-5 h-5" /> Varyasyon
            </ActionButton>

            <ActionButton 
                onClick={() => angleInputRef.current?.click()}
                disabled={isLoading}
                colorClass="bg-orange-600/20 hover:bg-orange-600/40 text-orange-100 hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] border-orange-500/30"
            >
                <Axis3d className="w-5 h-5" /> Farklı Açı
            </ActionButton>

            <ActionButton 
                onClick={onEdit} 
                disabled={isLoading}
                colorClass="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-100 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] border-indigo-500/30"
            >
                <Palette className="w-5 h-5" /> Düzenle
            </ActionButton>

            <ActionButton 
                onClick={onDownload} 
                disabled={isLoading}
                colorClass="bg-green-600/20 hover:bg-green-600/40 text-green-100 hover:shadow-[0_0_20px_rgba(22,163,74,0.4)] border-green-500/30"
            >
                <Download className="w-5 h-5" /> İndir
            </ActionButton>

            {onSaveToUPH && (
                <ActionButton 
                    onClick={onSaveToUPH} 
                    disabled={isLoading}
                    colorClass="bg-primary/20 hover:bg-primary/40 text-primary-foreground hover:shadow-primary/40 border-primary/30"
                >
                    <Zap className="w-5 h-5" /> UPH'a Kaydet
                </ActionButton>
            )}
        </div>
    );
});
