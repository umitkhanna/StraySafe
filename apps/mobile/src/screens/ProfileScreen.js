import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, USER_ROLES } from '../config/constants';
import DoublePawLogo from '../components/DoublePawLogo';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Implement API call to update profile
    console.log('Saving profile:', formData);
    setEditMode(false);
    Alert.alert('Success', 'Profile updated successfully!');
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return COLORS.error;
      case USER_ROLES.NGO_ADMIN:
      case USER_ROLES.MUNICIPALITY_ADMIN:
        return COLORS.info;
      case USER_ROLES.OPERATORS:
        return COLORS.warning;
      case USER_ROLES.GROUND_STAFF:
        return COLORS.success;
      case USER_ROLES.HIGH_RISK_USER:
        return COLORS.primary;
      default:
        return COLORS.text.secondary;
    }
  };

  const renderProfileHeader = () => (
    <View style={styles.header}>
      <DoublePawLogo size={80} color={COLORS.text.light} />
      <Text style={styles.userName}>{user?.name}</Text>
      <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user?.role) }]}>
        <Text style={styles.roleBadgeText}>{getRoleDisplayName(user?.role)}</Text>
      </View>
    </View>
  );

  const renderInfoSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditMode(!editMode)}
        >
          <Text style={styles.editButtonText}>
            {editMode ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Name */}
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Name</Text>
        {editMode ? (
          <TextInput
            style={styles.infoInput}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.text.secondary}
          />
        ) : (
          <Text style={styles.infoValue}>{user?.name || 'Not provided'}</Text>
        )}
      </View>

      {/* Email */}
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{user?.email}</Text>
      </View>

      {/* Phone Number */}
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Phone Number</Text>
        {editMode ? (
          <TextInput
            style={styles.infoInput}
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange('phoneNumber', value)}
            placeholder="Enter your phone number"
            placeholderTextColor={COLORS.text.secondary}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.infoValue}>{user?.phoneNumber || 'Not provided'}</Text>
        )}
      </View>

      {/* Address */}
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Address</Text>
        {editMode ? (
          <TextInput
            style={[styles.infoInput, styles.addressInput]}
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            placeholder="Enter your address"
            placeholderTextColor={COLORS.text.secondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        ) : (
          <Text style={styles.infoValue}>{user?.address || 'Not provided'}</Text>
        )}
      </View>

      {editMode && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderOrganizationInfo = () => {
    if (user?.role === USER_ROLES.USER || user?.role === USER_ROLES.HIGH_RISK_USER) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Organization Information</Text>
        
        {user?.ngoName && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>NGO Name</Text>
            <Text style={styles.infoValue}>{user.ngoName}</Text>
          </View>
        )}

        {user?.municipalityName && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Municipality</Text>
            <Text style={styles.infoValue}>{user.municipalityName}</Text>
          </View>
        )}

        {user?.city && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>City</Text>
            <Text style={styles.infoValue}>{user.city}</Text>
          </View>
        )}

        {user?.state && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>State</Text>
            <Text style={styles.infoValue}>{user.state}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Actions</Text>
      
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>🔒 Change Password</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>📞 Contact Support</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>ℹ️ About App</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.logoutButton]} 
        onPress={handleLogout}
      >
        <Text style={[styles.actionButtonText, styles.logoutButtonText]}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderProfileHeader()}
      {renderInfoSection()}
      {renderOrganizationInfo()}
      {renderActions()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    padding: SIZES.padding,
    paddingTop: 40,
    paddingBottom: 30,
  },
  userName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text.light,
    marginTop: 16,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeText: {
    color: COLORS.text.light,
    fontSize: SIZES.body4,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.surface,
    margin: SIZES.padding,
    marginBottom: 16,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editButtonText: {
    color: COLORS.text.light,
    fontSize: SIZES.body4,
    fontWeight: '600',
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: SIZES.body4,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: SIZES.body3,
    color: COLORS.text.primary,
  },
  infoInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: SIZES.radius / 2,
    padding: 12,
    fontSize: SIZES.body3,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background,
  },
  addressInput: {
    height: 80,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: COLORS.text.light,
    fontSize: SIZES.body3,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: SIZES.body3,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  logoutButtonText: {
    color: COLORS.text.light,
  },
});

export default ProfileScreen;
