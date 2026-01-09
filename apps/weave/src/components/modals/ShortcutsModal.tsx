import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  const shortcuts = [
    { keys: ['Ctrl', 'Z'], desc: 'Geri Al' },
    { keys: ['Ctrl', 'Y'], desc: 'İleri Al' },
    { keys: ['Ctrl', 'C'], desc: 'Kopyala' },
    { keys: ['Ctrl', 'V'], desc: 'Yapıştır' },
    { keys: ['Delete'], desc: 'Seçileni Sil' },
    { keys: ['Yön Tuşları'], desc: 'Hassas Taşıma' },
    { keys: ['Shift', 'Yön'], desc: 'Hızlı Taşıma' },
    { keys: ['Shift', 'Sürükle'], desc: 'Çoklu Seçim' },
    { keys: ['Mouse Teker'], desc: 'Zoom' },
    { keys: ['Teker Tıkla'], desc: 'Kaydır (Pan)' },
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[150] no-print" onClick={onClose}>
      <div className="bg-card border border-border p-6 rounded-2xl w-[500px] shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-2 rounded-lg border border-teal-500/20">
              <Keyboard className="text-teal-500 w-6 h-6" />
            </div>
            Klavye Kısayolları
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors bg-muted hover:bg-muted/80 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border">
              <span className="text-sm font-medium text-foreground">{s.desc}</span>
              <div className="flex gap-1">
                {s.keys.map((k, j) => (
                  <kbd key={j} className="px-2 py-1 bg-muted rounded border border-border text-xs font-bold text-muted-foreground font-mono shadow-sm">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">İpucu: Nesneleri sağ tıklayarak bağlam menüsüne erişebilirsiniz.</p>
        </div>
      </div>
    </div>
  );
};