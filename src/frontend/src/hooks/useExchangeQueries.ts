import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Variant_buy_sell } from '../backend';

export function useGetExchangeState() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['exchangeState'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getExchangeStateShared();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUsdtDepositAddresses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['usdtDepositAddresses'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUsdtDepositAddresses();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetUsdtDepositAddresses() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addresses: { trc20Address: string; erc20Address: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setUsdtDepositAddresses(addresses);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usdtDepositAddresses'] });
    },
  });
}

export function useRequestExchangeDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { assetSymbol: string; amount: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestDeposit(params.assetSymbol, BigInt(params.amount), null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeState'] });
    },
  });
}

export function useRequestExchangeWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { assetSymbol: string; amount: number; destinationAddress: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestWithdrawal(params.assetSymbol, BigInt(params.amount), params.destinationAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeState'] });
    },
  });
}

export function useTrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      tradeType: Variant_buy_sell;
      inputAssetSymbol: string;
      outputAssetSymbol: string;
      amount: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.trade(
        params.tradeType,
        params.inputAssetSymbol,
        params.outputAssetSymbol,
        BigInt(params.amount)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeState'] });
    },
  });
}

export function useGetPendingExchangeDeposits() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['pendingExchangeDeposits'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPendingDeposits();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPendingExchangeWithdrawals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['pendingExchangeWithdrawals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPendingWithdrawals();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useMarkExchangeDepositCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: any; depositId: string; txId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markDepositCompleted(params.user, params.depositId, params.txId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingExchangeDeposits'] });
    },
  });
}

export function useMarkExchangeWithdrawalCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: any; withdrawalId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markWithdrawalCompleted(params.user, params.withdrawalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingExchangeWithdrawals'] });
    },
  });
}
