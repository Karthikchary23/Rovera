import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";

const choices = [
  { label: "Mobile", value: "mobile" },
  { label: "RC Control", value: "rc" },
];

const Mode = ({ selected, onChange }) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (value) => {
    onChange(value);   
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose Mode:</Text>

      {/* Selection Button */}
      <TouchableOpacity style={styles.selector} onPress={() => setVisible(true)}>
        <Text style={styles.selectorText}>
          {choices.find((c) => c.value === selected)?.label}
        </Text>
      </TouchableOpacity>

      {/* Modal Dropdown */}
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={choices}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
              <Text style={{ color: "white" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { padding: 10,top:-50,paddingRight:"20" },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  selector: {
    padding: 6,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    alignItems:"center"
  },
  selectorText: { fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionText: { fontSize: 16 },
  closeButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "red",
    borderRadius: 8,
    alignItems: "center",
  },
});

export default Mode;
