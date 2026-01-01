"use client";

import React from 'react';
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface FeatureGuardProps {
  module: string; // The module ID required (e.g., 'flux-module')
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ module, children, fallback }: FeatureGuardProps) {
  const isInstalled = useMarketplaceStore(state => state.isModuleInstalled(module));
  const router = useRouter();

  if (isInstalled) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default Fallback
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh] animate-in fade-in duration-500">
      <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
        <Lock className="w-8 h-8 text-zinc-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Bu Modüle Erişiminiz Yok</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Bu özelliği kullanmak için <strong>Marketplace</strong> üzerinden ilgili modülü yüklemeniz gerekmektedir.
      </p>
      <Button 
        onClick={() => router.push('/marketplace')} 
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        Markete Git
      </Button>
    </div>
  );
}
