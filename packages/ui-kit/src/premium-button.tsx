"use client"

import { motion } from 'framer-motion';
import { Button, ButtonProps } from './button';
import type { ReactNode } from 'react';
import React from 'react';

export interface PremiumButtonProps extends ButtonProps {
  children: ReactNode;
  animate?: boolean;
}

export const PremiumButton = ({ children, animate = true, ...props }: PremiumButtonProps) => {
  return (
    <motion.div
      whileHover={animate ? { scale: 1.05, translateY: -2 } : {}}
      whileTap={animate ? { scale: 0.95 } : {}}
      className="inline-block"
    >
      <Button {...props}>
        {children}
      </Button>
    </motion.div>
  );
};
