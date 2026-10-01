import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { MovieDetailScreen } from '../../features/movies/presentation/screens/MovieDetailScreen';
import { SeatMapScreen } from '../../features/seating/presentation/screens/SeatMapScreen';
import { ShowtimesScreen } from '../../features/showtimes/presentation/screens/ShowtimesScreen';
import { TrailerScreen } from '../../features/trailer/presentation/screens/TrailerScreen';
import { colors } from '../../core/theme';
import { trailerOrientation } from './orientation';
import { Tabs } from './Tabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Screens 05–07 and the trailer cover the tab bar, as in the design. */
export function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="Showtimes" component={ShowtimesScreen} />
      <Stack.Screen name="SeatMap" component={SeatMapScreen} />
      <Stack.Screen
        name="Trailer"
        component={TrailerScreen}
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: true,
          animation: 'fade',
          orientation: trailerOrientation,
          contentStyle: { backgroundColor: colors.gradientEnd },
        }}
      />
    </Stack.Navigator>
  );
}
