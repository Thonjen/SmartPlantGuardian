import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const PlantMonitor = () => {
  const [sensorData, setSensorData] = useState({
    soilMoisture: '',
    temperature: 0,
    humidity: 0,
    lastWatered: '',
  });

  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    // Load the saved IP address when the component mounts
    const loadIpAddress = async () => {
      try {
        const savedIp = await AsyncStorage.getItem('arduinoIp');
        if (savedIp) {
          setIpAddress(savedIp);
        }
      } catch (error) {
        console.error('Error loading IP address:', error);
      }
    };

    loadIpAddress();
  }, []);

  useEffect(() => {
    // Fetch sensor data when the IP address is loaded
    if (ipAddress) {
      fetchSensorData();
    }
  }, [ipAddress]);

  const fetchSensorData = async () => {
    try {
      const response = await fetch(`http://${ipAddress}/status`);
      const data = await response.json();
      setSensorData(data);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  const waterPlant = async () => {
    try {
      const response = await fetch(`http://${ipAddress}/water`, {
        method: 'POST',
      });
      const data = await response.json();
      console.log(data);
      // Optionally, you can update the lastWatered time here
    } catch (error) {
      console.error('Error watering plant:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Plant Monitor' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Plant Monitor</Text>
        <Text>Soil Moisture: {sensorData.soilMoisture}</Text>
        <Text>Temperature: {sensorData.temperature}°C</Text>
        <Text>Humidity: {sensorData.humidity}%</Text>
        <Text>Last Watered: {sensorData.lastWatered}</Text>
        <Button title="Water Now" onPress={waterPlant} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default PlantMonitor; 