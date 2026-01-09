import { useState } from 'react';
import { Product, MarketSearchPreferences } from '../types';

interface UseBulkAnalysisProps {
  products: Product[];
  onProductUpdate: (p: Product) => void;
}

export const useBulkAnalysis = ({ products, onProductUpdate }: UseBulkAnalysisProps) => {
  const [isBulkAnalyzing, setIsBulkAnalyzing] = useState(false);
  const [bulkQueue, setBulkQueue] = useState<Product[]>([]);
  const [bulkIndex, setBulkIndex] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [currentAnalyzingId, setCurrentAnalyzingId] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const startBulkSession = (productsToAnalyze: Product[]) => {
    setIsBulkAnalyzing(true);
    setBulkQueue(productsToAnalyze);
    setBulkIndex(0);
  };

  const stopBulkSession = () => {
    setIsBulkAnalyzing(false);
    setBulkQueue([]);
  };

  const handleNextStep = (prefs: MarketSearchPreferences) => {
    // Determine current product being analyzed
    const currentProduct = bulkQueue[bulkIndex];
    if (!currentProduct) {
        setIsBulkAnalyzing(false);
        return;
    }

    // Call updates on the product (simulated or real)
    // In a real scenario, this might trigger an API call.
    // For now, we advance the queue.
    
    const nextIndex = bulkIndex + 1;
    if (nextIndex < bulkQueue.length) {
        setBulkIndex(nextIndex);
        setCurrentAnalyzingId(bulkQueue[nextIndex].id);
        setWaitingForNext(true); // Wait for UI/User to confirm next step if not auto
        
        if (autoAdvance) {
            // Auto advance logic would go here, possibly a timeout
            setTimeout(() => setWaitingForNext(false), 2000);
        }
    } else {
        // Queue finished
        setIsBulkAnalyzing(false);
        setBulkIndex(0);
        setCurrentAnalyzingId(null);
    }
  };

  return {
    isBulkAnalyzing,
    bulkQueue,
    bulkIndex,
    waitingForNext,
    currentAnalyzingId,
    autoAdvance,
    setAutoAdvance,
    startBulkSession,
    stopBulkSession,
    handleNextStep
  };
};
