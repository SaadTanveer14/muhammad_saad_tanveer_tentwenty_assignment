import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

/**
 * Feed NetInfo into TanStack Query so queries pause while offline and
 * refetch automatically on reconnect. Returns the unsubscribe function.
 */
export function wireOnlineManager(): () => void {
  onlineManager.setEventListener(setOnline =>
    NetInfo.addEventListener(state => {
      setOnline(
        state.isConnected !== false && state.isInternetReachable !== false,
      );
    }),
  );
  return () => onlineManager.setEventListener(() => undefined);
}
