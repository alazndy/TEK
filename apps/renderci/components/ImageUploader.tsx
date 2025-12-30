
import React, { useCallback, useRef, useState } from 'react';
import { convertPdfToImage } from '../services/pdfService';
import { Loader } from './Loader';

interface ImageUploaderProps {
    onImageSelect: (file: File) => void;
    previewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = React.memo(({ onImageSelect, previewUrl }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const processFile = async (file: File) => {
        const fileName = file.name.toLowerCase();
        
        // 3D files
        if (fileName.endsWith('.3dm') || fileName.endsWith('.obj') || fileName.endsWith('.stl') || fileName.endsWith('.step') || fileName.endsWith('.stp')) {
            onImageSelect(file);
        } else if (file.type === 'application/pdf') {
            setIsProcessing(true);
            try {
                const imageFile = await convertPdfToImage(file);
                onImageSelect(imageFile);
            } catch (error) {
                console.error(error);
                alert("PDF dönüştürülürken bir hata oluştu. Lütfen geçerli bir dosya yükleyin.");
            } finally {
                setIsProcessing(false);
            }
        } else {
            onImageSelect(file);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
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
    }, [onImageSelect, isProcessing]);

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
                    onImageSelect(file);
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
    }, [onImageSelect, isProcessing]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    };

    return (
        <div className="group">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf,.3dm,.obj,.stl,.step,.stp"
                className="hidden"
            />
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                className={`w-full h-72 relative overflow-hidden border-2 border-dashed border-white/10 rounded-3xl flex flex-col justify-center items-center cursor-pointer transition-all duration-500 bg-white/[0.02] backdrop-blur-sm group-hover:bg-white/[0.05] group-hover:border-indigo-500/50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                aria-label="Dosya yükleme alanı"
            >
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {isProcessing ? (
                     <div className="flex flex-col items-center relative z-10">
                        <Loader />
                        <p className="mt-4 text-indigo-300 font-semibold tracking-wide animate-pulse">Veri İşleniyor...</p>
                    </div>
                ) : previewUrl ? (
                    <div className="relative w-full h-full p-2">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-2xl drop-shadow-2xl" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                             <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">Değiştirmek için tıkla</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center relative z-10 p-6 transition-transform duration-300 group-hover:scale-105">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 border border-white/5 shadow-inner group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-300 group-hover:text-indigo-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-200 group-hover:text-white transition-colors">Görsel veya 3D Model</p>
                        <p className="text-sm text-gray-500 mt-2 group-hover:text-gray-400">.3dm, .obj, .stl, .pdf, .jpg, .png</p>
                    </div>
                )}
            </div>
        </div>
    );
});
