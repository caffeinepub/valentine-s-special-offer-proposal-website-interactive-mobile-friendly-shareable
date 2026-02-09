import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { MiningConfig, MiningState, MiningEvent } from '../backend';

export function useGetMiningConfig() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MiningConfig | null>({
    queryKey: ['miningConfig'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMiningConfig();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateMiningConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: MiningConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMiningConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miningConfig'] });
      queryClient.invalidateQueries({ queryKey: ['miningState'] });
    },
  });
}

export function useGetMiningState() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MiningState | null>({
    queryKey: ['miningState'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMiningState();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: (query) => {
      const state = query.state.data;
      return state?.isActive ? 5000 : false;
    },
  });
}

export function useGetMiningEvents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MiningEvent[]>({
    queryKey: ['miningEvents'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMiningEvents();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useStartMining() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.startMining();
    },
    onSuccess: async () => {
      // Invalidate and actively refetch to ensure UI updates immediately
      await queryClient.invalidateQueries({ queryKey: ['miningState'] });
      await queryClient.invalidateQueries({ queryKey: ['miningEvents'] });
      await queryClient.refetchQueries({ queryKey: ['miningState'] });
      await queryClient.refetchQueries({ queryKey: ['miningEvents'] });
    },
  });
}

export function useStopMining() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.stopMining();
    },
    onSuccess: async () => {
      // Invalidate and actively refetch to ensure UI updates immediately
      await queryClient.invalidateQueries({ queryKey: ['miningState'] });
      await queryClient.invalidateQueries({ queryKey: ['miningEvents'] });
      await queryClient.refetchQueries({ queryKey: ['miningState'] });
      await queryClient.refetchQueries({ queryKey: ['miningEvents'] });
    },
  });
}
