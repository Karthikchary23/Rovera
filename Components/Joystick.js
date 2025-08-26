import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const ESP32_IP = '192.168.0.161'; // Your ESP32's IP

const Joystick = ({
  size = 150,
  stickSize = 50,
  baseColor = '#333',
  stickColor = '#fff',
}) => {
  const [stickPosition, setStickPosition] = useState({ x: 0, y: 0 });

  const sendToESP32 = payload => {
  console.log("Sending:", payload);
  
  fetch(`http://${ESP32_IP}/move`,
    {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify(payload),
  })
    .then(res => res.text())
    .then(data => console.log('ESP32 response:', data))
    .catch(err => console.log('ESP32 error:', err));
};


  const handleGesture = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      const maxDistance = size / 2 - stickSize / 2;
      let x = nativeEvent.translationX;
      let y = nativeEvent.translationY;

      const distance = Math.sqrt(x * x + y * y);
      if (distance > maxDistance) {
        const angle = Math.atan2(y, x);
        x = maxDistance * Math.cos(angle);
        y = maxDistance * Math.sin(angle);
      }

      setStickPosition({ x, y });

      const normalizedX = x / maxDistance;
      const normalizedY = y / maxDistance;

      const payload = {
        x: normalizedX,
        y: normalizedY,
      };

      sendToESP32(payload);
    }
  };

  const handleGestureStateChange = ({ nativeEvent }) => {
    if (
      nativeEvent.state === State.END ||
      nativeEvent.state === State.CANCELLED
    ) {
      setStickPosition({ x: 0, y: 0 });
      sendToESP32({ x: 0, y: 0 }); // stop
    }
  };

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, backgroundColor: baseColor },
      ]}
    >
      <PanGestureHandler
        onGestureEvent={handleGesture}
        onHandlerStateChange={handleGestureStateChange}
      >
        <View
          style={[
            styles.stick,
            {
              width: stickSize,
              height: stickSize,
              backgroundColor: stickColor,
              transform: [
                { translateX: stickPosition.x },
                { translateY: stickPosition.y },
              ],
            },
          ]}
        />
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stick: {
    borderRadius: 999,
    position: 'absolute',
  },
});

export default Joystick;
