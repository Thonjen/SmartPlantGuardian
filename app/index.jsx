import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SERVER_URL = 'http://localhost:3000'; // Replace with actual server

const SensorBox = ({ icon, label, value, status, unit, color }) => {
  return (
    <Animated.View style={[styles.sensorBox, { borderColor: color, backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons name={icon} size={32} color={color} />
      <Text style={styles.sensorLabel}>{label}</Text>
      <Text style={styles.sensorValue}>{value} {unit}</Text>
      {status && <Text style={[styles.sensorStatus, { color }]}>{status}</Text>}
    </Animated.View>
  );
};

export default function App() {
  const [status, setStatus] = useState(null);
  const [watering, setWatering] = useState(false);
  const [error, setError] = useState(null);
  const [lastWatered, setLastWatered] = useState('N/A');

  useEffect(() => {
    const interval = setInterval(fetchStatus, 10000);
    fetchStatus();
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/status`);
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const waterNow = async () => {
    setWatering(true);
    try {
      const res = await fetch(`${SERVER_URL}/water`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to water');
      const now = new Date().toLocaleString();
      setLastWatered(now);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
    setWatering(false);
  };

  if (!status) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4CAF50" />;

  const getSoilVisual = () => {
    if (status.soilStatus === 'Dry') return { color: '#E53935', icon: 'weather-sunny' };
    return { color: '#43A047', icon: 'weather-pouring' };
  };

  const getTempVisual = () => {
    const temp = parseFloat(status.temperature);
    if (temp < 18) return { color: '#03A9F4', icon: 'snowflake' };
    if (temp > 30) return { color: '#F44336', icon: 'weather-sunny-alert' };
    return { color: '#FFC107', icon: 'thermometer' };
  };

  const getHumidityVisual = () => {
    const humidity = parseFloat(status.humidity);
    if (humidity < 40) return { color: '#FF9800', icon: 'water-off' };
    if (humidity > 80) return { color: '#2196F3', icon: 'water' };
    return { color: '#4CAF50', icon: 'water-percent' };
  };

  const soil = getSoilVisual();
  const temp = getTempVisual();
  const humidity = getHumidityVisual();

  return (
    <LinearGradient colors={['#e0f7fa', '#a5d6a7']} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>🌿 Plant Monitor</Text>

        <View style={styles.grid}>
          <SensorBox
            icon={soil.icon}
            label="Soil Moisture"
            value={status.soilMoistureRaw}
            status={status.soilStatus}
            unit=""
            color={soil.color}
          />
          <SensorBox
            icon={temp.icon}
            label="Temperature"
            value={status.temperature}
            status={status.temperature < 18 ? 'Too Cold' : status.temperature > 30 ? 'Too Hot' : 'Normal'}
            unit="°C"
            color={temp.color}
          />
          <SensorBox
            icon={humidity.icon}
            label="Humidity"
            value={status.humidity}
            status={status.humidity < 40 ? 'Dry' : status.humidity > 80 ? 'Wet' : 'Normal'}
            unit="%"
            color={humidity.color}
          />
          <SensorBox
            icon="calendar-clock"
            label="Last Watered"
            value={lastWatered}
            status=""
            unit=""
            color="#6D4C41"
          />
        </View>

        <TouchableOpacity
          style={[styles.waterButton, { backgroundColor: watering ? '#B2DFDB' : '#4CAF50' }]}
          onPress={waterNow}
          disabled={watering}
        >
          <MaterialCommunityIcons name="watering-can" size={24} color="#fff" />
          <Text style={styles.buttonText}>{watering ? 'Watering...' : 'Water Now'}</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  sensorBox: {
    width: '48%',
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sensorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  sensorValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sensorStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  waterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 3,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});
