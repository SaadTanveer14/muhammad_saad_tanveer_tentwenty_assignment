import { useCallback, useState } from 'react';
import { type LayoutChangeEvent, useWindowDimensions } from 'react-native';

/**
 * Measured width of a container (falls back to the window width until the
 * first layout). Use this for column maths so side rails and split screen
 * are accounted for.
 */
export function useLayoutWidth(): [number, (e: LayoutChangeEvent) => void] {
  const window = useWindowDimensions();
  const [width, setWidth] = useState<number | null>(null);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);
  return [width ?? window.width, onLayout];
}
