
import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MaterialPaletteProps {
    onAddMaterial: (text: string) => void;
}

const categories = [
    {
        id: 'wall',
        name: 'Duvar',
        materials: [
            { name: 'Brüt Beton', value: 'exposed concrete wall texture' },
            { name: 'Kırmızı Tuğla', value: 'aged red brick wall' },
            { name: 'Beyaz Sıva', value: 'clean white stucco wall' },
            { name: 'Ahşap Kaplama', value: 'vertical timber cladding' },
            { name: 'Doğal Taş', value: 'rough natural stone wall' }
        ]
    },
    {
        id: 'floor',
        name: 'Zemin',
        materials: [
            { name: 'Ahşap Parke', value: 'herringbone oak flooring' },
            { name: 'Mermer', value: 'white carrara marble flooring' },
            { name: 'Cilalı Beton', value: 'polished concrete floor' },
            { name: 'Seramik', value: 'large format grey ceramic tiles' },
            { name: 'Çim', value: 'manicured green grass' }
        ]
    },
    {
        id: 'glass',
        name: 'Cam & Metal',
        materials: [
            { name: 'Reflektif Cam', value: 'reflective blue facade glass' },
            { name: 'Şeffaf Cam', value: 'clear floor-to-ceiling glass' },
            { name: 'Siyah Metal', value: 'matte black metal frames' },
            { name: 'Bakır', value: 'oxidized copper panels' },
            { name: 'Korten Çelik', value: 'rusted corten steel' }
        ]
    },
    {
        id: 'atmosphere',
        name: 'Atmosfer',
        materials: [
            { name: 'Gün Batımı', value: 'golden hour dramatic lighting' },
            { name: 'Bulutlu', value: 'overcast soft diffused lighting' },
            { name: 'Gece', value: 'night time with interior lights glowing' },
            { name: 'Yağmurlu', value: 'rainy cinematic atmosphere, wet reflections' },
            { name: 'Sisli', value: 'foggy mysterious atmosphere' }
        ]
    }
];

export const MaterialPalette: React.FC<MaterialPaletteProps> = ({ onAddMaterial }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('wall');

    return (
        <div className="bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/5 shadow-xl overflow-hidden transition-all duration-300">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex items-center justify-between text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Layers size={14} className="text-primary" />
                    <span>Materyal & Atmosfer Paleti</span>
                </div>
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-5 pt-0 overflow-hidden"
                >
                    {/* Tabs */}
                    <div className="flex space-x-2 mb-4 overflow-x-auto scrollbar-none pb-1">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveTab(cat.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                    activeTab === cat.id 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                        : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {categories.find(c => c.id === activeTab)?.materials.map((mat, idx) => (
                            <button
                                key={idx}
                                onClick={() => onAddMaterial(mat.value)}
                                className="group flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/30 rounded-2xl text-left transition-all"
                            >
                                <span className="text-muted-foreground text-[11px] font-bold group-hover:text-white truncate">{mat.name}</span>
                                <Plus size={12} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};
