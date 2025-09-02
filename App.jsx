import { useEffect, useRef, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
  Button,
  BackHandler,
} from 'react-native';
import Joystick from './Components/Joystick';

export default function App() {
  const [uniqueId] = useState('controller@123');
  const ws = useRef(null);

  const [isMapMain, setIsMapMain] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [email] = useState('lingojikarthikchary@gmail.com');
  const [password] = useState('123456789');
  const [roverid, setRoverid] = useState('');

  const [roverCoords, setRoverCoords] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  const mainMapRef = useRef(null);
  const smallMapRef = useRef(null);
  const [joystick, setJoystick] = useState({ throttle: 1500, steering: 1500 });

  // WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket("wss://roverabackend.onrender.com");

    ws.current.onopen = () => {
      console.log('🔗 WebSocket connected');
      ws.current.send(JSON.stringify({ type: 'register', uniqueId }));
    };

    ws.current.onmessage = event => {
      const data = JSON.parse(event.data);
      console.log('📩 Message:', data);

      if (data.type === 'connectedrover') {
        Alert.alert('Success', data.message);
        setIsConnected(true);
        setIsStarted(false); // only start when user clicks Start
      } else if (data.type === 'connectedfailure') {
        Alert.alert('Failed', data.message);
        setIsConnected(false);
      }

      if (data.type === 'gps_update') {
        const { lat, lon } = data.data;
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          setRoverCoords({ latitude, longitude });
        } else {
          console.log('⚠️ Invalid GPS:', lat, lon);
        }
      }
    };

    ws.current.onclose = () => console.log('❌ WebSocket closed');
    ws.current.onerror = err => console.log('⚠️ WebSocket error:', err);

    // Cleanup on app close
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (ws.current) {
        ws.current.send(JSON.stringify({ type: "send_instruction", fromId: uniqueId, command: "stop" }));
        ws.current.close();
      }
      return false; // allow app to close
    });

    return () => {
      backHandler.remove();
      if (ws.current) {
        ws.current.send(JSON.stringify({ type: "send_instruction", fromId: uniqueId, command: "stop" }));
        ws.current.close();
      }
    };
  }, []);

  // Send joystick commands only when started
  useEffect(() => {
    if (!ws.current || !isStarted) return;

    const interval = setInterval(() => {
      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "send_instruction",
            fromId: uniqueId,
            throttle: joystick.throttle,
            steering: joystick.steering,
          })
        );
        console.log("📤 Sent:", joystick.throttle, joystick.steering);
      }
    }, 50); // 20Hz

    return () => clearInterval(interval);
  }, [joystick, isStarted]);

  // Animate map when GPS updates
  useEffect(() => {
    if (mainMapRef.current && roverCoords.latitude && roverCoords.longitude) {
      mainMapRef.current.animateToRegion(
        {
          ...roverCoords,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000,
      );
    }
  }, [roverCoords]);

  const sendCommand = cmd => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'send_instruction',
          fromId: uniqueId,
          command: cmd,
        }),
      );
      console.log('📤 Sent:', cmd);
    }
  };

  const connectRover = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'connectwithrover',
          email,
          password,
          uniqueId,
          roverid,
        }),
      );
    }
  };

  const toggleStartStop = () => {
    if (!isConnected) {
      Alert.alert("Not Connected", "Please connect to a rover first.");
      return;
    }
    const newStartedState = !isStarted;
    setIsStarted(newStartedState);
    sendCommand(newStartedState ? 'start' : 'stop');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main map / camera */}
      <View style={styles.mainBox}>
        {isMapMain ? (
          <MapView
            ref={mainMapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: roverCoords.latitude,
              longitude: roverCoords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={true}
          >
            {roverCoords.latitude && roverCoords.longitude && (
              <Marker
                coordinate={roverCoords}
                title="Rover"
                description={`Lat: ${roverCoords.latitude}, Lon: ${roverCoords.longitude}`}
              />
            )}
          </MapView>
        ) : (
          <View style={styles.cameraView}>
            <Text style={styles.noCameraText}>📷 Camera Stream</Text>
          </View>
        )}
      </View>

      {/* Small overlay toggle */}
      <TouchableOpacity
        style={styles.smallBox}
        onPress={() => setIsMapMain(!isMapMain)}
      >
        {isMapMain ? (
          <View style={styles.cameraViewSmall}>
            <Text style={styles.noCameraText}>📷 Camera</Text>
          </View>
        ) : (
          <MapView
            ref={smallMapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: roverCoords.latitude,
              longitude: roverCoords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={true}
          >
            {roverCoords.latitude && roverCoords.longitude && (
              <Marker
                coordinate={roverCoords}
                title="Rover"
                description={`Lat: ${roverCoords.latitude}, Lon: ${roverCoords.longitude}`}
              />
            )}
          </MapView>
        )}
      </TouchableOpacity>

      {/* Top bar */}
      <View style={styles.navBar}>
        <Image source={require('./Images/Logo.jpg')} style={styles.logo} />
        <Image
          source={require('./Images/battery.png')}
          style={styles.batteryIcon}
        />
      </View>

      {/* Start/Stop buttons */}
      <View style={styles.overlayLeft}>
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

      {/* Speed / Direction */}
      <View style={styles.speedDirection}>
        <Text style={styles.speedText}>Speed: 0 km/h</Text>
        <Text style={styles.directionText}>Direction: North</Text>
        <Text style={styles.label}>Rover ID:</Text>
      </View>

      {/* Rover Connect */}
      <View style={styles.roverConnect}>
        <TextInput
          style={styles.input}
          placeholder="Enter Rover ID"
          placeholderTextColor="#888"
          value={roverid}
          onChangeText={value => setRoverid(value)}
        />
        <Button title="Connect" onPress={connectRover} />
      </View>

      {/* Joystick */}
      <View style={styles.joystickWrapper}>
        <Joystick onMove={setJoystick} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mainBox: {
    flex: 1,
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cameraView: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCameraText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  smallBox: {
    position: 'absolute',
    left: 20,
    top: 80,
    width: 120,
    height: 90,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  cameraViewSmall: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { width: 40, height: 40, borderRadius: 20, resizeMode: 'contain' },
  batteryIcon: { width: 28, height: 28, resizeMode: 'contain' },
  overlayLeft: {
    position: 'absolute',
    left: 10,
    bottom: 20,
    width: 150,
    padding: 5,
  },
  controlButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  buttonWrapper: {
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  buttonActive: { backgroundColor: '#e74c3c' },
  icon: { width: 30, height: 30, resizeMode: 'contain' },
  speedDirection: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  speedText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  directionText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  joystickWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  map: { width: '100%', height: '100%' },
  roverConnect: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
    width: '50%',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 10,
  },
});
