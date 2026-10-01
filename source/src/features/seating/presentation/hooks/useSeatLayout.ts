import { useQuery } from '@tanstack/react-query';

import { cachePolicy } from '../../../../app/cachePolicy';
import { seatingKeys, seatingRepository } from '../../data';

export function useSeatLayout(layoutId: string | undefined) {
  return useQuery({
    queryKey: seatingKeys.layout(layoutId ?? ''),
    queryFn: ({ signal }) => seatingRepository.getSeatLayout(layoutId!, signal),
    enabled: Boolean(layoutId),
    staleTime: cachePolicy.search.staleTime,
  });
}
