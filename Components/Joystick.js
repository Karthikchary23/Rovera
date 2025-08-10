import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const Joystick = ({ onMove, size = 150, stickSize = 50, baseColor = '#333', stickColor = '#fff' }) => {
  const [stickPosition, setStickPosition] = useState({ x: 0, y: 0 });

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

      // Normalize values between -1 and 1 for device control
      const normalizedX = x / maxDistance;
      const normalizedY = y / maxDistance;

      onMove?.({
        x: normalizedX,
        y: normalizedY,
        distance: distance / maxDistance,
        angle: Math.atan2(y, x) * (180 / Math.PI)
      });
    }
  };

  const handleGestureStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END || nativeEvent.state === State.CANCELLED) {
      setStickPosition({ x: 0, y: 0 });
      onMove?.({ x: 0, y: 0, distance: 0, angle: 0 });
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: baseColor }]}>
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
              transform: [{ translateX: stickPosition.x }, { translateY: stickPosition.y }]
            }
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