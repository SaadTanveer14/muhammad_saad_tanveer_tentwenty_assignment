import { useQuery } from '@tanstack/react-query';

import { cachePolicy } from '../../../../app/cachePolicy';
import { searchKeys, searchRepository } from '../../data';

export function useCategories() {
  return useQuery({
    queryKey: searchKeys.categories(),
    queryFn: ({ signal }) => searchRepository.getCategories(signal),
    staleTime: cachePolicy.detail.staleTime,
  });
}
