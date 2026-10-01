import {
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';

import { colors, fontFamily } from '../core/theme';
import { AnimatedSplash } from './AnimatedSplash';
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
  // The app mounts underneath once the splash is opaque (so the native
  // launch screen is never replaced by a half-drawn app), and its data
  // loads while the splash plays.
  const [appMounted, setAppMounted] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const mountApp = useCallback(() => setAppMounted(true), []);
  const hideSplash = useCallback(() => setSplashVisible(false), []);

  return (
    <AppProviders>
      <StatusBar barStyle={splashVisible ? 'light-content' : 'dark-content'} />
      {appMounted ? (
        <NavigationContainer theme={navigationTheme} linking={linking}>
          <RootStack />
        </NavigationContainer>
      ) : null}
      {splashVisible ? (
        <AnimatedSplash onReady={mountApp} onFinish={hideSplash} />
      ) : null}
    </AppProviders>
  );
}
