import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ProjectData, Connection } from './types';
import { WeaveNode } from './WeaveNode';
import { getRoutePath, getPortPosition } from './WeaveHelpers';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

interface WeaveCanvasViewerProps {
    projectData: ProjectData;
    className?: string;
}

export const WeaveCanvasViewer: React.FC<WeaveCanvasViewerProps> = ({ projectData, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [activePageId, setActivePageId] = useState<string>(projectData.pages[0]?.id || '');

    const activePage = projectData.pages.find(p => p.id === activePageId) || projectData.pages[0];
    
    const fitToScreen = () => {
        if (activePage && containerRef.current) {
             const rect = containerRef.current.getBoundingClientRect();
             if (rect.width === 0 || rect.height === 0) return;

             // Find bounds of content
             let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
             
             if (activePage.instances.length === 0) {
                 setScale(1);
                 setPan({ x: 0, y: 0 });
                 return;
             }
             
             activePage.instances.forEach(inst => {
                 minX = Math.min(minX, inst.x);
                 minY = Math.min(minY, inst.y);
                 const t = projectData.templates.find(x => x.id === inst.templateId);
                 maxX = Math.max(maxX, inst.x + (inst.width || t?.width || 100));
                 maxY = Math.max(maxY, inst.y + (inst.height || t?.height || 100));
             });

             // Add connections bounds check?
             // Simplification: just use instances for bounds + some padding
             
             const padding = 50;
             const contentW = maxX - minX + (padding * 2);
             const contentH = maxY - minY + (padding * 2);
             
             const scaleX = rect.width / contentW;
             const scaleY = rect.height / contentH;
             const newScale = Math.min(Math.min(scaleX, scaleY), 2); // Cap max scale
             
             setScale(newScale);
             setPan({
                 x: (rect.width - contentW * newScale) / 2 - (minX - padding) * newScale,
                 y: (rect.height - contentH * newScale) / 2 - (minY - padding) * newScale
             });
        }
    };

    // Auto-center on load and resize
    useEffect(() => {
        const obs = new ResizeObserver(() => fitToScreen());
        if (containerRef.current) {
            obs.observe(containerRef.current);
        }
        return () => obs.disconnect();
    }, [activePageId, projectData]); // Re-run if page changes

    // Initial fit
    useEffect(() => {
        // Small delay to allow modal to render
        const t = setTimeout(fitToScreen, 100);
        return () => clearTimeout(t);
    }, [activePageId]);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const ZOOM_SENSITIVITY = 0.001;
            const newScale = Math.min(Math.max(0.1, scale - e.deltaY * ZOOM_SENSITIVITY), 5);
            
            // Zoom towards mouse
            const rect = containerRef.current!.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const scaleDiff = newScale - scale;
            const newPanX = pan.x - ((mouseX - pan.x) / scale) * scaleDiff;
            const newPanY = pan.y - ((mouseY - pan.y) / scale) * scaleDiff;
            
            setScale(newScale);
            setPan({ x: newPanX, y: newPanY });
        } else {
            // Pan
            setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0 || e.button === 1) { // Left or Middle
            setIsPanning(true);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
        }
    };

    const handleMouseUp = () => setIsPanning(false);

    if (!activePage) return <div className="text-gray-500 p-4">Sayfa bulunamadı</div>;

    return (
        <div className={`flex flex-col h-full bg-zinc-950 overflow-hidden relative ${className}`}>
            {/* Grid Background */}
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)',
                    backgroundSize: `${20 * scale}px ${20 * scale}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`
                }}
            />

            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-50 flex gap-2 bg-zinc-800 p-1.5 rounded-lg border border-zinc-700 shadow-lg select-none">
                 <button onClick={() => setScale(s => Math.min(s * 1.2, 5))} className="p-2 hover:bg-zinc-700 rounded text-gray-300 transition-colors" title="Yaklaş"><ZoomIn size={18}/></button>
                 <button onClick={() => setScale(s => Math.max(s / 1.2, 0.1))} className="p-2 hover:bg-zinc-700 rounded text-gray-300 transition-colors" title="Uzaklaş"><ZoomOut size={18}/></button>
                 <button onClick={fitToScreen} className="p-2 hover:bg-zinc-700 rounded text-gray-300 transition-colors" title="Ekrana Sığdır"><Maximize size={18}/></button>
                 <div className="w-px bg-zinc-700 mx-1"></div>
                 <div className="flex items-center px-2 text-xs text-gray-400 font-mono w-[40px] justify-center">
                     {Math.round(scale * 100)}%
                 </div>
            </div>

            {/* Canvas Area */}
            <div 
                ref={containerRef}
                className={`flex-1 overflow-hidden cursor-${isPanning ? 'grabbing' : 'grab'}`}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div 
                    style={{ 
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        width: '100%', height: '100%' 
                    }}
                    className="relative"
                >
                     {/* Instances */}
                     {activePage.instances.map(inst => {
                         const t = projectData.templates.find(x => x.id === inst.templateId);
                         if (!t) return null;
                         return <WeaveNode key={inst.id} inst={inst} template={t} />;
                     })}

                     {/* Connections */}
                     <svg className="absolute top-0 left-0 overflow-visible pointer-events-none" style={{ width: 1, height: 1 }}>
                        <defs>
                             <marker id="arrow-end" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                                 <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                             </marker>
                        </defs>
                        {activePage.connections.map(conn => {
                            const fromInst = activePage.instances.find(i => i.id === conn.fromInstanceId);
                            const toInst = activePage.instances.find(i => i.id === conn.toInstanceId);
                            const fromTemp = projectData.templates.find(t => t.id === fromInst?.templateId);
                            const toTemp = projectData.templates.find(t => t.id === toInst?.templateId);
                            
                            if (!fromInst || !toInst || !fromTemp || !toTemp) return null;

                            const startPos = getPortPosition(fromInst, fromTemp, conn.fromPortId);
                            const endPos = getPortPosition(toInst, toTemp, conn.toPortId);
                            
                            const d = getRoutePath(startPos, endPos, conn.shape, conn.controlPoints || []);
                            
                            return (
                                <g key={conn.id}>
                                    {/* Outline for better visibility on dark grid */}
                                    <path 
                                        d={d}
                                        stroke="#000000"
                                        strokeWidth="4"
                                        fill="none"
                                        className="opacity-50"
                                    />
                                    <path 
                                        d={d}
                                        stroke={conn.color || '#6366f1'}
                                        strokeWidth="2"
                                        fill="none"
                                        markerEnd="url(#arrow-end)"
                                        className="opacity-90"
                                    />
                                </g>
                            );
                        })}
                     </svg>
                </div>
            </div>
            
            {/* Page Selector (if multiple) */}
            {projectData.pages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-800 p-1 rounded-full border border-zinc-700 flex gap-1 z-50">
                    {projectData.pages.map((p, i) => (
                        <button
                            key={p.id}
                            onClick={() => setActivePageId(p.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activePageId === p.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            {p.name || `Sayfa ${i+1}`}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
