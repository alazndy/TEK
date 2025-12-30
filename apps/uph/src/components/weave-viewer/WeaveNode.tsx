import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ProductInstance, ProductTemplate } from './types';

interface WeaveNodeProps {
    inst: ProductInstance;
    template: ProductTemplate;
}

const CONNECTOR_LABELS: Record<string, string> = {
    'terminal': 'Terminal Blok',
    'rj45': 'RJ45 Ethernet',
    'usb-a': 'USB Type-A',
    'usb-c': 'USB Type-C',
    'hdmi': 'HDMI',
    'power-ac': 'AC Güç',
    'power-dc': 'DC Güç',
    'audio-jack': '3.5mm Jack',
    'db9': 'DB9 Seri',
    'none': 'Pin / Lehim',
    'generic': 'Genel'
};

export const WeaveNode: React.FC<WeaveNodeProps> = ({ inst, template }) => {
    const w = inst.width || template.width;
    const h = inst.height || template.height;
    const r = inst.rotation || 0;
    
    // Label Logic
    const labelConfig = inst.labelConfig || { visible: true, fontSize: 14, color: '#ffffff', backgroundColor: '#000000', position: 'bottom' };
    const labelVisible = labelConfig.visible !== false;
    const labelPos = labelConfig.position || 'bottom';
    

    return (
        <div
            className={cn(
                "flex items-center justify-center pointer-events-none absolute z-10",
                `left-[${inst.x}px]`,
                `top-[${inst.y}px]`,
                `w-[${w}px]`,
                `h-[${h}px]`
            )}
        >
            <div
                className={cn(
                    "relative w-full h-full group",
                    `rotate-[${r}deg]`
                )}
            >
                {/* Border/Container on Hover */}
                <div className="absolute inset-0 border border-transparent group-hover:border-blue-500/50 transition-colors rounded-sm pointer-events-none" />

                <Image 
                    src={template.imageUrl} 
                    alt={template.name} 
                    fill
                    className={cn(
                        "object-contain select-none p-1",
                        inst.mirrored && "scale-x-[-1]"
                    )}
                    draggable={false}
                    sizes={`${w}px`}
                />
                
                {/* Ports */}
                {template.ports.map(port => {
                    let portX = port.x;
                    if (inst.mirrored) portX = 100 - portX;
                    
                    // Color Logic matching Weave
                    // Note: Simplified for Viewer, assuming no customColor prop unless passed in template (not inst)
                    // Weave ProductNode uses: startPort logic (not relevant here) & type logic
                    let bg = '#14b8a6'; // Default Teal (Bi/Generic)
                    if (port.type === 'input') bg = '#3b82f6'; // Blue
                    else if (port.type === 'output') bg = '#ef4444'; // Red
                    if (port.isGround) bg = '#52525b'; // Zinc-600
                    
                    return (
                        <div
                            key={port.id}
                            className={cn(
                                "absolute w-4 h-4 -ml-2 -mt-2 border border-zinc-900 rounded-full z-20 shadow-sm flex items-center justify-center group/port pointer-events-auto hover:scale-125 transition-transform cursor-help",
                                `left-[${portX}%]`,
                                `top-[${port.y}%]`,
                                `bg-[${bg}]`
                            )}
                        >
                             <div className="w-1.5 h-1.5 bg-black/30 rounded-full" />
                             
                             {/* Tooltip */}
                             <div 
                                className={cn(
                                    "absolute left-1/2 -translate-x-1/2 -top-10 bg-zinc-900/95 border border-zinc-700 px-3 py-1.5 rounded text-xs text-white whitespace-nowrap hidden group-hover/port:block z-60 shadow-xl pointer-events-none",
                                    `rotate-[${-r}deg]`
                                )}
                             >
                                <div className="font-bold text-center">{port.label}</div>
                                <div className="text-[10px] text-zinc-400 text-center">{CONNECTOR_LABELS[port.connectorType] || port.connectorType}</div>
                                {port.isPower && (
                                    <div className={`text-[9px] font-mono font-bold mt-0.5 pt-0.5 border-t border-zinc-700 ${port.isGround ? 'text-zinc-400' : 'text-yellow-400'}`}>
                                        {port.isGround ? 'GND' : `${port.voltage}V`}
                                    </div>
                                )}
                             </div>
                        </div>
                    );
                })}


                {/* Label (Always visible if configured) */}
                {labelVisible && (
                    <div 
                        className={cn(
                            "absolute font-bold text-center py-1 px-3 rounded pointer-events-none whitespace-nowrap shadow-sm z-40 transition-opacity group-hover:opacity-100 opacity-0 bg-black/80 border border-white/10 text-white -translate-x-1/2 -translate-y-1/2",
                            `text-[${labelConfig.fontSize}px]`,
                            labelPos === 'top' ? "top-[-25px]" : labelPos === 'center' ? "top-[50%]" : "top-[calc(100%+15px)]",
                            "left-[50%]"
                        )}
                    >
                        {template.name}
                    </div>
                )}
            </div>
        </div>
    );
};
