"use client"

import { motion } from 'framer-motion';
import { Input } from './input';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const PremiumInput = ({ label, className, ...props }: PremiumInputProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <motion.div
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Input
          className={cn(
            "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl h-12 transition-all",
            className
          )}
          {...props}
        />
      </motion.div>
    </div>
  );
};
