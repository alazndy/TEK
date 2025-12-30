"use client"

import { useCurrencyStore } from '@/stores/currency-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PriceCellProps {
  price: number | undefined | null;
  sourceCurrency?: 'GBP' | 'EUR' | 'TRY' | 'USD';
  className?: string;
}

export function PriceCell({ price, sourceCurrency = 'TRY', className = "" }: PriceCellProps) {
  const { selectedCurrency, convertPrice, formatPrice, rates } = useCurrencyStore();

  if (price === undefined || price === null || price === 0) {
    return <div className={`text-muted-foreground ${className}`}>-</div>;
  }

  // If source currency is same as selected, no conversion needed
  const displayPrice = sourceCurrency === selectedCurrency 
    ? price 
    : convertPrice(price, sourceCurrency);

  const formattedPrice = formatPrice(displayPrice, selectedCurrency);

  // Show original price in tooltip if converted
  if (sourceCurrency !== selectedCurrency && rates) {
    const originalFormatted = formatPrice(price, sourceCurrency);
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`font-medium cursor-help ${className}`}>
              {formattedPrice}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Orijinal: {originalFormatted}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <div className={`font-medium ${className}`}>{formattedPrice}</div>;
}
