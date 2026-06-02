import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ServiceCard({ service, onPress }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onPress}>
      <Text style={styles.type}>סוג טיפול: {service.type}</Text>
      <Text style={styles.date}>תאריך: {service.date}</Text>
      <Text style={styles.cost}>עלות: {service.cost} ₪</Text>
      <Text style={styles.garage}>מוסך: {service.garageName}</Text>
      <Text style={styles.km}>קילומטר בעת הטיפול: {service.kilometer}</Text>
      <View style={styles.actionsRow} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    paddingBottom: 8,
    alignItems: 'flex-end',
  },
  type: { fontWeight: 'bold', color: '#1a237e', fontSize: 16, marginBottom: 2 },
  date: { color: '#3949ab', fontSize: 15, marginBottom: 2 },
  cost: { color: '#333', fontSize: 15, marginBottom: 2 },
  garage: { color: '#3949ab', fontSize: 15, marginBottom: 2, textAlign: 'right' },
  km: { color: '#333', fontSize: 15, marginBottom: 2 },
  actionsRow: { flexDirection: 'row-reverse', marginTop: 4 },
});
