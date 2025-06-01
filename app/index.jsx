import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

const SERVER_URL = 'http://192.168.254.190:3000'; // Change this to your computer's IP

const SensorBox = ({ icon, label, value, status, unit, color, loading }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value]);

  return (
    <Animated.View 
      style={[
        tw`w-[48%] border-2 rounded-2xl p-5 items-center bg-white shadow-lg mb-4`,
        { 
          borderColor: color, 
          backgroundColor: color + '20',
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <MaterialCommunityIcons name={icon} size={32} color={color} />
      <Text style={tw`text-base font-semibold mt-2.5 text-center`}>{label}</Text>
      {loading ? (
        <ActivityIndicator size="small" color={color} style={tw`mt-2`} />
      ) : (
        <Text style={tw`text-xl font-bold mt-1`}>{value} {unit}</Text>
      )}
      {status && (
        <View style={tw`mt-2 bg-white px-3 py-1 rounded-full`}>
          <Text style={[tw`text-sm font-medium text-center`, { color }]}>{status}</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default function App() {
  const [status, setStatus] = useState(null);
  const [watering, setWatering] = useState(false);
  const [error, setError] = useState(null);
  const [lastWatered, setLastWatered] = useState('N/A');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plants, setPlants] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(fetchStatus, 10000);
    fetchStatus();
    // Request notification permissions
    Notifications.requestPermissionsAsync();
    loadPlants();
    fetchLastWatered();
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStatus(), fetchLastWatered()]);
    setRefreshing(false);
  };

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/status`);
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastWatered = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/watering-events/last`);
      if (!response.ok) throw new Error('Failed to fetch last watered time');
      const data = await response.json();
      if (data && data.created_at) {
        setLastWatered(new Date(data.created_at).toLocaleString());
      }
    } catch (error) {
      console.error('Error fetching last watered time:', error);
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

  const loadPlants = async () => {
    try {
      const storedPlants = await AsyncStorage.getItem('plants');
      if (storedPlants) {
        setPlants(JSON.parse(storedPlants));
      }
    } catch (e) {
      setError('Failed to load plants');
    }
  };

  if (!status && loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-green-50`}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={tw`mt-4 text-green-700`}>Loading plant data...</Text>
      </View>
    );
  }

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
    <LinearGradient colors={['#e0f7fa', '#a5d6a7']} style={tw`flex-1`}>
      <ScrollView 
        style={tw`flex-1`}
        contentContainerStyle={tw`p-5 pt-12`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
      >
        <View style={tw`items-center mb-8`}>
          <Text style={tw`text-3xl font-bold text-green-700 mb-2`}>
            🌿 Plant Monitor
          </Text>
          <Text style={tw`text-gray-600`}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </View>

        <View style={tw`flex-row flex-wrap justify-between`}>
          <SensorBox
            icon={soil.icon}
            label="Soil Moisture"
            value={status.soilMoistureRaw}
            status={status.soilStatus}
            unit=""
            color={soil.color}
            loading={loading}
          />
          <SensorBox
            icon={temp.icon}
            label="Temperature"
            value={status.temperature}
            status={status.temperature < 18 ? 'Too Cold' : status.temperature > 30 ? 'Too Hot' : 'Normal'}
            unit="°C"
            color={temp.color}
            loading={loading}
          />
          <SensorBox
            icon={humidity.icon}
            label="Humidity"
            value={status.humidity}
            status={status.humidity < 40 ? 'Dry' : status.humidity > 80 ? 'Wet' : 'Normal'}
            unit="%"
            color={humidity.color}
            loading={loading}
          />
          <SensorBox
            icon="calendar-clock"
            label="Last Watered"
            value={lastWatered}
            status=""
            unit=""
            color="#6D4C41"
            loading={loading}
          />
        </View>

        <TouchableOpacity
          style={[
            tw`flex-row items-center justify-center py-4 px-6 rounded-full shadow-lg mt-6 mb-4`,
            { 
              backgroundColor: watering ? '#B2DFDB' : '#4CAF50',
              transform: [{ scale: watering ? 0.95 : 1 }]
            }
          ]}
          onPress={waterNow}
          disabled={watering}
        >
          <MaterialCommunityIcons name="watering-can" size={24} color="#fff" />
          <Text style={tw`text-white font-bold text-lg ml-2`}>
            {watering ? 'Watering...' : 'Water Now'}
          </Text>
        </TouchableOpacity>

        {error && (
          <View style={tw`bg-red-100 p-4 rounded-xl mt-4`}>
            <Text style={tw`text-red-600 text-center`}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
