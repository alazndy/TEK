
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface CompareSliderProps {
    beforeImage: string;
    afterImage: string;
    className?: string;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({ beforeImage, afterImage, className = '' }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback(() => setIsResizing(true), []);
    const handleMouseUp = useCallback(() => setIsResizing(false), []);

    const handleMove = useCallback((clientX: number) => {
        if (!isResizing || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    }, [isResizing]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => handleMove(e.clientX), [handleMove]);
    const handleTouchMove = useCallback((e: React.TouchEvent) => handleMove(e.touches[0].clientX), [handleMove]);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchend', handleMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [handleMouseUp]);

    return (
        <div 
            ref={containerRef}
            className={`relative w-full h-full select-none overflow-hidden group cursor-col-resize ${className}`}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            {/* After Image (Background/Full) */}
            <img 
                src={afterImage} 
                alt="After" 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" 
                draggable={false}
            />

            {/* Label After */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10 z-10 pointer-events-none">
                SONRA
            </div>

            {/* Before Image (Clipped) */}
            <div 
                className="absolute inset-0 h-full overflow-hidden pointer-events-none select-none"
                style={{ width: `${sliderPosition}%` }}
            >
                <img 
                    src={beforeImage} 
                    alt="Before" 
                    className="absolute inset-0 w-full h-full object-contain max-w-none" 
                    style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
                    draggable={false}
                />
                 {/* Label Before */}
                <div className="absolute top-4 left-4 bg-indigo-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10 z-20">
                    ÖNCE
                </div>
            </div>

            {/* Slider Handle */}
            <div 
                className="absolute inset-y-0 w-1 bg-white cursor-col-resize z-30 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl transform transition-transform hover:scale-110 active:scale-95 text-indigo-900">
                    <MoveHorizontal size={20} strokeWidth={3} />
                </div>
            </div>
        </div>
    );
};
