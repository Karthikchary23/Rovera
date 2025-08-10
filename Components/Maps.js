import React from 'react';
import { StyleSheet } from 'react-native';
import MapView from 'react-native-maps';

export default function Maps() {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 37.78825,      // Default latitude
        longitude: -122.4324,    // Default longitude
        latitudeDelta: 0.01,     // Zoom level
        longitudeDelta: 0.01,
      }}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});
