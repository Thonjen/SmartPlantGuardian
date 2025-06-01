import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import tw from 'twrnc'; // Import twrnc

// Replace with your computer's local IP address
const SERVER_URL = 'http://192.168.254.190:3000'; // Change this to your computer's IP

export default function History() {
  const [wateringHistory, setWateringHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    averageTemp: 0,
    averageHumidity: 0,
    totalWaterings: 0,
    lastWeekWaterings: 0
  });

  useEffect(() => {
    loadWateringHistory();
  }, []);

  const loadWateringHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${SERVER_URL}/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch history data');
      }
      const data = await response.json();
      setWateringHistory(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading history:', error);
      setError('Failed to load history data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) return;

    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalTemp = data.reduce((sum, item) => sum + parseFloat(item.temperature), 0);
    const totalHumidity = data.reduce((sum, item) => sum + parseFloat(item.humidity), 0);
    const lastWeekEvents = data.filter(item => new Date(item.created_at) >= lastWeek);

    setStats({
      averageTemp: (totalTemp / data.length).toFixed(1),
      averageHumidity: (totalHumidity / data.length).toFixed(1),
      totalWaterings: data.length,
      lastWeekWaterings: lastWeekEvents.length
    });
  };

  const getChartData = () => {
    const last7Days = wateringHistory
      .slice(-7)
      .map(item => ({
        temp: parseFloat(item.temperature),
        humidity: parseFloat(item.humidity),
        date: new Date(item.created_at).toLocaleDateString()
      }));

    return {
      labels: last7Days.map(item => item.date),
      datasets: [
        {
          data: last7Days.map(item => item.temp),
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: last7Days.map(item => item.humidity),
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  const StatBox = ({ title, value, unit = '' }) => (
    <View style={tw`bg-white p-4 rounded-xl w-[47%] shadow-sm items-center`}>
      <Text style={tw`text-sm text-gray-600 mb-2`}>{title}</Text>
      <Text style={tw`text-2xl font-bold text-green-700`}>{value}{unit}</Text>
    </View>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={tw`bg-white p-4 mx-4 my-2 rounded-xl shadow-md`}>
      <Text style={tw`text-base font-bold text-green-700`}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
      <Text style={tw`text-sm mt-1 text-gray-600`}>
        🌡️ Temp: {item.temperature}°C | 💧 Humidity: {item.humidity}%
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-green-50`}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-green-50 p-4`}>
        <Text style={tw`text-red-500 text-center mb-4`}>{error}</Text>
        <TouchableOpacity
          style={tw`bg-green-700 py-3 px-6 rounded-xl`}
          onPress={loadWateringHistory}
        >
          <Text style={tw`text-white font-bold`}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-green-50`}>
      <Text style={tw`text-2xl font-bold text-green-700 my-5 text-center`}>
        Watering History
      </Text>
      
      <View style={tw`flex-row flex-wrap justify-between p-4 gap-4`}>
        <StatBox title="Total Waterings" value={stats.totalWaterings} />
        <StatBox title="Last 7 Days" value={stats.lastWeekWaterings} />
        <StatBox title="Avg Temp" value={stats.averageTemp} unit="°C" />
        <StatBox title="Avg Humidity" value={stats.averageHumidity} unit="%" />
      </View>

      {wateringHistory.length > 0 && (
        <View style={tw`bg-white m-4 p-4 rounded-2xl shadow-sm`}>
          <Text style={tw`text-lg font-bold text-green-700 mb-4 text-center`}>
            Last 7 Days Trends
          </Text>
          <LineChart
            data={getChartData()}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={tw`rounded-2xl my-2`}
          />
          <View style={tw`flex-row justify-center gap-5 mt-2`}>
            <View style={tw`flex-row items-center gap-2`}>
              <View style={tw`w-3 h-3 rounded-full bg-red-500`} />
              <Text>Temperature</Text>
            </View>
            <View style={tw`flex-row items-center gap-2`}>
              <View style={tw`w-3 h-3 rounded-full bg-blue-500`} />
              <Text>Humidity</Text>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={wateringHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        style={tw`w-full`}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}
