// Part Lookup Panel for Weave
import React, { useState, useCallback } from 'react';
import { Search, Package, DollarSign, Truck, ExternalLink, X, ShoppingCart, RefreshCw, Filter } from 'lucide-react';
import type { PartSearchResult, PartSearchParams } from '../types/integrations';
import * as partLookupService from '../services/partLookupService';

interface PartLookupPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPart?: (part: PartSearchResult) => void;
}

export const PartLookupPanel: React.FC<PartLookupPanelProps> = ({
  isOpen,
  onClose,
  onSelectPart,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PartSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartSearchResult | null>(null);
  const [filters, setFilters] = useState<Partial<PartSearchParams>>({
    inStockOnly: false,
    sortBy: 'relevance',
  });

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchResults = await partLookupService.searchParts({
        query,
        ...filters,
        maxResults: 20,
      });
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getSourceLogo = (source: string) => {
    switch (source) {
      case 'digikey': return '🟠';
      case 'mouser': return '🔵';
      case 'octopart': return '🟢';
      case 'jlcpcb': return '🟣';
      default: return '⚪';
    }
  };

  const getSourceName = (source: string) => {
    switch (source) {
      case 'digikey': return 'Digi-Key';
      case 'mouser': return 'Mouser';
      case 'octopart': return 'Octopart';
      case 'jlcpcb': return 'JLCPCB';
      default: return source;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/20">
             <Package className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="font-bold text-lg text-foreground">Parça Arama</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-5 border-b border-border bg-card/50 backdrop-blur-md">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Parça numarası veya açıklama..."
              className="w-full pl-10 pr-3 py-2.5 bg-background border border-input rounded-xl text-sm text-foreground placeholder-muted-foreground focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <label className="flex items-center text-xs font-medium text-muted-foreground cursor-pointer select-none group">
            <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 transition-colors ${filters.inStockOnly ? 'bg-blue-500 border-blue-500' : 'border-input bg-transparent group-hover:border-muted-foreground'}`}>
                {filters.inStockOnly && <X className="w-3 h-3 text-white" />} 
            </div>
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => setFilters({ ...filters, inStockOnly: e.target.checked })}
              className="hidden"
            />
            Sadece stokta
          </label>
          <div className="h-4 w-px bg-border mx-2"></div>
           <div className="flex items-center gap-2 flex-1">
             <Filter size={12} className="text-muted-foreground"/>
             <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="flex-1 bg-transparent border-none text-xs text-muted-foreground focus:text-foreground outline-none cursor-pointer hover:bg-muted/50 py-1 rounded"
              >
                <option value="relevance" className="bg-background text-foreground">En Alakalı</option>
                <option value="price" className="bg-background text-foreground">Fiyata Göre</option>
                <option value="stock" className="bg-background text-foreground">Stoğa Göre</option>
              </select>
           </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-500" />
                </div>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                 <Search className="h-8 w-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">Bileşen Araması Yapın</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] text-center">Tedarikçilerden anlık fiyat ve stok bilgisi almak için arama yapın.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((part) => (
              <div
                key={`${part.source}-${part.partNumber}`}
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  selectedPart?.partNumber === part.partNumber 
                    ? 'bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-500/10' 
                    : 'bg-card border-border hover:bg-muted/50 hover:border-muted-foreground/20'
                }`}
                onClick={() => setSelectedPart(part)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base filter drop-shadow-sm">{getSourceLogo(part.source)}</span>
                      <span className="font-mono font-bold text-sm text-foreground truncate group-hover:text-blue-500 transition-colors">
                        {part.partNumber}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {part.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 uppercase tracking-wider font-bold mt-2">{part.manufacturer}</p>
                  </div>
                  <div className="text-right ml-3 flex flex-col items-end">
                    {part.pricing[0] && (
                      <p className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs mb-1 border border-emerald-500/20">
                        {partLookupService.formatPrice(part.pricing[0].unitPrice, part.pricing[0].currency)}
                      </p>
                    )}
                    <p className={`text-[10px] font-bold flex items-center gap-1 ${part.stock.inStock ? 'text-muted-foreground' : 'text-red-500'}`}>
                      {part.stock.inStock ? <Truck size={10}/> : <X size={10}/>}
                      {part.stock.inStock ? `${part.stock.quantity}` : 'Yok'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Part Details */}
      {selectedPart && (
        <div className="border-t border-border p-4 bg-card/90 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-foreground text-sm truncate pr-4">{selectedPart.partNumber}</h4>
            <button
              onClick={() => setSelectedPart(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Pricing Tiers */}
          <div className="mb-3 flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
            {selectedPart.pricing.map((tier: any, i: number) => (
              <span key={i} className="text-[10px] bg-muted/50 border border-border px-2 py-1 rounded whitespace-nowrap text-muted-foreground">
                {tier.quantity}+: <span className="text-foreground font-bold">{partLookupService.formatPrice(tier.unitPrice, tier.currency)}</span>
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {selectedPart.datasheetUrl && (
              <a
                href={selectedPart.datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2.5 text-xs font-bold border border-border rounded-xl text-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                Datasheet
              </a>
            )}
            <a
              href={selectedPart.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2.5 text-xs font-bold border border-border rounded-xl text-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              {getSourceName(selectedPart.source)}
            </a>
            {onSelectPart && (
              <button
                onClick={() => onSelectPart(selectedPart)}
                className="flex-[2] px-3 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ShoppingCart className="h-3 w-3" />
                Listeye Ekle
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartLookupPanel;
