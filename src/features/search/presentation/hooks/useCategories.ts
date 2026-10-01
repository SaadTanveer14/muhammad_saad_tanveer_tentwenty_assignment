import { useQuery } from '@tanstack/react-query';

import { cachePolicy } from '../../../../app/cachePolicy';
import { searchKeys, searchRepository } from '../../data';

export function useCategories() {
  return useQuery({
    queryKey: searchKeys.categories(),
    queryFn: ({ signal }) => searchRepository.getCategories(signal),
    staleTime: cachePolicy.detail.staleTime,
    // The tiles reference bundled artwork by module id, which changes with
    // every JS bundle; persisting them left blank tiles after an update.
    // They're local data anyway, so there's nothing to gain from disk.
    meta: { persist: false },
  });
}
