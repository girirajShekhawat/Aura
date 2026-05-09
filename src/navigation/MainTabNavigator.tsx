import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ChatTabScreen } from '../screens/ChatTabScreen';
import { ModelsScreen } from '../screens/ModelsScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const BAR_BG = '#080d16';
const PILL_BG = '#131b2e';
const ACTIVE = '#38bdf8';
const INACTIVE = '#64748b';

function TabBarButton(props: BottomTabBarButtonProps) {
  const { children, style, accessibilityState, ...rest } = props;
  const focused = accessibilityState?.selected;
  return (
    <PlatformPressable
      {...rest}
      accessibilityState={accessibilityState}
      style={[styles.tabPill, focused ? styles.tabPillFocused : null, style]}>
      {children}
    </PlatformPressable>
  );
}

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          backgroundColor: BAR_BG,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingHorizontal: 6,
          paddingTop: 6,
          paddingBottom: bottomPad,
          minHeight: 52 + bottomPad,
        },
        tabBarItemStyle: styles.tabBarItem,
        tabBarButton: (p) => <TabBarButton {...p} />,
      }}>
      <Tab.Screen
        name="Chat"
        component={ChatTabScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="message-outline"
              size={size ?? 22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Models"
        component={ModelsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="database-outline"
              size={size ?? 22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={size ?? 22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cog-outline"
              size={size ?? 22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabPill: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 44,
  },
  tabPillFocused: {
    backgroundColor: PILL_BG,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 0,
  },
});
