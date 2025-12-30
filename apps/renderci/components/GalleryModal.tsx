
import React, { useEffect, useRef, useState } from 'react';
import { ImageViewerModal } from './ImageViewerModal';

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    onImageSelect: (imageUrl: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = React.memo(({ isOpen, onClose, images, onImageSelect }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [viewedImage, setViewedImage] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocusedElement = document.activeElement as HTMLElement;
        closeButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (viewedImage) {
                    setViewedImage(null); // If viewer is open, just close viewer
                    event.stopPropagation();
                } else {
                    onClose(); // Else close gallery
                }
            }
            if (event.key === 'Tab' && !viewedImage) {
                const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                    'button, [href], [tabindex]:not([tabindex="-1"])'
                );
                if (!focusableElements || focusableElements.length === 0) return;

                const imageElements = Array.from(modalRef.current?.querySelectorAll<HTMLDivElement>('[role="button"]'));
                const allFocusable = [closeButtonRef.current, ...imageElements].filter(Boolean) as HTMLElement[];
                
                if(allFocusable.length === 0) return;

                const firstElement = allFocusable[0];
                const lastElement = allFocusable[allFocusable.length - 1];

                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        event.preventDefault();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previouslyFocusedElement?.focus();
        };
    }, [isOpen, onClose, viewedImage]);

    if (!isOpen) return null;

    const handleImageClick = (imageUrl: string) => {
        // Instead of selecting immediately, open the viewer
        setViewedImage(imageUrl);
    };

    const handleConfirmSelection = () => {
        if (viewedImage) {
            onImageSelect(viewedImage);
            setViewedImage(null);
        }
    };

    const handleImageKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, imageUrl: string) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setViewedImage(imageUrl);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div 
                    ref={modalRef}
                    className="bg-gray-900 w-full h-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden" 
                    onClick={e => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="gallery-title"
                >
                    <header className="p-4 border-b-2 border-gray-700 flex justify-between items-center flex-shrink-0">
                        <h2 id="gallery-title" className="text-xl font-bold text-purple-400">Kaydedilen Renderlar</h2>
                        <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                    </header>
                    <div className="flex-grow p-4 overflow-y-auto">
                        {images.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-400">Henüz kaydedilmiş render bulunmuyor.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map((imgSrc, index) => (
                                    <div 
                                        key={index} 
                                        className="aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-500 relative"
                                        onClick={() => handleImageClick(imgSrc)}
                                        onKeyDown={(e) => handleImageKeyDown(e, imgSrc)}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Render ${index + 1} incele`}
                                    >
                                        <img 
                                            src={imgSrc} 
                                            alt={`Render ${index + 1}`} 
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Viewer Modal overlaid on top of Gallery */}
            <ImageViewerModal 
                isOpen={!!viewedImage}
                onClose={() => setViewedImage(null)}
                imageUrl={viewedImage || ''}
                onSelect={handleConfirmSelection}
            />
        </>
    );
});
