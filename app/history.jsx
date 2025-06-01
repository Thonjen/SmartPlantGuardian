import { StyleSheet, Text, View } from 'react-native';

export default function History() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📖 View plant watering history!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
  },
  text: {
    fontSize: 18,
    color: '#33691e',
  },
});
