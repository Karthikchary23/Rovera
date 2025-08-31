import { useState, useRef } from "react";
import { View, StyleSheet, PanResponder } from "react-native";

export default function Joystick({ sendCommand }) {
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const center = { x: 0, y: 0 };
  const radius = 80;
  const lastCommand = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gesture) => {
        const dx = gesture.dx;
        const dy = gesture.dy;

        
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          setJoystickPos({ x: dx, y: dy });
        }

        let cmd = null;
        if (dy < -30 && Math.abs(dx) < 40) {
          cmd = "forward";
        } else if (dy > 30 && Math.abs(dx) < 40) {
          cmd = "backward";
        } else if (dx < -30 && Math.abs(dy) < 40) {
          cmd = "left";
        } else if (dx > 30 && Math.abs(dy) < 40) {
          cmd = "right";
        } else {
          cmd = "stop";
        }

        // Only send if command changed
        if (cmd !== lastCommand.current) {
          sendCommand(cmd);
          lastCommand.current = cmd;
        }
      },
      onPanResponderRelease: () => {
        setJoystickPos(center);
        if (lastCommand.current !== "stop") {
          sendCommand("stop");
          lastCommand.current = "stop";
        }
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
