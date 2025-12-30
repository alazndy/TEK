
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ImageViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    onSelect?: () => void; // Optional prop for selection capability
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ isOpen, onClose, imageUrl, onSelect }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.002;
        setScale(prev => Math.min(Math.max(0.5, prev + delta), 5));
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const zoomIn = () => setScale(s => Math.min(s + 0.5, 5));
    const zoomOut = () => setScale(s => Math.max(s - 0.5, 0.5));
    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center overflow-hidden"
            onClick={onClose}
        >
            {/* Toolbar */}
            <div 
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-gray-800/80 backdrop-blur rounded-full px-4 py-2 border border-gray-700 shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={zoomOut} className="p-2 text-white hover:text-indigo-400 transition-colors" title="Uzaklaştır">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
                <span className="flex items-center text-sm font-mono text-gray-300 w-12 justify-center">
                    {Math.round(scale * 100)}%
                </span>
                <button onClick={zoomIn} className="p-2 text-white hover:text-indigo-400 transition-colors" title="Yakınlaştır">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                <div className="w-px bg-gray-600 mx-1"></div>
                <button onClick={resetZoom} className="p-2 text-white hover:text-indigo-400 transition-colors" title="Sıfırla">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v3.276a1 1 0 01-2 0V13.107a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-red-600/80 rounded-full transition-all"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Image Container */}
            <div 
                ref={containerRef}
                className="w-full h-full flex items-center justify-center cursor-move"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={e => e.stopPropagation()}
            >
                <img 
                    src={imageUrl} 
                    alt="Zoom View" 
                    draggable={false}
                    className="max-w-none transition-transform duration-75 select-none"
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        maxHeight: '90vh',
                        maxWidth: '90vw'
                    }} 
                />
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50 pointer-events-none">
                <div className="bg-black/50 px-4 py-1 rounded-full text-xs text-gray-400">
                    Yakınlaştırmak için tekerleği, kaydırmak için sürüklemeyi kullanın
                </div>
                {onSelect && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect();
                        }}
                        className="pointer-events-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Bu Görseli Kullan
                    </button>
                )}
            </div>
        </div>
    );
};
