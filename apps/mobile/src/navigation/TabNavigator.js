import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import TicketsScreen from '../screens/TicketsScreen';
import ReportIncidentScreen from '../screens/ReportIncidentScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Config
import { COLORS, SIZES } from '../config/constants';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

// Custom Tab Bar Icons
const DashboardIcon = ({ focused, color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
      fill={color}
    />
  </Svg>
);

const TicketsIcon = ({ focused, color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
      fill={color}
    />
    <Path
      d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
      stroke={focused ? COLORS.surface : color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ReportIcon = ({ focused, color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
      fill={color}
    />
  </Svg>
);

const ProfileIcon = ({ focused, color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill={color}
    />
  </Svg>
);

const TabNavigator = () => {
  const { user } = useAuth();

  const getTabsForRole = (role) => {
    // All users get Dashboard and Profile
    const baseTabs = [
      {
        name: 'Dashboard',
        component: DashboardScreen,
        icon: DashboardIcon,
        label: 'Dashboard',
      },
      {
        name: 'Profile',
        component: ProfileScreen,
        icon: ProfileIcon,
        label: 'Profile',
      },
    ];

    // Add role-specific tabs
    if (role === 'groundStaff' || role === 'operators' || role === 'user' || role === 'highRiskUser') {
      baseTabs.splice(1, 0, {
        name: 'Report',
        component: ReportIncidentScreen,
        icon: ReportIcon,
        label: 'Report',
      });
    }

    if (role === 'operators' || role === 'ngoAdmin' || role === 'municipalityAdmin' || role === 'admin') {
      baseTabs.splice(-1, 0, {
        name: 'Tickets',
        component: TicketsScreen,
        icon: TicketsIcon,
        label: 'Tickets',
      });
    }

    return baseTabs;
  };

  const tabs = getTabsForRole(user?.role);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const tab = tabs.find(tab => tab.name === route.name);
          const IconComponent = tab?.icon;
          return IconComponent ? (
            <IconComponent focused={focused} color={color} size={size} />
          ) : null;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: SIZES.body5,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.text.light,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: SIZES.h3,
        },
      })}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            headerTitle: tab.label,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default TabNavigator;
