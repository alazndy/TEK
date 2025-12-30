
import React from 'react';

interface HistoryThumbnailsProps {
    historyStack: string[];
    currentIndex: number;
    onThumbnailClick: (index: number) => void;
}

export const HistoryThumbnails: React.FC<HistoryThumbnailsProps> = React.memo(({ historyStack, currentIndex, onThumbnailClick }) => {
    if (historyStack.length <= 1) return null;

    return (
        <div className="w-full">
            <div className="flex space-x-3 p-2 bg-gray-900/50 rounded-lg overflow-x-auto scrollbar-thin">
                {historyStack.map((thumbUrl, index) => (
                    <div
                        key={index}
                        onClick={() => onThumbnailClick(index)}
                        className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                            currentIndex === index ? 'border-indigo-500 scale-105' : 'border-transparent hover:border-gray-500'
                        }`}
                        role="button"
                        aria-label={`Varyasyon ${index + 1}`}
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onThumbnailClick(index)}
                    >
                        <img src={thumbUrl} alt={`Varyasyon ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-tl-md">
                            {index + 1}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
