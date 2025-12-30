"use client"

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Card } from './card';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export const GlassCard = ({ children, className, animate = true }: GlassCardProps) => {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card
        className={cn(
          'glass-card p-6 border border-white/10 shadow-2xl overflow-hidden relative group bg-transparent',
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">{children}</div>
      </Card>
    </motion.div>
  );
};
