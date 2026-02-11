import { useState, useEffect, useCallback } from 'react';

interface DepositProof {
  txId: string;
  screenshot: string | null;
}

const STORAGE_KEY = 'taskora_deposit_proof';

function loadProof(): DepositProof {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load deposit proof:', e);
  }
  return { txId: '', screenshot: null };
}

function saveProof(proof: DepositProof) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proof));
  } catch (e) {
    console.error('Failed to save deposit proof:', e);
  }
}

export function useLocalDepositProof() {
  const [proof, setProof] = useState<DepositProof>(loadProof);

  const setTxId = useCallback((txId: string) => {
    setProof(prev => {
      const updated = { ...prev, txId };
      saveProof(updated);
      return updated;
    });
  }, []);

  const setScreenshot = useCallback(async (file: File | null) => {
    if (!file) {
      setProof(prev => {
        const updated = { ...prev, screenshot: null };
        saveProof(updated);
        return updated;
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setProof(prev => {
          const updated = { ...prev, screenshot: dataUrl };
          saveProof(updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error('Failed to read screenshot:', e);
    }
  }, []);

  const clearProof = useCallback(() => {
    const cleared = { txId: '', screenshot: null };
    setProof(cleared);
    saveProof(cleared);
  }, []);

  return {
    txId: proof.txId,
    screenshot: proof.screenshot,
    setTxId,
    setScreenshot,
    clearProof,
  };
}
