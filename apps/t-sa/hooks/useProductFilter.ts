import { useState, useMemo } from 'react';
import { Product } from '../types';

interface UseProductFilterProps {
  products: Product[];
}

export const useProductFilter = ({ products }: UseProductFilterProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegexMode, setIsRegexMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
       const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
       return matchesSearch;
    });
  }, [products, searchTerm]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category || 'Uncategorized')))];

  return {
    searchTerm, setSearchTerm,
    isRegexMode, setIsRegexMode,
    selectedCategory, setSelectedCategory,
    showCriticalOnly, setShowCriticalOnly,
    categories,
    filteredProducts
  };
};
