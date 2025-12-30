
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface LoadingContextProps {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Automatically set loading to false when the URL changes
  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
