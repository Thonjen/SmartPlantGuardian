import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import tw from 'twrnc';

const SERVER_URL = 'http://192.168.254.197:3000';

export default function History() {
  const [wateringHistory, setWateringHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalWaterings: 0,
    lastWeekWaterings: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadWateringHistory();
  }, []);

  const loadWateringHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch watering events (ordered DESC by created_at in server.js)
      const response = await fetch(`${SERVER_URL}/watering-events`);
      if (!response.ok) throw new Error('Failed to fetch watering events');

      const data = await response.json();
      setWateringHistory(data);
      calculateStats(data);
    } catch (err) {
      console.error('Error loading watering events:', err);
      setError('Failed to load watering history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (events) => {
    if (!events || events.length === 0) {
      setStats({ totalWaterings: 0, lastWeekWaterings: 0 });
      return;
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const total = events.length;
    const lastWeekCount = events.filter(evt => new Date(evt.created_at) >= oneWeekAgo).length;

    setStats({ totalWaterings: total, lastWeekWaterings: lastWeekCount });
  };

  // Helper to turn a timestamp into “Xd”, “Xh”, “Xm”, or “Xs” ago
  const getRelativeLabel = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;

    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return `${sec}s`;

    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;

    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;

    const day = Math.floor(hr / 24);
    return `${day}d`;
  };

  // Build chart data for the last 7 events, labels = relative times
  const getChartData = () => {
    if (!wateringHistory || wateringHistory.length === 0) {
      return { labels: [], datasets: [] };
    }

    // wateringHistory is sorted DESC (newest first). Take first 7 and reverse to oldest→newest
    const lastSevenDesc = wateringHistory.slice(0, 7);
    const lastSevenAsc = [...lastSevenDesc].reverse();

    const labels = lastSevenAsc.map(item => getRelativeLabel(item.created_at));
    const beforeData = lastSevenAsc.map(item => item.soil_moisture_before);
    const afterData = lastSevenAsc.map(item => item.soil_moisture_after);

    return {
      labels,
      datasets: [
        {
          data: beforeData,
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // red line = before
          strokeWidth: 2
        },
        {
          data: afterData,
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // blue line = after
          strokeWidth: 2
        }
      ]
    };
  };

  const StatBox = ({ title, value }) => (
    <View style={tw`bg-white p-4 rounded-xl w-[47%] shadow-sm items-center`}>
      <Text style={tw`text-sm text-gray-600 mb-2`}>{title}</Text>
      <Text style={tw`text-2xl font-bold text-green-700`}>{value}</Text>
    </View>
  );

  const renderHistoryItem = ({ item }) => {
    const d = new Date(item.created_at);
    const formattedDate = d.toLocaleDateString();
    const formattedTime = d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    return (
      <View style={tw`bg-white p-4 mx-4 my-2 rounded-xl shadow-md`}>
        <Text style={tw`text-base font-bold text-green-700`}>
          {formattedDate} at {formattedTime}
        </Text>
        <Text style={tw`text-sm mt-1 text-gray-600`}>
          🌱 Soil Moisture Before: {item.soil_moisture_before} → After: {item.soil_moisture_after}
        </Text>
      </View>
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(wateringHistory.length / itemsPerPage);
  const currentItems = wateringHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (count) => {
    setItemsPerPage(count);
    setCurrentPage(1);
  };

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
    <ScrollView style={tw`flex-1 bg-green-50`} contentContainerStyle={tw`pb-20`}>
      <Text style={tw`text-2xl font-bold text-green-700 my-5 text-center`}>
        Watering History
      </Text>

      {/* Stats */}
      <View style={tw`flex-row flex-wrap justify-between p-4 gap-4`}>
        <StatBox title="Total Waterings" value={stats.totalWaterings} />
        <StatBox title="Last 7 Days" value={stats.lastWeekWaterings} />
      </View>

      {/* Chart: Last 7 events, x-axis = relative time */}
      {wateringHistory.length > 0 && (
        <View style={tw`bg-white m-4 p-4 rounded-2xl shadow-sm`}>
          <Text style={tw`text-lg font-bold text-green-700 mb-4 text-center`}>
            Last 7 Events: Soil Moisture Trend
          </Text>
          <LineChart
            data={getChartData()}
            width={Dimensions.get('window').width - 40}
            height={240}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 }
            }}
            bezier
            style={tw`rounded-2xl my-2`}
          />
          <View style={tw`flex-row justify-center gap-5 mt-2`}>
            <View style={tw`flex-row items-center gap-2`}>
              <View style={tw`w-3 h-3 rounded-full bg-red-500`} />
              <Text>Before</Text>
            </View>
            <View style={tw`flex-row items-center gap-2`}>
              <View style={tw`w-3 h-3 rounded-full bg-blue-500`} />
              <Text>After</Text>
            </View>
          </View>
        </View>
      )}

      {/* Pagination Settings */}
      <View style={tw`flex-row justify-center my-2`}>
        {[10, 15, 20].map((count) => (
          <TouchableOpacity
            key={count}
            style={tw`mx-1 px-3 py-1 rounded-full ${
              itemsPerPage === count ? 'bg-green-700' : 'bg-gray-200'
            }`}
            onPress={() => handleItemsPerPageChange(count)}
          >
            <Text style={tw`${itemsPerPage === count ? 'text-white' : 'text-black'}`}>
              {count}/page
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List of Events */}
      <FlatList
        data={currentItems}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
      />

      {/* Pagination Buttons */}
      <View style={tw`flex-row justify-center mb-6`}>
        <TouchableOpacity
          onPress={() => handlePageChange('prev')}
          disabled={currentPage === 1}
          style={tw`mx-2 px-4 py-2 rounded-lg ${
            currentPage === 1 ? 'bg-gray-300' : 'bg-green-700'
          }`}
        >
          <Text style={tw`text-white`}>Prev</Text>
        </TouchableOpacity>
        <Text style={tw`text-lg mx-2 self-center`}>
          Page {currentPage} of {totalPages}
        </Text>
        <TouchableOpacity
          onPress={() => handlePageChange('next')}
          disabled={currentPage === totalPages}
          style={tw`mx-2 px-4 py-2 rounded-lg ${
            currentPage === totalPages ? 'bg-gray-300' : 'bg-green-700'
          }`}
        >
          <Text style={tw`text-white`}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
