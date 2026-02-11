import { useState, useEffect, useCallback } from 'react';

export interface LocalClaim {
  id: string;
  type: 'ad' | 'task';
  title: string;
  reward: number;
  proof?: string;
  timestamp: number;
  status: 'pending';
}

const STORAGE_KEY = 'taskora_local_claims';

function loadClaims(): LocalClaim[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load claims:', e);
  }
  return [];
}

function saveClaims(claims: LocalClaim[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
  } catch (e) {
    console.error('Failed to save claims:', e);
  }
}

export function useLocalEarnClaims() {
  const [claims, setClaims] = useState<LocalClaim[]>(loadClaims);

  const addClaim = useCallback((claim: Omit<LocalClaim, 'id' | 'timestamp' | 'status'>) => {
    const newClaim: LocalClaim = {
      ...claim,
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending',
    };
    
    setClaims(prev => {
      const updated = [newClaim, ...prev];
      saveClaims(updated);
      return updated;
    });
    
    return newClaim;
  }, []);

  const clearOldClaims = useCallback(() => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    setClaims(prev => {
      const filtered = prev.filter(c => c.timestamp > sevenDaysAgo);
      saveClaims(filtered);
      return filtered;
    });
  }, []);

  useEffect(() => {
    clearOldClaims();
  }, [clearOldClaims]);

  return {
    claims,
    addClaim,
  };
}
