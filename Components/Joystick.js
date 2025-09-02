import React, { useState, useRef } from "react";
import { View, StyleSheet, PanResponder, Text } from "react-native";

export default function Joystick({ onMove }) {
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [directionText, setDirectionText] = useState("");
  const radius = 80; // max joystick travel
  const stepSize = radius / 5; // divide circle into 5 rings

  const getAngle = (dx, dy) => {
    const angleRad = Math.atan2(dy, dx);
    let angleDeg = (angleRad * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;
    return (angleDeg - 90 + 360) % 360;
  };

  const getStage = (dist) => {
    // distance from center mapped into 0–5 steps
    return Math.min(5, Math.floor(dist / stepSize));
  };

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
        const stage = getStage(distance); // 0 to 5

        let leftMotor = 1500;
        let rightMotor = 1500;
        let dir = "Neutral";

        if (stage > 0) {
          if (angle >= 80 && angle <= 100) {
            // Forward
            leftMotor = 1500 + stage * 100;
            rightMotor = 1500 + stage * 100;
            dir = `Forward ${stage}`;
          } else if (angle >= 260 && angle <= 280) {
            // Backward
            leftMotor = 1500 - stage * 100;
            rightMotor = 1500 - stage * 100;
            dir = `Backward ${stage}`;
          } else if (angle <= 10 || angle >= 350) {
            // Spin Right
            leftMotor = 1500 + stage * 100;
            rightMotor = 1500 - stage * 100;
            dir = `Spin Right ${stage}`;
          } else if (angle >= 170 && angle <= 190) {
            // Spin Left
            leftMotor = 1500 - stage * 100;
            rightMotor = 1500 + stage * 100;
            dir = `Spin Left ${stage}`;
          } else if (angle > 10 && angle < 80) {
            // Forward-Right
            leftMotor = 1500 + stage * 100;
            dir = `Forward-Right ${stage}`;
          } else if (angle > 100 && angle < 170) {
            // Forward-Left
            rightMotor = 1500 + stage * 100;
            dir = `Forward-Left ${stage}`;
          } else if (angle > 180 && angle < 270) {
            // Backward-Left
            rightMotor = 1500 - stage * 100;
            dir = `Backward-Left ${stage}`;
          } else if (angle > 270 && angle < 360) {
            // Backward-Right
            leftMotor = 1500 - stage * 100;
            dir = `Backward-Right ${stage}`;
          }
        }

        setDirectionText(dir);
        onMove({ throttle: leftMotor, steering: rightMotor });
      },
      onPanResponderRelease: () => {
        setJoystickPos({ x: 0, y: 0 });
        setDirectionText("Neutral");
        onMove({ throttle: 1500, steering: 1500 });
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.joystickOuter} {...panResponder.panHandlers}>
        {/* {directionText !== "" && (
          <Text style={styles.directionText}>{directionText}</Text>
        )} */}
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
