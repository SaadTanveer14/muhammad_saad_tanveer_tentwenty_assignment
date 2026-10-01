import type { LinkingOptions } from '@react-navigation/native';
import { Platform, Settings } from 'react-native';

import type { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['cinebook://'],
  config: {
    // Deep links into pushed screens keep Tabs underneath, so Back works.
    initialRouteName: 'Tabs',
    screens: {
      Tabs: {
        screens: {
          Watch: {
            screens: {
              WatchHome: '',
              Search: 'search',
              SearchResults: {
                path: 'search/results',
                parse: { genreId: Number },
              },
            },
          },
        },
      },
      MovieDetail: { path: 'movie/:movieId', parse: { movieId: Number } },
      Showtimes: {
        path: 'movie/:movieId/showtimes',
        parse: { movieId: Number },
      },
      SeatMap: {
        path: 'movie/:movieId/seats/:showtimeId',
        parse: { movieId: Number },
      },
    },
  },
};

/**
 * Dev-only (iOS): open a deep link at launch without the system "Open in…"
 * prompt, for QA and screenshots:
 *   xcrun simctl launch booted com.cinebook -devInitialUrl cinebook://search
 */
if (__DEV__ && Platform.OS === 'ios') {
  try {
    const devUrl = Settings.get('devInitialUrl');
    if (typeof devUrl === 'string' && devUrl.startsWith('cinebook://')) {
      linking.getInitialURL = async () => devUrl;
    }
  } catch {
    // No native Settings module (e.g. under Jest).
  }
}
