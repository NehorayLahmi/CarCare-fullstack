import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PeriodicInfoBox({ lastPeriodicService, nextPeriodicServiceDate }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>הטיפול התקופתי האחרון:</Text>
      <Text style={styles.text}>
        {lastPeriodicService
          ? `${lastPeriodicService.type} ב-${lastPeriodicService.date} (קילומטראז': ${lastPeriodicService.kilometer})`
          : 'אין נתונים על טיפול תקופתי קודם.'}
      </Text>
      <Text style={styles.title}>הטיפול התקופתי הבא מומלץ בתאריך:</Text>
      <Text style={styles.date}>{nextPeriodicServiceDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
    alignItems: 'flex-end',
    width: '100%',
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2, textAlign: 'right' },
  text: { fontSize: 15, color: '#555', marginBottom: 10, textAlign: 'right' },
  date: { fontSize: 18, fontWeight: 'bold', color: '#1a237e', textAlign: 'right' },
});
