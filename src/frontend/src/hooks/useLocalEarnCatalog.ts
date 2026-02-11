import { useMemo } from 'react';

export type VIPTier = 'basic' | 'bronze' | 'silver' | 'gold' | 'diamond';

export interface LocalEarnItem {
  id: string;
  type: 'ad' | 'task';
  title: string;
  description: string;
  reward: number;
  dailyLimit: number;
}

const VIP_CONFIGS = {
  basic: { dailyAds: 5, dailyTasks: 3, adReward: 0.5, taskReward: 1.0 },
  bronze: { dailyAds: 10, dailyTasks: 5, adReward: 0.5, taskReward: 1.0 },
  silver: { dailyAds: 15, dailyTasks: 8, adReward: 1.0, taskReward: 2.0 },
  gold: { dailyAds: 20, dailyTasks: 10, adReward: 1.25, taskReward: 2.5 },
  diamond: { dailyAds: 30, dailyTasks: 15, adReward: 2.33, taskReward: 4.67 },
};

export function useLocalEarnCatalog(vipTier: VIPTier = 'basic'): LocalEarnItem[] {
  return useMemo(() => {
    const config = VIP_CONFIGS[vipTier] || VIP_CONFIGS.basic;
    
    return [
      {
        id: `ad-${vipTier}`,
        type: 'ad',
        title: '30-Second Video Ad',
        description: 'Watch a short video advertisement to earn rewards',
        reward: config.adReward,
        dailyLimit: config.dailyAds,
      },
      {
        id: `task-${vipTier}`,
        type: 'task',
        title: 'Complete Micro Task',
        description: 'Complete simple tasks like surveys, app testing, or social media engagement',
        reward: config.taskReward,
        dailyLimit: config.dailyTasks,
      },
    ];
  }, [vipTier]);
}

export function getVIPDailyEarnings(vipTier: VIPTier): number {
  const config = VIP_CONFIGS[vipTier] || VIP_CONFIGS.basic;
  return (config.dailyAds * config.adReward) + (config.dailyTasks * config.taskReward);
}
