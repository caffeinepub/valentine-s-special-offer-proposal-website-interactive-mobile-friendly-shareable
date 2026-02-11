import { useState, useEffect, useCallback } from 'react';

export type VIPTier = 'basic' | 'bronze' | 'silver' | 'gold' | 'diamond';

interface DailyQuota {
  date: string;
  adsWatched: number;
  tasksCompleted: number;
}

const STORAGE_KEY = 'taskora_daily_quota';

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function loadQuota(): DailyQuota {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const quota = JSON.parse(stored);
      if (quota.date === getTodayKey()) {
        return quota;
      }
    }
  } catch (e) {
    console.error('Failed to load quota:', e);
  }
  
  return {
    date: getTodayKey(),
    adsWatched: 0,
    tasksCompleted: 0,
  };
}

function saveQuota(quota: DailyQuota) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quota));
  } catch (e) {
    console.error('Failed to save quota:', e);
  }
}

export function useLocalEarnQuota(vipTier: VIPTier = 'basic') {
  const [quota, setQuota] = useState<DailyQuota>(loadQuota);

  useEffect(() => {
    const today = getTodayKey();
    if (quota.date !== today) {
      const newQuota = {
        date: today,
        adsWatched: 0,
        tasksCompleted: 0,
      };
      setQuota(newQuota);
      saveQuota(newQuota);
    }
  }, [quota.date]);

  const incrementAds = useCallback(() => {
    setQuota(prev => {
      const updated = { ...prev, adsWatched: prev.adsWatched + 1 };
      saveQuota(updated);
      return updated;
    });
  }, []);

  const incrementTasks = useCallback(() => {
    setQuota(prev => {
      const updated = { ...prev, tasksCompleted: prev.tasksCompleted + 1 };
      saveQuota(updated);
      return updated;
    });
  }, []);

  const getAdLimits = useCallback(() => {
    const limits = {
      basic: 5,
      bronze: 10,
      silver: 15,
      gold: 20,
      diamond: 30,
    };
    const max = limits[vipTier] || 5;
    return {
      used: quota.adsWatched,
      max,
      remaining: Math.max(0, max - quota.adsWatched),
      canWatch: quota.adsWatched < max,
    };
  }, [vipTier, quota.adsWatched]);

  const getTaskLimits = useCallback(() => {
    const limits = {
      basic: 3,
      bronze: 5,
      silver: 8,
      gold: 10,
      diamond: 15,
    };
    const max = limits[vipTier] || 3;
    return {
      used: quota.tasksCompleted,
      max,
      remaining: Math.max(0, max - quota.tasksCompleted),
      canComplete: quota.tasksCompleted < max,
    };
  }, [vipTier, quota.tasksCompleted]);

  return {
    quota,
    incrementAds,
    incrementTasks,
    getAdLimits,
    getTaskLimits,
  };
}
