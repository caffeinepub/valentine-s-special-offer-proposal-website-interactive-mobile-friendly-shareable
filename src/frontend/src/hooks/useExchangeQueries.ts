import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ExchangeState, Deposit, Withdrawal, Trade, Variant_buy_sell, DepositAddresses } from '../backend';

export function useExchangeState() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ExchangeState>({
    queryKey: ['exchangeState'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getExchangeStateShared();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

export function useGetUsdtDepositAddresses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DepositAddresses>({
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
    mutationFn: async (addresses: DepositAddresses) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setUsdtDepositAddresses(addresses);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usdtDepositAddresses'] });
    },
  });
}

export function useCreateDeposit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assetSymbol, amount }: { assetSymbol: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestDeposit(assetSymbol, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeState'] });
    },
  });
}

export function useCreateWithdrawal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assetSymbol,
      amount,
      destinationAddress,
    }: {
      assetSymbol: string;
      amount: bigint;
      destinationAddress: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestWithdrawal(assetSymbol, amount, destinationAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeState'] });
    },
  });
}

export function useMarkDepositCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, depositId, txId }: { user: string; depositId: string; txId: string }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = { __principal__: user } as any;
      return actor.markDepositCompleted(principal, depositId, txId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeState'] });
    },
  });
}

export function useMarkWithdrawalCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, withdrawalId }: { user: string; withdrawalId: string }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = { __principal__: user } as any;
      return actor.markWithdrawalCompleted(principal, withdrawalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeState'] });
    },
  });
}

export function usePlaceTrade() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tradeType,
      inputAssetSymbol,
      outputAssetSymbol,
      amount,
    }: {
      tradeType: Variant_buy_sell;
      inputAssetSymbol: string;
      outputAssetSymbol: string;
      amount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.trade(tradeType, inputAssetSymbol, outputAssetSymbol, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchangeState'] });
    },
  });
}
