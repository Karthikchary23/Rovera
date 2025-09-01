import { useState, useRef } from "react";
import { View, StyleSheet, PanResponder } from "react-native";

export default function Joystick({ onMove }) {
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const radius = 80;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gesture) => {
        const dx = gesture.dx;
        const dy = gesture.dy;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          setJoystickPos({ x: dx, y: dy });

          
          const nx = Math.max(-1, Math.min(1, dx / radius));
          const ny = Math.max(-1, Math.min(1, -dy / radius)); // invert Y
          onMove({ x: nx, y: ny });
        }
      },
      onPanResponderRelease: () => {
        setJoystickPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 }); // stop
      },
    })
  ).current;

  return (
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
  );
}

const styles = StyleSheet.create({
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
});
