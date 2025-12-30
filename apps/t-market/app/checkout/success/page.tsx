'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center text-white max-w-md">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-16 h-16 text-green-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-white/70 mb-8">
          Your modules have been activated and are now available in your account.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/account')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            View Account
          </button>
          <button
            onClick={() => router.push('/store')}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Browse More
          </button>
        </div>
      </div>
    </div>
  );
}
