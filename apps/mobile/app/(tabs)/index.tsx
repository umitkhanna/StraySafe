import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

interface DashboardStats {
  totalTickets: number;
  myTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  recentTickets: Array<{
    _id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    location: string | { type: string; coordinates: number[] };
  }>;
}

// Helper function to safely extract location string
const getLocationString = (location: string | { type: string; coordinates: number[] } | undefined): string => {
  if (!location) return 'Unknown location';
  if (typeof location === 'string') return location;
  if (typeof location === 'object' && location.coordinates) {
    // If it's a GeoJSON object, format coordinates or return a default message
    return `Lat: ${location.coordinates[1]?.toFixed(4)}, Lng: ${location.coordinates[0]?.toFixed(4)}`;
  }
  return 'Unknown location';
};

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      const response = await axios.get(getApiUrl('dashboard/stats'));
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'users': return 'User';
      case 'highriskusers': return 'High Risk User';
      case 'groundstaff': return 'Ground Staff';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#ff8a95'; // Softer red
      case 'medium': return '#ffc085'; // Softer orange
      case 'low': return '#8dd9a3'; // Softer green
      default: return '#999';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return '#8b9aff'; // Softer blue
      case 'in_progress': return '#ffc085'; // Softer orange
      case 'resolved': return '#8dd9a3'; // Softer green
      case 'closed': return '#a8a8a8'; // Softer gray
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userRole}>{getRoleDisplayName(user?.role || '')}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.primaryCard]}>
            <Text style={styles.statNumber}>{stats?.totalTickets || 0}</Text>
            <Text style={styles.statLabel}>Total Tickets</Text>
          </View>
          <View style={[styles.statCard, styles.secondaryCard]}>
            <Text style={styles.statNumber}>{stats?.myTickets || 0}</Text>
            <Text style={styles.statLabel}>My Tickets</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.successCard]}>
            <Text style={styles.statNumber}>{stats?.resolvedTickets || 0}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={[styles.statCard, styles.warningCard]}>
            <Text style={styles.statNumber}>{stats?.pendingTickets || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/report')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionTitle}>Report Incident</Text>
            <Text style={styles.actionDesc}>Submit a new report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/tickets')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionTitle}>View Tickets</Text>
            <Text style={styles.actionDesc}>See all tickets</Text>
          </TouchableOpacity>
          
          {(user?.role === 'groundstaff' || user?.role === 'admin') && (
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/manage')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionTitle}>Manage</Text>
              <Text style={styles.actionDesc}>Manage system</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recent Tickets */}
      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Tickets</Text>
        {stats?.recentTickets?.length ? (
          stats.recentTickets.map((ticket) => (
            <TouchableOpacity 
              key={ticket._id} 
              style={styles.ticketCard}
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle} numberOfLines={2}>
                  {ticket.title}
                </Text>
                <View style={styles.ticketBadges}>
                  <View style={[styles.badge, { backgroundColor: getPriorityColor(ticket.priority) }]}>
                    <Text style={styles.badgeText}>{ticket.priority}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getStatusColor(ticket.status) }]}>
                    <Text style={styles.badgeText}>{ticket.status}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.ticketLocation}>📍 {getLocationString(ticket.location)}</Text>
              <Text style={styles.ticketDate}>
                {new Date(ticket.createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent tickets</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#ff6b35',
    paddingTop: 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  userRole: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
    paddingTop: 24,
    marginTop: 0,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryCard: {
    backgroundColor: '#8b9aff', // Softer blue
  },
  secondaryCard: {
    backgroundColor: '#a5a8ff', // Softer indigo
  },
  successCard: {
    backgroundColor: '#8dd9a3', // Softer green
  },
  warningCard: {
    backgroundColor: '#ffc085', // Softer orange
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.95,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
  recentContainer: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  ticketBadges: {
    flexDirection: 'column',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ticketLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  ticketDate: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
});
