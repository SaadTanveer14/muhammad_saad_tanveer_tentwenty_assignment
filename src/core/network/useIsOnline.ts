import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

export function useIsOnline(): boolean {
  return useSyncExternalStore(
    onlineManager.subscribe.bind(onlineManager),
    () => onlineManager.isOnline(),
    () => true,
  );
}
