import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';

import { colors, fontFamily } from '../core/theme';
import { AppProviders } from './AppProviders';
import { linking, RootStack } from './navigation';

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
  },
  fonts: {
    regular: { fontFamily: fontFamily.regular, fontWeight: 'normal' },
    medium: { fontFamily: fontFamily.medium, fontWeight: 'normal' },
    bold: { fontFamily: fontFamily.semibold, fontWeight: 'normal' },
    heavy: { fontFamily: fontFamily.bold, fontWeight: 'normal' },
  },
};

export default function App() {
  return (
    <AppProviders>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer theme={navigationTheme} linking={linking}>
        <RootStack />
      </NavigationContainer>
    </AppProviders>
  );
}
