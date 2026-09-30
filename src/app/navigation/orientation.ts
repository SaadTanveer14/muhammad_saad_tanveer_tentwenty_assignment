import { Platform } from 'react-native';

/**
 * Orientation for regular screens. iPhones stay portrait (as the app has
 * always behaved there); iPad and Android keep their default behaviour.
 * The iPhone lock lives here rather than in Info.plist because Info.plist
 * must also allow landscape for the trailer.
 */
export const defaultOrientation =
  Platform.OS === 'ios' && !Platform.isPad ? 'portrait' : 'default';

/** The full-screen trailer always plays in landscape. */
export const trailerOrientation = 'landscape';
