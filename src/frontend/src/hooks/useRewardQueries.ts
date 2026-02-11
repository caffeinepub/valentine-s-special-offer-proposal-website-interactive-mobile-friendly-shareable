import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { Variant_bronze_gold_diamond_basic_silver } from '../backend';

// Ownership Management
export function useGetOwnershipStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['ownershipStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const owner = await actor.getOwner();
      return {
        hasOwner: owner !== null,
        owner: owner,
      };
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsOwner() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['isOwner', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      const owner = await actor.getOwner();
      if (!owner) return false;
      return owner.toString() === identity.getPrincipal().toString();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useClaimOwnership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimOwnership();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownershipStatus'] });
      queryClient.invalidateQueries({ queryKey: ['isOwner'] });
    },
  });
}

// Account Summary
export function useGetAccountSummary() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['accountSummary'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      const [balance, vipStatus, totalEarnings] = await Promise.all([
        actor.getTotalRewardedAmount(),
        actor.getCallerVIPStatus(),
        actor.getTotalRewardedAmount(),
      ]);

      return {
        balance: Number(balance) / 100,
        vipTier: vipStatus.tier as string,
        hasPendingUpgrade: vipStatus.requestedUpgrade?.status === 'pending',
        totalEarnings: Number(totalEarnings) / 100,
      };
    },
    enabled: !!actor && !actorFetching,
  });
}

// Recent Activity
export function useGetRecentActivity() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      const [claims, exchangeState] = await Promise.all([
        actor.getCallerEarningClaims(),
        actor.getExchangeStateShared(),
      ]);

      const activities: any[] = [];

      // Add earning claims
      claims.forEach(claim => {
        activities.push({
          id: claim.id,
          type: 'claim',
          description: 'Earning claim',
          amount: claim.status === 'approved' ? Number(claim.rewardAmount) / 100 : null,
          status: claim.status as string,
          timestamp: claim.created,
        });
      });

      // Add deposits
      exchangeState.deposits.forEach(([id, deposit]) => {
        activities.push({
          id,
          type: 'deposit',
          description: 'USDT Deposit',
          amount: deposit.status === 'completed' ? Number(deposit.amount) / 100 : null,
          status: deposit.status,
          timestamp: deposit.timestamp,
        });
      });

      // Add withdrawals
      exchangeState.withdrawals.forEach(([id, withdrawal]) => {
        activities.push({
          id,
          type: 'withdrawal',
          description: 'USDT Withdrawal',
          amount: null,
          status: withdrawal.status,
          timestamp: withdrawal.timestamp,
        });
      });

      // Sort by timestamp descending
      activities.sort((a, b) => Number(b.timestamp - a.timestamp));

      return activities.slice(0, 10);
    },
    enabled: !!actor && !actorFetching,
  });
}

// Earning Items
export function useGetEarningItems() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['earningItems'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const items = await actor.getAllEarningItems();
      return items.map(([_, item]) => item);
    },
    enabled: !!actor && !actorFetching,
  });
}

// Earning Claims
export function useGetCallerEarningClaims() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['earningClaims'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerEarningClaims();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSubmitEarningClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { itemId: string; intent: string; proof: string; userMessage: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitEarningClaim(params.itemId, params.intent, params.proof, params.userMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earningClaims'] });
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] });
    },
  });
}

// VIP Status
export function useGetVIPStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['vipStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerVIPStatus();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRequestVIPUpgrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tierTo: Variant_bronze_gold_diamond_basic_silver) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestVIPUpgrade(tierTo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vipStatus'] });
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
    },
  });
}

// USDT Addresses
export function useGetUsdtAddresses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['usdtAddresses'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUsdtDepositAddresses();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetUsdtAddresses() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addresses: { trc20Address: string; erc20Address: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setUsdtDepositAddresses(addresses);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usdtAddresses'] });
    },
  });
}

// Deposits & Withdrawals
export function useRequestDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { amount: number; txId: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestDeposit('USDT', BigInt(params.amount), params.txId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferHistory'] });
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] });
    },
  });
}

export function useRequestWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { amount: number; destinationAddress: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestWithdrawal('USDT', BigInt(params.amount), params.destinationAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transferHistory'] });
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
      queryClient.invalidateQueries({ queryKey: ['recentActivity'] });
    },
  });
}

export function useGetTransferHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['transferHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const state = await actor.getExchangeStateShared();
      
      const transfers: any[] = [];
      
      state.deposits.forEach(([id, deposit]) => {
        transfers.push({
          id,
          type: 'deposit',
          amount: deposit.amount,
          status: deposit.status,
          timestamp: deposit.timestamp,
          txId: deposit.txId || null,
        });
      });
      
      state.withdrawals.forEach(([id, withdrawal]) => {
        transfers.push({
          id,
          type: 'withdrawal',
          amount: withdrawal.amount,
          status: withdrawal.status,
          timestamp: withdrawal.timestamp,
          txId: null,
        });
      });
      
      transfers.sort((a, b) => Number(b.timestamp - a.timestamp));
      
      return transfers;
    },
    enabled: !!actor && !actorFetching,
  });
}

// Admin Functions
export function useGetPendingDeposits() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['pendingDeposits'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPendingDeposits();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useMarkDepositCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: Principal; depositId: string; txId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markDepositCompleted(params.user, params.depositId, params.txId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDeposits'] });
    },
  });
}

export function useGetPendingWithdrawals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['pendingWithdrawals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPendingWithdrawals();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useMarkWithdrawalCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: Principal; withdrawalId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markWithdrawalCompleted(params.user, params.withdrawalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingWithdrawals'] });
    },
  });
}

export function useGetPendingClaims() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['pendingClaims'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPendingEarningClaims();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useApproveEarningClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { claimId: string; adminMessage: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveEarningClaim(params.claimId, params.adminMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingClaims'] });
    },
  });
}

export function useRejectEarningClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { claimId: string; adminMessage: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectEarningClaim(params.claimId, params.adminMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingClaims'] });
    },
  });
}

export function useGetPendingVIPUpgrades() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['pendingVIPUpgrades'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPendingVIPUpgrades();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useApproveVIPUpgrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: Principal; adminMessage: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveVIPUpgrade(params.user, params.adminMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingVIPUpgrades'] });
    },
  });
}

export function useRejectVIPUpgrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: Principal; adminMessage: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectVIPUpgrade(params.user, params.adminMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingVIPUpgrades'] });
    },
  });
}
