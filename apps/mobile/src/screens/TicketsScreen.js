import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, PRIORITY_LEVELS } from '../config/constants';

const TicketsScreen = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTickets, setFilteredTickets] = useState([]);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm]);

  const loadTickets = async () => {
    try {
      // TODO: Implement API call to fetch tickets
      // For now, using mock data
      const mockTickets = [
        {
          id: '1',
          title: 'Dog Bite Incident',
          description: 'Aggressive dog bite near park area',
          status: 'open',
          priority: 'high',
          incidentType: 'Dog Bite',
          location: 'Central Park, Mumbai',
          reportedBy: 'John Doe',
          createdAt: '2024-08-29T10:30:00Z',
        },
        {
          id: '2',
          title: 'Stray Dog Gathering',
          description: 'Large group of stray dogs causing disturbance',
          status: 'in-progress',
          priority: 'medium',
          incidentType: 'Stray Gathering',
          location: 'Market Street, Delhi',
          reportedBy: 'Jane Smith',
          createdAt: '2024-08-28T15:45:00Z',
        },
        {
          id: '3',
          title: 'Dog Chasing Incident',
          description: 'Dog chasing children in residential area',
          status: 'resolved',
          priority: 'low',
          incidentType: 'Dog Chasing',
          location: 'Residential Area, Pune',
          reportedBy: 'Mike Johnson',
          createdAt: '2024-08-27T09:15:00Z',
        },
      ];
      setTickets(mockTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const filterTickets = () => {
    if (!searchTerm) {
      setFilteredTickets(tickets);
    } else {
      const filtered = tickets.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTickets(filtered);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case PRIORITY_LEVELS.HIGH:
      case PRIORITY_LEVELS.CRITICAL:
        return COLORS.error;
      case PRIORITY_LEVELS.MEDIUM:
        return COLORS.warning;
      case PRIORITY_LEVELS.LOW:
        return COLORS.success;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return COLORS.error;
      case 'in-progress':
        return COLORS.warning;
      case 'resolved':
        return COLORS.success;
      default:
        return COLORS.text.secondary;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderTicketItem = ({ item }) => (
    <TouchableOpacity style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle}>{item.title}</Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.badgeText}>{item.priority}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.ticketDescription}>{item.description}</Text>
      
      <View style={styles.ticketInfo}>
        <Text style={styles.infoText}>📍 {item.location}</Text>
        <Text style={styles.infoText}>👤 {item.reportedBy}</Text>
        <Text style={styles.infoText}>🕒 {formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tickets..."
          placeholderTextColor={COLORS.text.secondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Tickets List */}
      <FlatList
        data={filteredTickets}
        renderItem={renderTicketItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tickets found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: 12,
    fontSize: SIZES.body3,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  listContainer: {
    padding: SIZES.padding,
  },
  ticketCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
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
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketTitle: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.text.light,
    fontSize: SIZES.body5,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ticketDescription: {
    fontSize: SIZES.body3,
    color: COLORS.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  ticketInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    gap: 4,
  },
  infoText: {
    fontSize: SIZES.body4,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: SIZES.body2,
    color: COLORS.text.secondary,
  },
});

export default TicketsScreen;
