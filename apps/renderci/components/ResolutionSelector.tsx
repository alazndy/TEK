
import React from 'react';
import { Resolution } from '../types';

interface ResolutionSelectorProps {
    selectedResolution: Resolution;
    onSelectResolution: (resolution: Resolution) => void;
}

const resolutionOptions: { id: Resolution, name: string, description: string, badge: string }[] = [
    { id: '1K', name: 'Standart', description: 'Hızlı Taslak', badge: '1K' },
    { id: '2K', name: 'Yüksek', description: 'Sunum Kalitesi', badge: '2K' },
    { id: '4K', name: 'Ultra', description: 'Baskı & Detay', badge: '4K' },
];

export const ResolutionSelector: React.FC<ResolutionSelectorProps> = React.memo(({ selectedResolution, onSelectResolution }) => {
    return (
        <div className="bg-white/[0.03] backdrop-blur-md p-5 rounded-3xl border border-white/5 shadow-xl">
            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 ml-1">Çözünürlük Kalitesi</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {resolutionOptions.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => onSelectResolution(option.id)}
                        className={`relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border text-left overflow-hidden
                            ${selectedResolution === option.id 
                                ? 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                                : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10'
                            }`
                        }
                    >
                        <div className="flex flex-col z-10">
                            <span className={`font-bold text-sm ${selectedResolution === option.id ? 'text-white' : 'text-gray-300'}`}>{option.name}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">{option.description}</span>
                        </div>
                        <div className={`z-10 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 ${selectedResolution === option.id ? 'bg-indigo-500 text-white shadow-lg' : 'bg-black/30 text-gray-500'}`}>
                            {option.badge}
                        </div>
                        {selectedResolution === option.id && (
                             <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/20 blur-2xl rounded-full pointer-events-none"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
});
