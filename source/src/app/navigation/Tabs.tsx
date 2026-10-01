import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { type ReactNode } from 'react';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useResponsive } from '../../core/layout';
import { colors } from '../../core/theme';
import { ComingSoonScreen } from '../screens/ComingSoonScreen';
import { AppTabBar } from './AppTabBar';
import type { TabParamList } from './types';
import { WatchStack } from './WatchStack';

const Tab = createBottomTabNavigator<TabParamList>();

const Dashboard = () => <ComingSoonScreen title="Dashboard" />;
const MediaLibrary = () => <ComingSoonScreen title="Media Library" />;
const More = () => <ComingSoonScreen title="More" />;

/**
 * With the rail on the left, the rail already covers the left safe area,
 * so screens beside it must not pad for it again (that left a large gap in
 * landscape-left, where the camera cutout is on the left).
 */
function ConsumeLeftInset({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaInsetsContext.Provider value={{ ...insets, left: 0 }}>
      {children}
    </SafeAreaInsetsContext.Provider>
  );
}

function railScreenLayout({ children }: { children: React.ReactElement }) {
  return <ConsumeLeftInset>{children}</ConsumeLeftInset>;
}

/** Bottom bar; a left rail on expanded widths (tablets, large landscape). */
export function Tabs() {
  const rail = useResponsive().sizeClass === 'expanded';
  return (
    <Tab.Navigator
      initialRouteName="Watch"
      tabBar={props => <AppTabBar {...props} rail={rail} />}
      screenLayout={rail ? railScreenLayout : undefined}
      screenOptions={{
        headerShown: false,
        tabBarPosition: rail ? 'left' : 'bottom',
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Watch" component={WatchStack} />
      <Tab.Screen name="MediaLibrary" component={MediaLibrary} />
      <Tab.Screen name="More" component={More} />
    </Tab.Navigator>
  );
}
