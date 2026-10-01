import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * iOS-only: the window scene's interface orientation, in degrees
 * (0 portrait, 90 landscape with the camera/Dynamic Island on the LEFT,
 * 270 landscape with it on the RIGHT, 180 upside down).
 *
 * Needed because iOS reports equal left/right safe-area insets in
 * landscape, so JS can't otherwise tell which side the island is on.
 * Not implemented on Android, where insets are already one-sided.
 */
export interface Spec extends TurboModule {
  getInterfaceOrientation(): Promise<number>;
}

export default TurboModuleRegistry.get<Spec>('InterfaceOrientation');
