import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../config/constants';
import DoublePawLogo from './DoublePawLogo';

const LoadingScreen = () => {
  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.container}
    >
      <View style={styles.content}>
        <DoublePawLogo size={100} color={COLORS.text.light} />
        <Text style={styles.title}>StraySafe</Text>
        <Text style={styles.subtitle}>Reducing Human-Stray Dog Conflicts</Text>
        <ActivityIndicator 
          size="large" 
          color={COLORS.text.light} 
          style={styles.loader}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text.light,
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.body4,
    color: COLORS.text.light,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default LoadingScreen;
