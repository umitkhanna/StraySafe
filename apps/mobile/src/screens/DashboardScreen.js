import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, USER_ROLES } from '../config/constants';
import DoublePawLogo from '../components/DoublePawLogo';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    myReports: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // TODO: Implement API call to fetch dashboard data
      // For now, using mock data
      setStats({
        totalTickets: 25,
        pendingTickets: 8,
        resolvedTickets: 17,
        myReports: 3,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const renderWelcomeCard = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.welcomeCard}
    >
      <View style={styles.welcomeContent}>
        <DoublePawLogo size={50} color={COLORS.text.light} />
        <View style={styles.welcomeText}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeName}>{user?.name}</Text>
          <Text style={styles.welcomeRole}>{getRoleDisplayName(user?.role)}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderStatCard = (title, value, color = COLORS.primary) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderQuickActions = () => {
    const actions = getQuickActionsForRole(user?.role);
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Text style={styles.actionIconText}>{action.icon}</Text>
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      [USER_ROLES.ADMIN]: 'Administrator',
      [USER_ROLES.NGO_ADMIN]: 'NGO Administrator',
      [USER_ROLES.MUNICIPALITY_ADMIN]: 'Municipality Administrator',
      [USER_ROLES.OPERATORS]: 'Operator',
      [USER_ROLES.GROUND_STAFF]: 'Ground Staff',
      [USER_ROLES.HIGH_RISK_USER]: 'High Risk User',
      [USER_ROLES.USER]: 'User',
    };
    return roleNames[role] || role;
  };

  const getQuickActionsForRole = (role) => {
    const baseActions = [
      {
        title: 'View Profile',
        icon: '👤',
        color: COLORS.info,
        onPress: () => navigation.navigate('Profile'),
      },
    ];

    if (role === USER_ROLES.GROUND_STAFF || role === USER_ROLES.USER || role === USER_ROLES.HIGH_RISK_USER) {
      baseActions.unshift({
        title: 'Report Incident',
        icon: '📝',
        color: COLORS.error,
        onPress: () => navigation.navigate('Report'),
      });
    }

    if (role === USER_ROLES.OPERATORS || role === USER_ROLES.NGO_ADMIN || 
        role === USER_ROLES.MUNICIPALITY_ADMIN || role === USER_ROLES.ADMIN) {
      baseActions.unshift({
        title: 'View Tickets',
        icon: '🎫',
        color: COLORS.warning,
        onPress: () => navigation.navigate('Tickets'),
      });
    }

    baseActions.push({
      title: 'Logout',
      icon: '🚪',
      color: COLORS.text.secondary,
      onPress: handleLogout,
    });

    return baseActions;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {renderWelcomeCard()}

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {user?.role === USER_ROLES.USER || user?.role === USER_ROLES.HIGH_RISK_USER ? (
            <>
              {renderStatCard('My Reports', stats.myReports, COLORS.primary)}
              {renderStatCard('Total Tickets', stats.totalTickets, COLORS.info)}
            </>
          ) : (
            <>
              {renderStatCard('Total Tickets', stats.totalTickets, COLORS.primary)}
              {renderStatCard('Pending', stats.pendingTickets, COLORS.warning)}
              {renderStatCard('Resolved', stats.resolvedTickets, COLORS.success)}
            </>
          )}
        </View>
      </View>

      {renderQuickActions()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeCard: {
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: SIZES.body3,
    color: COLORS.text.light,
    opacity: 0.9,
  },
  welcomeName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text.light,
    marginTop: 4,
  },
  welcomeRole: {
    fontSize: SIZES.body4,
    color: COLORS.text.light,
    opacity: 0.8,
    marginTop: 2,
  },
  section: {
    margin: SIZES.padding,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    minWidth: '30%',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    marginBottom: 16,
  },
  statValue: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statTitle: {
    fontSize: SIZES.body4,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: SIZES.body4,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
});

export default DashboardScreen;
