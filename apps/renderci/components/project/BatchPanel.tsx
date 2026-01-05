import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, X, Trash2, RotateCcw, CheckCircle2, 
  AlertCircle, Clock, Image, Loader2, ListPlus
} from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import { BatchItem, BatchItemStatus } from '../../types/project';
import { cn } from '../../lib/utils';

interface BatchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRenderItem?: (item: BatchItem) => Promise<string>;
}

export const BatchPanel: React.FC<BatchPanelProps> = ({ 
  isOpen, 
  onClose,
  onRenderItem 
}) => {
  const { 
    batchQueue,
    updateBatchItem,
    removeBatchItem,
    clearBatch,
    startBatch,
    pauseBatch
  } = useProjectStore();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingCount = batchQueue.items.filter(i => i.status === 'pending').length;
  const completedCount = batchQueue.items.filter(i => i.status === 'completed').length;
  const failedCount = batchQueue.items.filter(i => i.status === 'failed').length;

  const handleStartBatch = async () => {
    if (!onRenderItem) return;
    
    setIsProcessing(true);
    startBatch();
    
    for (const item of batchQueue.items) {
      if (item.status !== 'pending') continue;
      if (!batchQueue.isRunning) break;
      
      try {
        updateBatchItem(item.id, { 
          status: 'processing', 
          startedAt: Date.now(),
          progress: 0 
        });
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          updateBatchItem(item.id, { 
            progress: Math.min(item.progress + 10, 90) 
          });
        }, 500);
        
        const resultUrl = await onRenderItem(item);
        
        clearInterval(progressInterval);
        updateBatchItem(item.id, { 
          status: 'completed',
          resultUrl,
          progress: 100,
          completedAt: Date.now()
        });
      } catch (error) {
        updateBatchItem(item.id, { 
          status: 'failed',
          error: error instanceof Error ? error.message : 'Render failed',
          progress: 0
        });
      }
    }
    
    setIsProcessing(false);
    pauseBatch();
  };

  const getStatusIcon = (status: BatchItemStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-slate-400" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: BatchItemStatus) => {
    switch (status) {
      case 'pending': return 'border-slate-600';
      case 'processing': return 'border-primary bg-primary/5';
      case 'completed': return 'border-green-500/50 bg-green-500/5';
      case 'failed': return 'border-red-500/50 bg-red-500/5';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Batch Render</h2>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">
                  {batchQueue.items.length}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="p-4 grid grid-cols-3 gap-2">
              <div className="bg-slate-800 rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                <div className="text-lg font-bold">{pendingCount}</div>
                <div className="text-[10px] text-slate-500 uppercase">Bekliyor</div>
              </div>
              <div className="bg-green-500/10 rounded-xl p-3 text-center">
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <div className="text-lg font-bold text-green-400">{completedCount}</div>
                <div className="text-[10px] text-slate-500 uppercase">Tamamlandı</div>
              </div>
              <div className="bg-red-500/10 rounded-xl p-3 text-center">
                <AlertCircle className="w-5 h-5 mx-auto mb-1 text-red-400" />
                <div className="text-lg font-bold text-red-400">{failedCount}</div>
                <div className="text-[10px] text-slate-500 uppercase">Başarısız</div>
              </div>
            </div>

            {/* Controls */}
            <div className="px-4 flex gap-2">
              {isProcessing ? (
                <button
                  onClick={() => { pauseBatch(); setIsProcessing(false); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-medium hover:bg-amber-500/20 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Duraklat
                </button>
              ) : (
                <button
                  onClick={handleStartBatch}
                  disabled={pendingCount === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  Başlat ({pendingCount})
                </button>
              )}
              <button
                onClick={clearBatch}
                className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-medium hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {batchQueue.items.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sırada render yok</p>
                  <p className="text-xs mt-1">Görüntü ekleyerek başlayın</p>
                </div>
              ) : (
                batchQueue.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    className={cn(
                      "group p-3 rounded-xl border transition-all",
                      getStatusColor(item.status)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img 
                          src={item.resultUrl || item.sourceUrl} 
                          alt={`Item ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="text-xs font-medium capitalize">
                            {item.status === 'pending' ? 'Bekliyor' : 
                             item.status === 'processing' ? 'İşleniyor' :
                             item.status === 'completed' ? 'Tamamlandı' : 'Başarısız'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-1">
                          {item.prompt || 'Prompt yok'}
                        </p>
                        
                        {/* Progress */}
                        {item.status === 'processing' && (
                          <div className="mt-2">
                            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {item.progress}% tamamlandı
                            </p>
                          </div>
                        )}
                        
                        {item.error && (
                          <p className="text-xs text-red-400 mt-1">{item.error}</p>
                        )}
                      </div>
                      
                      {/* Remove */}
                      <button
                        onClick={() => removeBatchItem(item.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
