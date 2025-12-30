"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrencyStore, currencySymbols, currencyNames } from '@/stores/currency-store'
import { RefreshCw, ChevronDown, TrendingUp } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

const currencies = ['TRY', 'EUR', 'GBP'] as const;
type Currency = typeof currencies[number];

export function CurrencySelector() {
  const { 
    selectedCurrency, 
    setSelectedCurrency, 
    rates, 
    loading, 
    fetchRates,
    lastUpdated 
  } = useCurrencyStore();

  // Fetch rates on mount
  React.useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Format last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    const date = new Date(lastUpdated);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="font-bold">{currencySymbols[selectedCurrency]}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Para Birimi</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={(e) => {
              e.preventDefault();
              fetchRates();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency}
            onClick={() => setSelectedCurrency(currency)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{currencySymbols[currency]}</span>
              <span>{currencyNames[currency]}</span>
            </div>
            {selectedCurrency === currency && (
              <Badge variant="secondary" className="text-xs">Seçili</Badge>
            )}
          </DropdownMenuItem>
        ))}
        
        {rates && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2 text-xs text-muted-foreground space-y-1">
              <div className="font-medium mb-1">Güncel Kurlar (€1 =)</div>
              <div className="flex justify-between">
                <span>₺ TRY:</span>
                <span className="font-mono">{rates.TRY.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>£ GBP:</span>
                <span className="font-mono">{rates.GBP.toFixed(4)}</span>
              </div>
              {lastUpdated && (
                <div className="text-[10px] opacity-70 pt-1">
                  Son güncelleme: {getLastUpdatedText()}
                </div>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
