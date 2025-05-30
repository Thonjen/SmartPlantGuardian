import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const PlantMonitor = () => {
  const [sensorData, setSensorData] = useState({
    soilMoisture: "",
    lastWatered: "",
  });

  const [wsIpAddress] = useState("192.168.254.197"); // Replace with your IP
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!wsIpAddress) return;

    ws.current = new WebSocket(`ws://${wsIpAddress}:8080`);

    ws.current.onopen = () => {
      console.log("Connected to WebSocket server");
      ws.current?.send(JSON.stringify({ command: "getStatus" }));
    };

    const intervalId = setInterval(() => {
      ws.current?.send(JSON.stringify({ command: "getStatus" }));
    }, 10000);

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "sensorData" || message.soilMoisture) {
          setSensorData({
            soilMoisture: message.soilMoisture || message.data?.soilMoisture,
            lastWatered: new Date(
              message.lastWateredMillis || message.data?.lastWateredMillis
            ).toLocaleTimeString(),
          });
        }
      } catch (e) {
        console.error("Invalid message:", event.data);
      }
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.current.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      clearInterval(intervalId);
      ws.current?.close();
    };
  }, [wsIpAddress]);

  const waterPlant = () => {
    ws.current?.send(JSON.stringify({ command: "waterNow" }));
  };

  return (
    <>
      <Stack.Screen options={{ title: "Plant Monitor" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Plant Monitor</Text>
        <Text>Soil Moisture: {sensorData.soilMoisture}</Text>
        <Text>Last Watered: {sensorData.lastWatered}</Text>
        <Button title="Water Now" onPress={waterPlant} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default PlantMonitor;
