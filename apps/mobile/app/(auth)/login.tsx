import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Navigate when authentication state changes
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (!success) {
      Alert.alert('Error', 'Invalid credentials. Please try again.');
    }
    // Navigation will be handled by useEffect when isAuthenticated becomes true
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          {/* Double Paw Logo */}
          <View style={styles.logoWrapper}>
            <View style={styles.pawContainer}>
              <View style={styles.paw}>
                <View style={styles.pawPad} />
                <View style={[styles.toe, styles.toe1]} />
                <View style={[styles.toe, styles.toe2]} />
                <View style={[styles.toe, styles.toe3]} />
                <View style={[styles.toe, styles.toe4]} />
              </View>
              <View style={[styles.paw, styles.paw2]}>
                <View style={styles.pawPad} />
                <View style={[styles.toe, styles.toe1]} />
                <View style={[styles.toe, styles.toe2]} />
                <View style={[styles.toe, styles.toe3]} />
                <View style={[styles.toe, styles.toe4]} />
              </View>
            </View>
          </View>
          <Text style={styles.title}>StraySafe</Text>
          <Text style={styles.subtitle}>Reducing Human-Stray Dog Conflicts</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.loginText}>Sign in to your account</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.roleHints}>
            <Text style={styles.roleHintTitle}>Demo Accounts:</Text>
            <Text style={styles.roleHint}>• Users: user@straysafe.com</Text>
            <Text style={styles.roleHint}>• High Risk Users: highrisk@straysafe.com</Text>
            <Text style={styles.roleHint}>• Ground Staff: staff@straysafe.com</Text>
            <Text style={styles.roleHint}>• Admin: admin@straysafe.com</Text>
            <Text style={styles.roleHint}>Password: password123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  pawContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paw: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  paw2: {
    marginLeft: -10,
    transform: [{ rotate: '-15deg' }],
  },
  pawPad: {
    width: 24,
    height: 20,
    backgroundColor: '#ff6b35',
    borderRadius: 20,
    position: 'absolute',
    bottom: 8,
    left: 18,
  },
  toe: {
    width: 8,
    height: 12,
    backgroundColor: '#ff6b35',
    borderRadius: 6,
    position: 'absolute',
  },
  toe1: {
    top: 8,
    left: 12,
    transform: [{ rotate: '-25deg' }],
  },
  toe2: {
    top: 4,
    left: 20,
  },
  toe3: {
    top: 4,
    left: 28,
  },
  toe4: {
    top: 8,
    left: 36,
    transform: [{ rotate: '25deg' }],
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  loginButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleHints: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  roleHintTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  roleHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
