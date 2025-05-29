import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const PlantMonitor = () => {
  const router = useRouter();
  const [sensorData, setSensorData] = useState({
    soilMoisture: '',
    temperature: 0,
    humidity: 0,
    lastWatered: '',
  });

  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadIpAddress();
  }, []);

  useEffect(() => {
    if (ipAddress) {
      fetchSensorData();
      const interval = setInterval(fetchSensorData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [ipAddress]);

  const loadIpAddress = async () => {
    try {
      const savedIp = await AsyncStorage.getItem('arduinoIp');
      if (savedIp) {
        setIpAddress(savedIp);
      } else {
        router.push('/(tabs)/config');
      }
    } catch (error) {
      setError('Error loading IP address');
      console.error('Error loading IP address:', error);
    }
  };

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://${ipAddress}/status`);
      const data = await response.json();
      setSensorData(data);
      setError('');
    } catch (error) {
      setError('Error fetching sensor data');
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const waterPlant = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://${ipAddress}/water`, {
        method: 'POST',
      });
      const data = await response.json();
      setSensorData(prev => ({ ...prev, lastWatered: new Date().toLocaleString() }));
      setError('');
    } catch (error) {
      setError('Error watering plant');
      console.error('Error watering plant:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoistureStatus = (moisture: string) => {
    const value = parseInt(moisture);
    if (value < 30) return { status: 'Dry', color: '#FF6B6B' };
    if (value < 60) return { status: 'Moist', color: '#4CAF50' };
    return { status: 'Wet', color: '#2196F3' };
  };

  if (loading && !sensorData.soilMoisture) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </ThemedView>
    );
  }

  const moistureStatus = getMoistureStatus(sensorData.soilMoisture);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <IconSymbol name="leaf.fill" size={32} color="#4CAF50" />
          <ThemedText type="title">Plant Guardian</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/config')} style={styles.configButton}>
          <IconSymbol name="gearshape.fill" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {error ? (
        <ThemedText style={styles.error}>{error}</ThemedText>
      ) : (
        <View style={styles.sensorContainer}>
          <View style={[styles.sensorCard, { borderLeftColor: moistureStatus.color }]}>
            <IconSymbol name="drop.fill" size={32} color={moistureStatus.color} />
            <ThemedText type="subtitle">Soil Moisture</ThemedText>
            <ThemedText style={[styles.sensorValue, { color: moistureStatus.color }]}>
              {moistureStatus.status}
            </ThemedText>
            <ThemedText style={styles.sensorDetail}>{sensorData.soilMoisture}%</ThemedText>
          </View>

          <View style={[styles.sensorCard, { borderLeftColor: '#FF9800' }]}>
            <IconSymbol name="thermometer" size={32} color="#FF9800" />
            <ThemedText type="subtitle">Temperature</ThemedText>
            <ThemedText style={[styles.sensorValue, { color: '#FF9800' }]}>
              {sensorData.temperature}°C
            </ThemedText>
          </View>

          <View style={[styles.sensorCard, { borderLeftColor: '#2196F3' }]}>
            <IconSymbol name="humidity" size={32} color="#2196F3" />
            <ThemedText type="subtitle">Humidity</ThemedText>
            <ThemedText style={[styles.sensorValue, { color: '#2196F3' }]}>
              {sensorData.humidity}%
            </ThemedText>
          </View>
        </View>
      )}

      <View style={styles.wateringSection}>
        <View style={styles.lastWateredContainer}>
          <IconSymbol name="clock.fill" size={20} color="#666" />
          <ThemedText style={styles.lastWateredLabel}>Last Watered</ThemedText>
          <ThemedText style={styles.lastWatered}>
            {sensorData.lastWatered || 'Never'}
          </ThemedText>
        </View>
        <TouchableOpacity 
          style={[styles.waterButton, loading && styles.waterButtonDisabled]} 
          onPress={waterPlant}
          disabled={loading}
        >
          <IconSymbol name="drop.fill" size={24} color="white" />
          <ThemedText style={styles.waterButtonText}>
            {loading ? 'Watering...' : 'Water Now'}
          </ThemedText>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  configButton: {
    padding: 8,
  },
  sensorContainer: {
    gap: 15,
  },
  sensorCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    gap: 8,
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sensorDetail: {
    fontSize: 14,
    opacity: 0.7,
  },
  wateringSection: {
    marginTop: 30,
    gap: 20,
  },
  lastWateredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    padding: 15,
    borderRadius: 12,
  },
  lastWateredLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  lastWatered: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  waterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 10,
  },
  waterButtonDisabled: {
    opacity: 0.7,
  },
  waterButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PlantMonitor; 