import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const ConfigScreen = () => {
  const router = useRouter();
  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateIpAddress = (ip: string) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(ip)) {
      setError('Please enter a valid IP address (e.g., 192.168.1.100)');
      return false;
    }
    const parts = ip.split('.');
    for (const part of parts) {
      const num = parseInt(part);
      if (num < 0 || num > 255) {
        setError('Each number in the IP address must be between 0 and 255');
        return false;
      }
    }
    return true;
  };

  const saveIpAddress = async () => {
    if (!validateIpAddress(ipAddress)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await AsyncStorage.setItem('arduinoIp', ipAddress);
      router.push('/(tabs)/plant-monitor');
    } catch (error) {
      setError('Error saving IP address');
      console.error('Error saving IP address:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <IconSymbol name="leaf.fill" size={32} color="#4CAF50" />
          <ThemedText type="title">Device Setup</ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <IconSymbol name="network" size={40} color="#4CAF50" />
          <ThemedText type="subtitle">Connect Your Guardian</ThemedText>
          <ThemedText style={styles.description}>
            Enter the IP address of your Arduino device to start monitoring your plants.
          </ThemedText>
        </View>

        <View style={styles.inputContainer}>
          <IconSymbol name="network" size={24} color="#4CAF50" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter Arduino IP Address"
            placeholderTextColor="#666"
            value={ipAddress}
            onChangeText={(text) => {
              setIpAddress(text);
              setError('');
            }}
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveIpAddress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <IconSymbol name="checkmark.circle.fill" size={24} color="white" />
              <ThemedText style={styles.saveButtonText}>Connect Device</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  content: {
    flex: 1,
    gap: 30,
  },
  card: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    gap: 15,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 10,
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ConfigScreen; 