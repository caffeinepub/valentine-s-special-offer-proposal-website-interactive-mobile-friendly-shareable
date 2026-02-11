import { useState, useEffect } from 'react';

const MARKUP_STORAGE_KEY = 'exchange_pricing_markup';
const DEFAULT_MARKUP = 5.0; // 5% default markup
const MIN_MARKUP = 0;
const MAX_MARKUP = 25;

export function usePricingMarkup() {
  const [markup, setMarkupState] = useState<number>(() => {
    const stored = localStorage.getItem(MARKUP_STORAGE_KEY);
    if (stored) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed) && parsed >= MIN_MARKUP && parsed <= MAX_MARKUP) {
        return parsed;
      }
    }
    return DEFAULT_MARKUP;
  });

  const setMarkup = (value: number) => {
    const clamped = Math.max(MIN_MARKUP, Math.min(MAX_MARKUP, value));
    setMarkupState(clamped);
    localStorage.setItem(MARKUP_STORAGE_KEY, clamped.toString());
  };

  const applyMarkup = (basePrice: number): number => {
    return basePrice * (1 + markup / 100);
  };

  return {
    markup,
    setMarkup,
    applyMarkup,
  };
}
