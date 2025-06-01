import { useEffect, useState } from 'react';
import { ActivityIndicator, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';

// Replace with your computer's local IP address
const SERVER_URL = 'http://192.168.254.190:3000'; // Change this to your computer's IP

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [wateringThreshold, setWateringThreshold] = useState('30');
  const [temperatureAlerts, setTemperatureAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${SERVER_URL}/settings`);
      if (!response.ok) {
        throw new Error('Failed to load settings');
      }
      const data = await response.json();
      setNotificationsEnabled(data.notifications_enabled);
      setWateringThreshold(data.watering_threshold.toString());
      setTemperatureAlerts(data.temperature_alerts);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`${SERVER_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notifications_enabled: notificationsEnabled,
          watering_threshold: parseInt(wateringThreshold),
          temperature_alerts: temperatureAlerts
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-green-50`}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 p-5 bg-green-50`}>
      <Text style={tw`text-2xl font-bold text-green-700 mb-8`}>
        Settings
      </Text>
      
      {error && (
        <Text style={tw`text-red-500 mb-4 text-center`}>{error}</Text>
      )}

      <SettingItem label="Notifications">
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: '#767577', true: '#81c784' }}
          thumbColor={notificationsEnabled ? '#2E7D32' : '#f4f3f4'}
        />
      </SettingItem>

      <SettingItem label="Soil Moisture Threshold (%)">
        <TextInput
          style={tw`border border-gray-300 rounded px-2 py-1 w-20 text-center`}
          value={wateringThreshold}
          onChangeText={setWateringThreshold}
          keyboardType="numeric"
        />
      </SettingItem>

      <SettingItem label="Temperature Alerts">
        <Switch
          value={temperatureAlerts}
          onValueChange={setTemperatureAlerts}
          trackColor={{ false: '#767577', true: '#81c784' }}
          thumbColor={temperatureAlerts ? '#2E7D32' : '#f4f3f4'}
        />
      </SettingItem>

      <TouchableOpacity 
        style={[
          tw`bg-green-700 py-4 px-6 rounded-xl items-center mt-8`,
          saving && tw`opacity-50`
        ]}
        onPress={saveSettings}
        disabled={saving}
      >
        <Text style={tw`text-white font-bold text-base`}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const SettingItem = ({ label, children }) => (
  <View style={tw`flex-row justify-between items-center py-4 border-b border-gray-200`}>
    <Text style={tw`text-base text-gray-700`}>{label}</Text>
    {children}
  </View>
);
