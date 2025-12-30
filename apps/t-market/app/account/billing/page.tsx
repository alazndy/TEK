'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const router = useRouter();

  useEffect(() => {
    // For now, redirect to the main account page which has a billing tab
    // In the future, this could be a dedicated full-page billing view
    router.replace('/account');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
      Redirecting to account dashboard...
    </div>
  );
}
