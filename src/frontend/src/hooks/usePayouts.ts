import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Payout } from '../backend';

export function useGetPayoutHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Payout[]>({
    queryKey: ['payoutHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPayoutHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRequestPayout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestPayout(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payoutHistory'] });
      queryClient.invalidateQueries({ queryKey: ['miningState'] });
    },
  });
}
