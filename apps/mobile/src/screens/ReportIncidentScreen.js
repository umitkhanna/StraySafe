import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, INCIDENT_TYPES, PRIORITY_LEVELS } from '../config/constants';

const ReportIncidentScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incidentType: '',
    priority: '',
    location: '',
    address: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.incidentType || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement API call to submit incident report
      console.log('Submitting incident report:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success',
        'Incident reported successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                title: '',
                description: '',
                incidentType: '',
                priority: '',
                location: '',
                address: '',
              });
              navigation.navigate('Dashboard');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPicker = (label, value, options, onSelect, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              value === option.value && styles.optionButtonSelected,
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                value === option.value && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const incidentTypeOptions = [
    { value: INCIDENT_TYPES.DOG_BITE, label: '🐕 Dog Bite' },
    { value: INCIDENT_TYPES.DOG_CHASING, label: '🏃 Dog Chasing' },
    { value: INCIDENT_TYPES.AGGRESSIVE_BEHAVIOR, label: '😠 Aggressive Behavior' },
    { value: INCIDENT_TYPES.STRAY_GATHERING, label: '👥 Stray Gathering' },
    { value: INCIDENT_TYPES.OTHER, label: '❓ Other' },
  ];

  const priorityOptions = [
    { value: PRIORITY_LEVELS.LOW, label: '🟢 Low' },
    { value: PRIORITY_LEVELS.MEDIUM, label: '🟡 Medium' },
    { value: PRIORITY_LEVELS.HIGH, label: '🟠 High' },
    { value: PRIORITY_LEVELS.CRITICAL, label: '🔴 Critical' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Report Incident</Text>
        <Text style={styles.subtitle}>Help us keep the community safe</Text>
      </View>

      <View style={styles.form}>
        {/* Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Brief description of the incident"
            placeholderTextColor={COLORS.text.secondary}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
          />
        </View>

        {/* Incident Type */}
        {renderPicker(
          'Incident Type',
          formData.incidentType,
          incidentTypeOptions,
          (value) => handleInputChange('incidentType', value),
          true
        )}

        {/* Priority */}
        {renderPicker(
          'Priority Level',
          formData.priority,
          priorityOptions,
          (value) => handleInputChange('priority', value)
        )}

        {/* Location */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Location <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Area or landmark name"
            placeholderTextColor={COLORS.text.secondary}
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
          />
        </View>

        {/* Address */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Complete address with pincode"
            placeholderTextColor={COLORS.text.secondary}
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            multiline
          />
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed description of what happened..."
            placeholderTextColor={COLORS.text.secondary}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.text.light} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>

        {/* Footer Note */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            📍 Your location will be automatically captured for emergency response.
          </Text>
          <Text style={styles.footerText}>
            📞 For immediate emergencies, please call local authorities.
          </Text>
        </View>
      </View>
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
    padding: SIZES.padding,
    paddingTop: 20,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text.light,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.body3,
    color: COLORS.text.light,
    opacity: 0.9,
  },
  form: {
    padding: SIZES.padding,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: SIZES.radius,
    padding: 16,
    fontSize: SIZES.body3,
    color: COLORS.text.primary,
    backgroundColor: COLORS.surface,
  },
  textArea: {
    height: 100,
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: SIZES.radius,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: SIZES.body4,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.text.light,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.text.light,
    fontSize: SIZES.body2,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
  },
  footerText: {
    fontSize: SIZES.body5,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default ReportIncidentScreen;
