import { Stack, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import BottomNavbar from '../components/BottomNavbar';

export default function RootLayout() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      <BottomNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
