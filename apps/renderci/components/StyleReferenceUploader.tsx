
import React, { useCallback, useRef, useState } from 'react';
import { convertPdfToImage } from '../services/pdfService';
import { Loader } from './Loader';

interface StyleReferenceUploaderProps {
    onFileSelect: (file: File) => void;
    onFileRemove: () => void;
    previewUrl: string | null;
}

export const StyleReferenceUploader: React.FC<StyleReferenceUploaderProps> = React.memo(({ onFileSelect, onFileRemove, previewUrl }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const processFile = async (file: File) => {
        if (file.type === 'application/pdf') {
            setIsProcessing(true);
            try {
                const imageFile = await convertPdfToImage(file);
                onFileSelect(imageFile);
            } catch (error) {
                console.error(error);
                alert("PDF stil dosyası dönüştürülürken hata oluştu.");
            } finally {
                setIsProcessing(false);
            }
        } else {
            onFileSelect(file);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
        event.target.value = '';
    };

    const handleClick = () => {
        if (!isProcessing) {
            fileInputRef.current?.click();
        }
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0];
        if (file && !isProcessing) {
            processFile(file);
        }
    }, [onFileSelect, isProcessing]);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file && !isProcessing) {
                    event.preventDefault();
                    onFileSelect(file);
                    return;
                }
            } else if (items[i].type === 'application/pdf') {
                 const file = items[i].getAsFile();
                 if (file && !isProcessing) {
                     event.preventDefault();
                     processFile(file);
                     return;
                 }
            }
        }
    }, [onFileSelect, isProcessing]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    };

    return (
        <div>
            <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 ml-1">Referans Stil Görseli (İsteğe Bağlı)</label>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
            />
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                className={`relative w-full h-32 border-2 border-dashed transition-all duration-300 flex justify-center items-center cursor-pointer overflow-hidden rounded-2xl
                    ${isProcessing ? 'border-primary/20 bg-primary/5 opacity-70 cursor-wait' : 'border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/[0.08] focus:ring-4 focus:ring-primary/10 focus:outline-none'}`}
                aria-label="Stil referans görseli yükleme alanı. Seçmek için tıklayın, sürükleyin veya yapıştırın."
            >
                {isProcessing ? (
                     <div className="flex flex-col items-center">
                        <Loader />
                        <span className="text-xs text-purple-400 mt-2">PDF İşleniyor...</span>
                    </div>
                ) : previewUrl ? (
                    <>
                        <img src={previewUrl} alt="Style Preview" className="max-h-full max-w-full object-contain rounded-md" />
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onFileRemove();
                            }}
                            className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold hover:bg-red-500 transition-colors text-sm"
                            aria-label="Remove style reference"
                        >
                            &times;
                        </button>
                    </>
                ) : (
                    <div className="text-center text-gray-400 pointer-events-none">
                        <p className="mt-1 text-sm">Stil görselini/PDF'ini sürükleyin veya yapıştırın</p>
                        <p className="text-xs text-gray-500">ya da tıklayarak seçin</p>
                    </div>
                )}
            </div>
        </div>
    );
});
