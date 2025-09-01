import React, { useState, useRef } from "react";
import { View, StyleSheet, PanResponder, Text } from "react-native";

export default function Joystick({ onMove }) {
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [directionText, setDirectionText] = useState("");
  const radius = 80;

  // Convert joystick dx,dy to polar angle
  const getAngle = (dx, dy) => {
    const angleRad = Math.atan2(dy, dx); // -π..π
    let angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360; // Normalize 0–360
    return angleDeg;
  };

  // Helper: scale to ESC PWM range
  const pwm = (val) => Math.max(1000, Math.min(2000, val));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gesture) => {
        let dx = gesture.dx;
        let dy = gesture.dy;

        // Clamp joystick position to radius
        const rawDist = Math.sqrt(dx * dx + dy * dy);
        const distance = Math.min(rawDist, radius);
        const clampedX = (dx / rawDist) * distance || 0;
        const clampedY = (dy / rawDist) * distance || 0;
        setJoystickPos({ x: clampedX, y: clampedY });

        // Compute angle
        const angle = getAngle(dx, -dy);
        let leftMotor = 1500;  // Neutral
        let rightMotor = 1500; // Neutral
        let dir = "";

        // --- Mapping Rules ---
        if (angle >= 85 && angle <= 95) {
          // 90° → Forward (both clockwise)
          leftMotor = pwm(2000);
          rightMotor = pwm(2000);
          dir = "Forward";
        } else if (angle >= 265 && angle <= 275) {
          // 270° → Backward (both anti-clockwise)
          leftMotor = pwm(1000);
          rightMotor = pwm(1000);
          dir = "Backward";
        } else if (angle <= 5 || angle >= 355) {
          // 0° → Right (left motor forward, right off)
          leftMotor = pwm(2000);
          rightMotor = 1500;
          dir = "Right";
        } else if (angle >= 175 && angle <= 185) {
          // 180° → Left (right motor forward, left off)
          leftMotor = 1500;
          rightMotor = pwm(2000);
          dir = "Left";
        } else if (angle > 0 && angle < 90) {
          // Between 0–90 → Left forward, Right off
          leftMotor = pwm(2000);
          rightMotor = 1500;
          dir = "Forward-Right";
        } else if (angle > 90 && angle < 180) {
          // Between 90–180 → Right forward, Left off
          leftMotor = 1500;
          rightMotor = pwm(2000);
          dir = "Forward-Left";
        } else if (angle > 180 && angle < 270) {
          // Between 180–270 → Right backward, Left off
          leftMotor = 1500;
          rightMotor = pwm(1000);
          dir = "Backward-Left";
        } else if (angle > 270 && angle < 360) {
          // Between 270–360 → Left backward, Right off
          leftMotor = pwm(1000);
          rightMotor = 1500;
          dir = "Backward-Right";
        }

        setDirectionText(dir);

        // Send PWM values
        onMove({ throttle: leftMotor, steering: rightMotor });
      },
      onPanResponderRelease: () => {
        setJoystickPos({ x: 0, y: 0 });
        setDirectionText("");
        onMove({ throttle: 1500, steering: 1500 }); // Neutral stop
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.joystickOuter} {...panResponder.panHandlers}>
        {directionText !== "" && (
          <Text style={styles.directionText}>{directionText}</Text>
        )}
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
  container: { alignItems: "center", justifyContent: "center", marginTop: 20 },
  joystickOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  joystickInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#888",
  },
  directionText: {
    position: "absolute",
    top: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
