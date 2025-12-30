'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export const PageWrapper = ({ children, className, title, description }: PageWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
};
