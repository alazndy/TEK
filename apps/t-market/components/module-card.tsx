'use client';

import React from 'react';
import { Module } from '@/types';
import { Check, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ModuleCardProps {
  module: Module;
  isInstalled: boolean;
  parentInstalled: boolean;
  onAction: (module: Module) => void;
  loading: boolean;
}

export function ModuleCard({ module, isInstalled, parentInstalled, onAction, loading }: ModuleCardProps) {
  // Get the icon component dynamically with safety check
  // Accessing index signature on imports can be tricky with different bundlers
  const IconComponent = (LucideIcons as any)[module.icon] || LucideIcons.Puzzle;

  return (
    <div
      className={`h-full border rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col backdrop-blur-lg ${
        isInstalled ? 'border-green-500/30 bg-green-500/5' : 'border-white/10'
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`p-3 rounded-xl ${
              isInstalled ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'
            }`}
          >
            <IconComponent className="w-8 h-8" />
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {module.type === 'addon' && (
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30">
                Add-on
              </span>
            )}
            {module.type === 'integration' && (
              <span className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30">
                Integration
              </span>
            )}
            {module.isPopular && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30">
                ⭐ Popular
              </span>
            )}
            {module.isNew && (
              <span className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30">
                ✨ New
              </span>
            )}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{module.name}</h3>
        <p className="text-sm text-white/50">{module.category}</p>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 flex-1">
        <p className="text-sm text-white/70 mb-4 line-clamp-2">{module.description}</p>

        {/* Parent Dependency */}
        {module.parentId && (
          <div
            className={`flex items-center gap-2 text-xs mb-4 p-3 rounded-lg border ${
              parentInstalled
                ? 'bg-white/5 border-white/10 text-white/60'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <ArrowRight className="w-3 h-3" />
            Requires: <span className="font-mono text-white">{module.parentId}</span>
            {!parentInstalled && <span className="ml-auto font-bold">⚠️ Missing</span>}
          </div>
        )}

        {/* Features */}
        <div className="space-y-2">
          {module.features.slice(0, 3).map((feat, i) => (
            <div key={i} className="flex items-center text-xs text-white/60">
              <Check className="w-3 h-3 mr-2 text-indigo-400" />
              {feat}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/10 p-6 pt-4">
        <div className="text-lg font-bold text-white">
          {module.price === 0 ? (
            <span className="text-green-400">Free</span>
          ) : (
            <span>${module.price}</span>
          )}
        </div>
        <button
          className={`px-6 py-2 rounded-lg font-bold transition-all ${
            isInstalled
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={() => onAction(module)}
          disabled={loading || (module.type === 'addon' && !parentInstalled)}
        >
          {loading ? '...' : isInstalled ? 'Uninstall' : module.price > 0 ? 'Add to Cart' : 'Install'}
        </button>
      </div>
    </div>
  );
}
