import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { WatchHomeScreen } from '../../features/movies/presentation/screens/WatchHomeScreen';
import { SearchResultsScreen } from '../../features/search/presentation/screens/SearchResultsScreen';
import { SearchScreen } from '../../features/search/presentation/screens/SearchScreen';
import { colors } from '../../core/theme';
import type { WatchStackParamList } from './types';

const Stack = createNativeStackNavigator<WatchStackParamList>();

/** Screens 01–04: the tab bar stays visible. Headers are drawn per screen. */
export function WatchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="WatchHome" component={WatchHomeScreen} />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
    </Stack.Navigator>
  );
}
