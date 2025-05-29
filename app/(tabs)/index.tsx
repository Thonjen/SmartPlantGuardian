import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <IconSymbol name="leaf.fill" size={40} color="#4CAF50" />
        <ThemedText type="title">Smart Plant Guardian</ThemedText>
      </ThemedView>

      <ThemedView style={styles.contentContainer}>
        <ThemedView style={styles.card}>
          <IconSymbol name="shield.checkerboard" size={32} color="#4CAF50" />
          <ThemedText type="subtitle">Your Plant's Guardian</ThemedText>
          <ThemedText style={styles.description}>
            Monitor and protect your plants with real-time environmental tracking and smart watering.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.featuresContainer}>
          <ThemedView style={styles.featureItem}>
            <IconSymbol name="drop.fill" size={24} color="#4CAF50" />
            <ThemedText>Soil Moisture Monitoring</ThemedText>
          </ThemedView>
          <ThemedView style={styles.featureItem}>
            <IconSymbol name="thermometer" size={24} color="#4CAF50" />
            <ThemedText>Temperature Control</ThemedText>
          </ThemedView>
          <ThemedView style={styles.featureItem}>
            <IconSymbol name="humidity" size={24} color="#4CAF50" />
            <ThemedText>Humidity Tracking</ThemedText>
          </ThemedView>
        </ThemedView>

        <Link href="/plant-monitor" style={styles.monitorButton}>
          <IconSymbol name="leaf.fill" size={24} color="white" />
          <ThemedText style={styles.monitorButtonText}>Monitor Your Plants</ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
    alignItems: 'center',
    gap: 10,
  },
  contentContainer: {
    flex: 1,
    gap: 30,
  },
  card: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
  },
  description: {
    textAlign: 'center',
    marginTop: 10,
  },
  featuresContainer: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    padding: 15,
    borderRadius: 12,
  },
  monitorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 10,
    marginTop: 20,
  },
  monitorButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
