import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CancelAlert = ({ visible, onKeepEditing, onDiscard }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onKeepEditing}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Cancel Editing</Text>
          <Text style={styles.message}>
            Do you want to keep editing or discard your changes?
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onKeepEditing}>
              <Text style={styles.buttonText}>Keep Editing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.discardButton]} onPress={onDiscard}>
              <Text style={styles.buttonText}>Discard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CancelAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  button: {
    backgroundColor: '#F8D64E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5
  },
  discardButton: {
    backgroundColor: 'red'
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});
