
import React, { useEffect, useRef, useState } from 'react';
import { SavedPrompt } from '../types';
import { Trash2, Copy, BookOpen, Plus, X } from 'lucide-react';

interface PromptLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    savedPrompts: SavedPrompt[];
    currentPrompt: string;
    onSaveCurrent: (title: string, content: string) => void;
    onDelete: (id: number) => void;
    onSelect: (content: string) => void;
}

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
    isOpen,
    onClose,
    savedPrompts,
    currentPrompt,
    onSaveCurrent,
    onDelete,
    onSelect
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [newTitle, setNewTitle] = useState('');
    const [view, setView] = useState<'list' | 'save'>('list');

    useEffect(() => {
        if (isOpen) {
            setView('list');
            setNewTitle('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!newTitle.trim() || !currentPrompt.trim()) return;
        onSaveCurrent(newTitle, currentPrompt);
        setNewTitle('');
        setView('list');
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                ref={modalRef}
                className="bg-[#0f172a] border border-white/10 w-full h-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                             <BookOpen size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-wide">Muhittin'in Büyü Kitabı</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6">
                    {view === 'list' ? (
                        <div className="space-y-4">
                            <button 
                                onClick={() => setView('save')}
                                disabled={!currentPrompt.trim()}
                                className="w-full py-4 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-2xl flex items-center justify-center gap-2 text-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="font-semibold">Şu Anki Promptu Kaydet</span>
                            </button>

                            {savedPrompts.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">
                                    <p>Henüz kayıtlı büyü yok.</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {savedPrompts.map((item) => (
                                        <div key={item.id} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl p-4 transition-all">
                                            <div className="flex justify-between items-start gap-4">
                                                <div 
                                                    className="flex-grow cursor-pointer"
                                                    onClick={() => {
                                                        onSelect(item.content);
                                                        onClose();
                                                    }}
                                                >
                                                    <h3 className="font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                                                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{item.content}</p>
                                                    <span className="text-[10px] text-gray-600 mt-2 block">
                                                        {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => {
                                                            onSelect(item.content);
                                                            onClose();
                                                        }}
                                                        className="p-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
                                                        title="Kullan"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if(window.confirm('Bu büyüyü silmek istediğine emin misin?')) onDelete(item.id);
                                                        }}
                                                        className="p-2 bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                                                        title="Sil"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Büyüyü Kaydet</h3>
                                <p className="text-gray-400 text-sm mb-4">Mevcut yazdığın talimatları daha sonra kullanmak üzere kaydet.</p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Başlık</label>
                                        <input 
                                            type="text" 
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="Örn: Kışlık Dağ Evi Atmosferi"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">İçerik</label>
                                        <div className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-400 text-sm italic min-h-[100px]">
                                            {currentPrompt}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setView('list')}
                                    className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
                                >
                                    İptal
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={!newTitle.trim()}
                                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
