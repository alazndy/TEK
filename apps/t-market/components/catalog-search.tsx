"use client";

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMarketplaceStore } from '@/stores/marketplace-store';
import { motion } from 'framer-motion';

const CATEGORIES = [
  "IoT",
  "Manufacturing",
  "Supply Chain",
  "Construction",
  "ERP",
  "Utilities"
];

export function CatalogSearch() {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useMarketplaceStore();

  return (
    <div className="w-full max-w-4xl mx-auto mb-12 space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search modules (e.g. Flux, Inventory, Asset Tracking)..." 
          className="w-full h-14 pl-12 pr-4 bg-slate-900 border-white/10 text-white rounded-2xl focus:border-indigo-500/50 focus:ring-indigo-500/20 text-lg placeholder:text-slate-500 transition-all hover:bg-slate-800/50"
        />
        {searchQuery && (
            <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
                <X className="w-5 h-5" />
            </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full border px-4 ${
            selectedCategory === null 
              ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700' 
              : 'bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All
        </Button>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={`rounded-full border px-4 ${
              selectedCategory === cat 
                ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700' 
                : 'bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  );
}
