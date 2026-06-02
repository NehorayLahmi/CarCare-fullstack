import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

export default function NoteModal({ visible, note, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>הערה לטיפול</Text>
          <Text style={styles.text}>{note}</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>סגור</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#3949ab', marginBottom: 12 },
  text: { fontSize: 16, color: '#222', marginBottom: 18, textAlign: 'right' },
  btn: { backgroundColor: '#3949ab', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
