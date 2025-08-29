import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MMKV } from 'react-native-mmkv';
import Joystick from './Components/Joystick';

const storage = new MMKV();

export default function CarControls() {
  const [isStarted, setIsStarted] = useState(false);
  const [isMapFull, setIsMapFull] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const savedIp = storage.getString('ipAddress');
    if (savedIp) setIpAddress(savedIp);
  }, []);

  const toggleStartStop = () => setIsStarted(!isStarted);

  const handleIpChange = text => {
    setIpAddress(text);
    storage.set('ipAddress', text);
  };

  const handleConnect = () => {
    if (ipAddress.trim() === '') {
      alert('⚠️ Please enter an IP address');
      return;
    }
    setIsConnected(true);
    alert(`✅ Connected to ${ipAddress}`);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        
        {/* Camera / Map */}
        <View style={styles.background}>
          {isMapFull ? (
            <View style={styles.mapView}>
              <Text>Map View</Text>
              <Image source={require('./Images/maps.png')} style={styles.mapImage} />
            </View>
          ) : (
            <View style={styles.cameraView}>
              <Text style={styles.noCameraText}>Camera not found</Text>
            </View>
          )}
        </View>

        {/* Navbar */}
        <View style={styles.navBar}>
          <Image source={require('./Images/Logo.jpg')} style={styles.logo} />
          <View style={styles.roverStatus}>
            <Image source={require('./Images/battery.png')} style={styles.batteryIcon} />
          </View>
        </View>

        {/* Left Overlay */}
        <View style={styles.overlayLeft}>
          <TouchableOpacity style={styles.mapButton} onPress={() => setIsMapFull(!isMapFull)}>
            <Text style={styles.mapButtonText}>{isMapFull ? 'Camera' : 'Map'}</Text>
            {!isMapFull ? (
              <View style={styles.mapPreview}>
                <Image source={require('./Images/maps.png')} style={styles.mapImage} />
              </View>
            ) : (
              <View style={styles.cameraPreview}>
                <Text style={styles.previewText}>Camera</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={[styles.buttonWrapper, isStarted && styles.buttonActive]}
              onPress={toggleStartStop}
            >
              <Image source={require('./Images/start.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonWrapper, !isStarted && styles.buttonActive]}
              onPress={toggleStartStop}
            >
              <Image source={require('./Images/stop.png')} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Speed & Direction */}
        <View style={styles.speedDirection}>
          <Text style={styles.speedText}>Speed: 0 km/h</Text>
          <Text style={styles.directionText}>Direction: North...</Text>
        </View>

        {/* Right Overlay */}
        {/* Right Overlay */}
<View style={styles.overlayRight}>
  {isConnected ? (
    <>
      <Joystick ipAddress={ipAddress} />
      <TouchableOpacity
        style={styles.changeIpButton}
        onPress={() => setIsConnected(false)}  // disconnect and show input
      >
        <Text style={styles.changeIpText}>Change IP</Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
      <TextInput
        style={styles.input}
        placeholder="Enter ESP32 IP"
        placeholderTextColor="#888"
        value={ipAddress}
        onChangeText={handleIpChange}
      />
      <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
        <Text style={styles.connectText}>Connect</Text>
      </TouchableOpacity>
    </>
  )}
</View>


      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  background: { ...StyleSheet.absoluteFillObject },
  cameraView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', borderRadius: 10, margin: 10, padding: 20 },
  mapView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 60, paddingHorizontal: 10, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mapImage: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 10 },
  logo: { width: 40, height: 40, borderRadius: 20, resizeMode: 'contain' },
  roverStatus: { flexDirection: 'row', alignItems: 'center' },
  batteryIcon: { width: 24, height: 24, resizeMode: 'contain' },
  overlayLeft: { flex: 1, position: 'absolute', left: 10, bottom: 10, width: 150, top: 15, padding: 5, flexDirection: 'column', justifyContent: 'space-around' },
  overlayRight: { position: 'absolute', right: 10, bottom: 10, width: 160, padding: 5, justifyContent: 'center', alignItems: 'center' },
  mapButton: { backgroundColor: '#333', borderRadius: 8, padding: 5, alignItems: 'center', marginBottom: 10 },
  mapButtonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  mapPreview: { width: '100%', height: 80, backgroundColor: '#444', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  previewText: { color: '#fff', fontSize: 12, fontWeight: '400' },
  controlButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  buttonWrapper: { borderRadius: 30, width: 60, height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333', marginHorizontal: 10 },
  buttonActive: { backgroundColor: '#e74c3c' },
  icon: { width: 30, height: 30, resizeMode: 'contain' },
  noCameraText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  speedDirection: { position: 'absolute', bottom: 80, left: '50%', transform: [{ translateX: -50 }], backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: 5, borderRadius: 5, alignItems: 'center' },
  speedText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  directionText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  cameraPreview: { width: '100%', height: 80, backgroundColor: '#444', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  input: { width: '100%', height: 40, borderColor: '#555', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, color: '#fff', marginTop: 10, backgroundColor: '#222' },
  connectButton: { backgroundColor: '#27ae60', marginTop: 10, padding: 10, borderRadius: 6, width: '100%', alignItems: 'center' },
  connectText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
