// components/alerts/TimerAlert.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TimerAlert = ({ visible, onClose }) => {
  const soundRef = useRef(null);
  const [timerSoundKey, setTimerSoundKey] = useState('timer');

  // Load timer sound selection when modal becomes visible.
  useEffect(() => {
    const loadTimerSound = async () => {
      try {
        const storedSound = await AsyncStorage.getItem('timerSound');
        setTimerSoundKey(storedSound || 'timer');
      } catch (error) {
        console.error("Error loading timer sound", error);
      }
    };
    if (visible) {
      loadTimerSound();
    }
  }, [visible]);

  // Mapping of sound keys to sound files.
  const soundMapping = {
    timer: require('../../assets/sfx/timer.mp3'),
    Bell: require('../../assets/sfx/Bell.mp3'),
    Maxwell: require('../../assets/sfx/Maxwell.mp3'),
    Happy: require('../../assets/sfx/Happy.mp3'),
    'Chipi-chipi': require('../../assets/sfx/Chipi-chipi.mp3'),
    Megalovania: require('../../assets/sfx/Megalovania.mp3'),
    CarelessWhisper: require('../../assets/sfx/CarelessWhisper.mp3'),
  };

  // Play the selected sound on loop when the modal is visible.
  useEffect(() => {
    let isMounted = true;
    const playSound = async () => {
      try {
        // Stop and unload any previously loaded sound.
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        // Create and play the new sound.
        const { sound } = await Audio.Sound.createAsync(
          soundMapping[timerSoundKey]
        );
        if (!isMounted) return;
        soundRef.current = sound;
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
      } catch (error) {
        console.error('Error playing timer sound:', error);
      }
    };

    if (visible) {
      playSound();
    }

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [visible, timerSoundKey]);

  // When user presses "Okay", stop the sound and close the modal.
  const handleClose = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.alertContainer}>
          <Text style={styles.alertTitle}>Timer</Text>
          <Text style={styles.alertMessage}>Time is up!</Text>
          <TouchableOpacity style={styles.okButton} onPress={handleClose}>
            <Text style={styles.okButtonText}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TimerAlert;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 18,
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: '#F8D64E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  okButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
