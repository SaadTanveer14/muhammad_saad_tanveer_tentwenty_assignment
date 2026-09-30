import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

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

/** Bottom bar; a left rail on expanded widths (tablets, large landscape). */
export function Tabs() {
  const rail = useResponsive().sizeClass === 'expanded';
  return (
    <Tab.Navigator
      initialRouteName="Watch"
      tabBar={props => <AppTabBar {...props} rail={rail} />}
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
