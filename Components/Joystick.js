import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';

export default function Joystick({ onMove }) {
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const radius = 80;
  const stepSize = radius / 5;

  const getAngle = (dx, dy) => {
    const angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;
    return (angleDeg - 90 + 360) % 360;
  };

  const getStage = dist => Math.min(5, Math.floor(dist / stepSize));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gesture) => {
        let dx = gesture.dx;
        let dy = gesture.dy;

        const rawDist = Math.sqrt(dx * dx + dy * dy);
        const distance = Math.min(rawDist, radius);
        const clampedX = (dx / rawDist) * distance || 0;
        const clampedY = (dy / rawDist) * distance || 0;
        setJoystickPos({ x: clampedX, y: clampedY });

        const angle = getAngle(dx, -dy);
        const stage = getStage(distance);

        let leftMotor = 1500;
        let rightMotor = 1500;

        if (stage > 0) {
          if (angle >= 80 && angle <= 100) {
           
             // Spin Left
              leftMotor = 1500 + stage * 100;
            rightMotor = 1500 - stage * 100;
            
            // console.log('spin left', leftMotor, rightMotor);
           
          } else if (angle >= 260 && angle <= 280) {
             
             // Spin Right
             leftMotor = 1500 - stage * 100;
            rightMotor = 1500 + stage * 100;
           
            // console.log('spin right', leftMotor, rightMotor);

           
          } else if (angle <= 10 || angle >= 350) {
           
             // Forward
            leftMotor = 1500 + stage * 100;
            rightMotor = 1500 + stage * 100;
            // console.log('forward', leftMotor, rightMotor);
          } else if (angle >= 170 && angle <= 190) {
            
            // Backward
            leftMotor = 1500 - stage * 100;
            rightMotor = 1500 - stage * 100;
            // console.log('back', leftMotor, rightMotor);
          } else if (angle > 10 && angle < 80) {
             // Forward-Right
            leftMotor = 1500 + stage * 100;
            rightMotor = 1500;
            // console.log('forward-right', leftMotor, rightMotor);
             
           
          } else if (angle > 100 && angle < 170) {
           
            // Backward-left
            leftMotor = 1500 - stage * 100;
            rightMotor = 1500;
            // console.log('back-left', leftMotor, rightMotor);
           
           
          } else if (angle > 180 && angle < 270) {
             
             
             // Backward-right
            rightMotor = 1500 - stage * 100;
            leftMotor = 1500;
            // console.log('back-right', leftMotor, rightMotor);
          }
          else if (angle > 270 && angle < 360) {
          
             // Forward-Left
            rightMotor = 1500 + stage * 100;
            leftMotor = 1500;
           // console.log('forward-left', leftMotor, rightMotor);
          } 
            
        }

        // // ✅ FIX: Invert Right Motor to match hardware
        // rightMotor = 3000 - rightMotor;

        onMove({ throttle: leftMotor, steering: rightMotor });
      },
      onPanResponderRelease: () => {
        setJoystickPos({ x: 0, y: 0 });
        onMove({ throttle: 1500, steering: 1500 });
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.joystickOuter} {...panResponder.panHandlers}>
        <View
          style={[
            styles.joystickInner,
            {
              transform: [
                { translateX: joystickPos.x },
                { translateY: joystickPos.y },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  joystickOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#888',
  },
});
