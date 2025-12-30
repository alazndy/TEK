
import React, { useRef, useEffect, MouseEvent, useState, useCallback } from 'react';
import { Loader } from './Loader';
import { Point, Rect, SelectionTool, Layer } from '../types';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    tool: SelectionTool;
    setTool: (tool: SelectionTool) => void;
    layers: Layer[];
    setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
    activeLayerId: string | null;
    setActiveLayerId: (id: string | null) => void;
    onSubmit: (maskedImageFile: File, compositePrompt: string) => void;
    isLoading: boolean;
}

export const ImageModal: React.FC<ImageModalProps> = ({
    isOpen,
    onClose,
    imageUrl,
    tool,
    setTool,
    layers,
    setLayers,
    activeLayerId,
    setActiveLayerId,
    onSubmit,
    isLoading
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [imageRenderInfo, setImageRenderInfo] = useState({ drawWidth: 0, drawHeight: 0, offsetX: 0, offsetY: 0 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    
    // Draw all layers on canvas, highlighting the active one
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;
        if (!canvas || !ctx || !img || !img.complete || img.naturalWidth === 0) return;

        const container = canvas.parentElement as HTMLElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const canvasAspect = canvas.width / canvas.height;
        const imageAspect = img.naturalWidth / img.naturalHeight;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        if (canvasAspect > imageAspect) {
            drawHeight = canvas.height;
            drawWidth = drawHeight * imageAspect;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            drawWidth = canvas.width;
            drawHeight = drawWidth / imageAspect;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        }

        setImageRenderInfo({ drawWidth, drawHeight, offsetX, offsetY });
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        const scaleX = drawWidth / img.naturalWidth;
        const scaleY = drawHeight / img.naturalHeight;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scaleX, scaleY);
        
        layers.forEach(layer => {
            const isActive = layer.id === activeLayerId;
            ctx.strokeStyle = isActive ? 'rgba(59, 130, 246, 0.9)' : 'rgba(236, 72, 153, 0.6)';
            ctx.fillStyle = isActive ? 'rgba(59, 130, 246, 0.5)' : 'rgba(236, 72, 153, 0.3)';
            ctx.lineWidth = 2 / Math.min(scaleX, scaleY);

            layer.selectionRects.forEach(rect => {
                ctx.beginPath();
                ctx.rect(rect.x, rect.y, rect.width, rect.height);
                ctx.stroke();
                ctx.fill();
            });
            
            layer.lassoPaths.forEach(path => {
                if (path.length < 2) return;
                ctx.beginPath();
                ctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
                if (path.length > 2) ctx.closePath();
                ctx.stroke();
                ctx.fill();
            });
        });

        ctx.restore();
    }, [layers, activeLayerId]);

    // Setup and redraw effects
    useEffect(() => {
        if (!isOpen) return;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        imageRef.current = img;
        img.onload = drawCanvas;
        const canvasElement = canvasRef.current?.parentElement;
        if (!canvasElement) return;
        const resizeObserver = new ResizeObserver(drawCanvas);
        resizeObserver.observe(canvasElement);
        return () => resizeObserver.disconnect();
    }, [isOpen, imageUrl, drawCanvas]);

    useEffect(drawCanvas, [layers, activeLayerId, drawCanvas]);

    // Modal accessibility
    useEffect(() => {
        if (!isOpen) return;
        const previouslyFocusedElement = document.activeElement as HTMLElement;
        modalRef.current?.focus();
        const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previouslyFocusedElement?.focus();
        };
    }, [isOpen, onClose]);
    
    // Apply grabbing cursor style to body when dragging
    useEffect(() => {
        if (draggedLayerId) {
            document.body.style.cursor = 'grabbing';
            document.body.classList.add('no-select'); // Optional: prevent text selection
        } else {
            document.body.style.cursor = 'default';
            document.body.classList.remove('no-select');
        }
        return () => { 
            document.body.style.cursor = 'default';
            document.body.classList.remove('no-select');
        };
    }, [draggedLayerId]);

    // Mouse drawing handlers
    const getPointFromEvent = (e: MouseEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const { drawWidth, drawHeight, offsetX, offsetY } = imageRenderInfo;
        const scaleX = img.naturalWidth / drawWidth;
        const scaleY = img.naturalHeight / drawHeight;
        const canvasX = e.clientX - rect.left - offsetX;
        const canvasY = e.clientY - rect.top - offsetY;
        return { x: canvasX * scaleX, y: canvasY * scaleY };
    };

    const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
        if (!activeLayerId) return;
        setIsDrawing(true);
        const startPoint = getPointFromEvent(e);
        setLayers(currentLayers => currentLayers.map(layer => {
            if (layer.id !== activeLayerId) return layer;
            if (tool === 'box') {
                return { ...layer, selectionRects: [...layer.selectionRects, { ...startPoint, width: 0, height: 0 }] };
            }
            return { ...layer, lassoPaths: [...layer.lassoPaths, [startPoint]] };
        }));
    };

    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !activeLayerId) return;
        const currentPoint = getPointFromEvent(e);
        setLayers(currentLayers => currentLayers.map(layer => {
            if (layer.id !== activeLayerId) return layer;

            if (tool === 'box') {
                const rects = layer.selectionRects;
                if (rects.length === 0) return layer;
                const lastRect = rects[rects.length - 1];
                const newRect = { ...lastRect, width: currentPoint.x - lastRect.x, height: currentPoint.y - lastRect.y };
                return { ...layer, selectionRects: [...rects.slice(0, rects.length - 1), newRect] };
            }

            const paths = layer.lassoPaths;
            if (paths.length === 0) return layer;
            const lastPath = paths[paths.length - 1];
            const newPath = [...lastPath, currentPoint];
            return { ...layer, lassoPaths: [...paths.slice(0, paths.length - 1), newPath] };
        }));
    };

    const handleMouseUp = () => {
        if (isDrawing && tool === 'box') {
            setLayers(currentLayers => currentLayers.map(layer => {
                if (layer.id !== activeLayerId) return layer;
                const rects = layer.selectionRects;
                if (rects.length === 0) return layer;
                const lastRect = rects[rects.length - 1];
                if (!lastRect) return layer;
                const normalizedRect = {
                    x: Math.min(lastRect.x, lastRect.x + lastRect.width),
                    y: Math.min(lastRect.y, lastRect.y + lastRect.height),
                    width: Math.abs(lastRect.width),
                    height: Math.abs(lastRect.height),
                };
                return { ...layer, selectionRects: [...rects.slice(0, -1), normalizedRect] };
            }));
        }
        setIsDrawing(false);
    };

    // Layer management functions
    const addLayer = () => {
        const newId = `layer_${Date.now()}`;
        const newLayer: Layer = { id: newId, prompt: '', selectionRects: [], lassoPaths: [] };
        setLayers(current => [...current, newLayer]);
        setActiveLayerId(newId);
    };
    
    const removeLayer = (id: string) => {
        setLayers(current => current.filter(l => l.id !== id));
        if (activeLayerId === id) {
            const remainingLayers = layers.filter(l => l.id !== id);
            setActiveLayerId(remainingLayers.length > 0 ? remainingLayers[remainingLayers.length-1].id : null);
        }
    };
    
    const duplicateLayer = (id: string) => {
        const layerToDuplicate = layers.find(l => l.id === id);
        if (!layerToDuplicate) return;
        const newLayer = { ...layerToDuplicate, id: `layer_${Date.now()}` };
        const index = layers.findIndex(l => l.id === id);
        setLayers(current => {
            const newLayers = [...current];
            newLayers.splice(index + 1, 0, newLayer);
            return newLayers;
        });
        setActiveLayerId(newLayer.id);
    };

    const updateLayerPrompt = (id: string, newPrompt: string) => {
        setLayers(current => current.map(l => l.id === id ? { ...l, prompt: newPrompt } : l));
    };

    // --- Enhanced Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedLayerId(id);
        e.dataTransfer.effectAllowed = 'move';
        // Hide default drag preview for a cleaner look
        const emptyNode = document.createElement('div');
        e.dataTransfer.setDragImage(emptyNode, 0, 0);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        const draggedItemIndex = layers.findIndex(l => l.id === draggedLayerId);
        if (draggedItemIndex !== index) {
            setDropIndex(index);
        }
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (draggedLayerId === null || dropIndex === null) return;
        const sourceIndex = layers.findIndex(l => l.id === draggedLayerId);
        if (sourceIndex === -1 || sourceIndex === dropIndex) return;

        setLayers(current => {
            const reordered = [...current];
            const [item] = reordered.splice(sourceIndex, 1);
            reordered.splice(dropIndex, 0, item);
            return reordered;
        });
        
        setDraggedLayerId(null);
        setDropIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedLayerId(null);
        setDropIndex(null);
    };
    
    const handleDragLeaveContainer = () => {
        setDropIndex(null);
    };

    // Submit handler
    const handleSubmit = () => {
        const img = imageRef.current;
        if (!img) return;

        const promptParts = layers.map((layer, index) => {
            const orderHint = layers.length > 1 ? (index === 0 ? "(En Arka) " : (index === layers.length - 1 ? "(En Ön) " : "")) : "";
            return `${orderHint}Katman ${index + 1}: ${layer.prompt}`;
        });
        const compositePrompt = promptParts.join('\n');

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = img.naturalWidth;
        maskCanvas.height = img.naturalHeight;
        const ctx = maskCanvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0);
        ctx.fillStyle = 'rgb(255, 0, 255)';

        layers.forEach(layer => {
            layer.selectionRects.forEach(rect => rect && ctx.fillRect(rect.x, rect.y, rect.width, rect.height));
            layer.lassoPaths.forEach(path => {
                if (path.length < 3) return;
                ctx.beginPath();
                ctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
                ctx.closePath();
                ctx.fill();
            });
        });
        
        maskCanvas.toBlob((blob) => {
            if (blob) {
                const maskedFile = new File([blob], "masked_image.png", { type: "image/png" });
                onSubmit(maskedFile, compositePrompt);
            }
        }, 'image/png', 1);
    };
    
    if (!isOpen) return null;

    const hasSelection = layers.some(l => l.selectionRects.length > 0 || l.lassoPaths.length > 0);
    const hasPromptForSelection = layers.every(l => (l.selectionRects.length > 0 || l.lassoPaths.length > 0) ? l.prompt.trim() !== '' : true);
    const isSubmittable = hasSelection && hasPromptForSelection && !isLoading;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                ref={modalRef}
                className="bg-gray-900 w-full h-full max-w-7xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden" 
                onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1}
            >
                <header className="p-4 border-b-2 border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 id="modal-title" className="text-xl font-bold text-purple-400">Görseli Katmanlarla Düzenle</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="Kapat">&times;</button>
                </header>
                <div className="flex-grow flex flex-col md:flex-row p-4 gap-4 min-h-0">
                    <div className="flex-grow relative h-full w-full md:w-3/4 bg-black/20 rounded-lg">
                       <canvas ref={canvasRef} className="w-full h-full object-contain cursor-crosshair" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
                    </div>
                    <div className="w-full md:w-1/4 flex flex-col space-y-4 flex-shrink-0">
                        <div className="flex gap-2">
                           <button onClick={() => setTool('box')} className={`w-full py-2 rounded-lg font-semibold transition-colors ${tool === 'box' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Kutu</button>
                           <button onClick={() => setTool('lasso')} className={`w-full py-2 rounded-lg font-semibold transition-colors ${tool === 'lasso' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Kement</button>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-300">Katmanlar (Arkadan Öne)</h3>
                        <div 
                            className="flex-grow space-y-2 overflow-y-auto pr-2 -mr-2"
                            onDrop={handleDrop}
                            onDragLeave={handleDragLeaveContainer}
                        >
                            {layers.map((layer, index) => (
                                <React.Fragment key={layer.id}>
                                    {dropIndex === index && draggedLayerId !== layer.id && <div className="h-1.5 my-1 bg-indigo-500 rounded-full" />}
                                    <div
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, layer.id)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`transition-opacity ${draggedLayerId === layer.id ? 'opacity-30' : 'opacity-100'}`}
                                    >
                                        <div onClick={() => setActiveLayerId(layer.id)} className={`p-2 rounded-lg cursor-pointer transition-colors border-2 ${activeLayerId === layer.id ? 'bg-indigo-900/50 border-indigo-500' : 'bg-gray-800/70 border-gray-700 hover:border-gray-600'}`}>
                                            <div className="flex items-start gap-2">
                                                <div
                                                    className="pt-1 cursor-grab touch-none text-gray-500"
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zM4 9a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" transform="rotate(90 10 10)" />
                                                    </svg>
                                                </div>
                                                <textarea value={layer.prompt} onChange={(e) => updateLayerPrompt(layer.id, e.target.value)} placeholder={`Katman ${index + 1} için talimat...`} className="w-full h-20 p-2 text-sm bg-gray-900/50 border border-gray-600 rounded-md resize-none focus:ring-1 focus:ring-indigo-400" />
                                                <div className="flex flex-col gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }} className="p-1 rounded bg-teal-800 hover:bg-teal-700" aria-label="Katmanı kopyala" title="Kopyala">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }} className="p-1 rounded bg-red-800 hover:bg-red-700" aria-label="Katmanı sil" title="Sil">&times;</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            ))}
                            {/* This is to allow dropping at the very end of the list */}
                            <div onDragOver={(e) => handleDragOver(e, layers.length)} className="h-2">
                                {dropIndex === layers.length && <div className="h-1.5 my-1 bg-indigo-500 rounded-full" />}
                            </div>
                        </div>
                        <button onClick={addLayer} className="w-full py-2 rounded-lg font-semibold transition-colors bg-teal-600 hover:bg-teal-500">Yeni Katman Ekle</button>
                        <div className="flex-grow"></div>
                        <div className="flex justify-center gap-4">
                           <button onClick={onClose} disabled={isLoading} className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 disabled:bg-gray-700 w-full">İptal</button>
                           <button onClick={handleSubmit} disabled={!isSubmittable} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full">
                              {isLoading ? (<><Loader /><span>Düzeltiliyor...</span></>) : 'Seçimi Düzelt'}
                           </button>
                       </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
