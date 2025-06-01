import { StyleSheet, Text, View } from 'react-native';

export default function Monitor() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🌿 Monitor your plant stats here!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
  },
  text: {
    fontSize: 18,
    color: '#1b5e20',
  },
});
