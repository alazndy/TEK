"use client";

import React from 'react';
import { ShoppingCart, Trash2, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer() {
  const { items, isOpen, toggleCart, removeFromCart, total, checkout } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  const handleCheckout = async () => {
    if (!user) {
        toggleCart(false);
        router.push('/login');
        return;
    }
    
    setIsCheckingOut(true);
    await checkout();
    setIsCheckingOut(false);
    toggleCart(false);
    // Ideally show a toast here
    alert("Purchase Successful! Modules are now active.");
  };

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="flex flex-col h-full bg-slate-950 border-white/10 text-white w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Your Cart
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            Review your selected modules before purchase.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
            {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <ShoppingCart className="w-12 h-12 opacity-20" />
                    <p>Your cart is empty.</p>
                    <Button variant="link" className="text-indigo-400" onClick={() => toggleCart(false)}>
                        Browse Catalog
                    </Button>
                </div>
            ) : (
                <ul className="space-y-4">
                    <AnimatePresence initial={false}>
                    {items.map((item) => (
                        <motion.li 
                            key={item.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                        >
                            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-lg">
                                📦
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{item.name}</h4>
                                <p className="text-sm text-slate-400 truncate">{item.category}</p>
                                <div className="mt-1 font-mono text-sm text-indigo-300">
                                    {item.price === 0 ? 'Free' : `$${item.price}`}
                                </div>
                            </div>
                            <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-slate-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.li>
                    ))}
                    </AnimatePresence>
                </ul>
            )}
        </div>

        {items.length > 0 && (
            <div className="border-t border-white/10 pt-6 space-y-4">
                <div className="flex items-center justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <Button 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                >
                    {isCheckingOut ? (
                        "Processing..."
                    ) : (
                        <>
                           Proceed to Checkout <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <CreditCard className="w-3 h-3" /> Secure Payment via Stripe
                </div>
            </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
