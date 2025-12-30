"use client"

import { useCriticalStockMonitor } from '@/hooks/use-critical-stock-monitor';
import { useFirestoreListeners } from '@/hooks/use-firestore-listeners';

export function AppLifecycle() {
    useCriticalStockMonitor();
    useFirestoreListeners();
    return null; // This component doesn't render anything visually
}
