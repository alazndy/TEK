"use client"

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'TRY' | 'EUR' | 'GBP' | 'USD';

interface ExchangeRates {
  TRY: number;
  EUR: number;
  GBP: number;
  USD: number;
}

interface CurrencyState {
  baseCurrency: Currency;
  selectedCurrency: Currency;
  rates: ExchangeRates | null;
  lastUpdated: string | null;
  loading: boolean;
  error: string | null;
  setSelectedCurrency: (currency: Currency) => void;
  fetchRates: () => Promise<void>;
  convertPrice: (price: number, fromCurrency: Currency) => number;
  formatPrice: (price: number, currency?: Currency) => string;
}

// Frankfurter API - free, no auth required
const FRANKFURTER_API = 'https://api.frankfurter.app/latest';

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      baseCurrency: 'EUR', // Frankfurter uses EUR as base by default
      selectedCurrency: 'TRY',
      rates: null,
      lastUpdated: null,
      loading: false,
      error: null,

      setSelectedCurrency: (currency) => {
        set({ selectedCurrency: currency });
      },

      fetchRates: async () => {
        const state = get();
        
        // Don't fetch if already loading
        if (state.loading) return;
        
        // Check if we have recent rates (less than 1 hour old)
        if (state.lastUpdated) {
          const lastUpdate = new Date(state.lastUpdated);
          const now = new Date();
          const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
          if (hoursSinceUpdate < 1 && state.rates) {
            return; // Use cached rates
          }
        }

        set({ loading: true, error: null });

        try {
          // Fetch rates with EUR as base (default for Frankfurter)
          const response = await fetch(`${FRANKFURTER_API}?symbols=TRY,GBP,USD`);
          
          if (!response.ok) {
            throw new Error('Döviz kurları alınamadı');
          }

          const data = await response.json();
          
          // Frankfurter returns rates relative to EUR
          // data.rates = { TRY: 36.5, GBP: 0.83, USD: 1.05 }
          const rates: ExchangeRates = {
            EUR: 1, // Base
            TRY: data.rates.TRY || 36.5,
            GBP: data.rates.GBP || 0.83,
            USD: data.rates.USD || 1.05,
          };

          set({
            rates,
            lastUpdated: new Date().toISOString(),
            loading: false,
          });

        } catch (error: any) {
          console.error('Currency fetch error:', error);
          set({
            error: error.message || 'Kur bilgisi alınamadı',
            loading: false,
            // Keep using old rates if available
          });
        }
      },

      // Convert price from one currency to selected currency
      convertPrice: (price: number, fromCurrency: Currency) => {
        const { rates, selectedCurrency } = get();
        
        if (!rates || price === 0) return price;
        
        // Convert to EUR first (base currency)
        const priceInEur = price / rates[fromCurrency];
        
        // Then convert to target currency
        return priceInEur * rates[selectedCurrency];
      },

      // Format price with currency symbol
      formatPrice: (price: number, currency?: Currency) => {
        const curr = currency || get().selectedCurrency;
        
        const locale = curr === 'TRY' ? 'tr-TR' : curr === 'EUR' ? 'de-DE' : 'en-GB';
        
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: curr,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(price);
      },
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({
        selectedCurrency: state.selectedCurrency,
        rates: state.rates,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Currency symbols for display
export const currencySymbols: Record<Currency, string> = {
  TRY: '₺',
  EUR: '€',
  GBP: '£',
  USD: '$',
};

// Currency names in Turkish
export const currencyNames: Record<Currency, string> = {
  TRY: 'Türk Lirası',
  EUR: 'Euro',
  GBP: 'İngiliz Sterlini',
  USD: 'ABD Doları',
};
