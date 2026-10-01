import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NativeInterfaceOrientation from '../../native/NativeInterfaceOrientation';

/** UIWindowScene orientation with the camera / Dynamic Island on the left. */
const ISLAND_ON_LEFT = 90;

/**
 * How much of the left safe area a left-edge element (the tab rail) must
 * actually keep clear.
 *
 * - Android reports the inset only on the side with the camera cutout, so
 *   it's used as-is.
 * - iOS reports the same inset on both sides in landscape, even where
 *   there's no hardware. Only honour it when the island is really on the
 *   left; otherwise the rail would grow by ~60 pt for nothing.
 */
export function useRailLeftInset(): number {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [orientation, setOrientation] = useState<number | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'ios' || !NativeInterfaceOrientation) {
      return;
    }
    let active = true;
    // Window dimensions change after every rotation, so re-read then.
    NativeInterfaceOrientation.getInterfaceOrientation()
      .then(value => active && setOrientation(value))
      .catch(() => active && setOrientation(null));
    return () => {
      active = false;
    };
  }, [width, height]);

  if (Platform.OS !== 'ios') {
    return insets.left;
  }
  if (orientation === null) {
    // Unknown (module unavailable): be safe and keep clear of the inset.
    return insets.left;
  }
  return orientation === ISLAND_ON_LEFT ? insets.left : 0;
}
