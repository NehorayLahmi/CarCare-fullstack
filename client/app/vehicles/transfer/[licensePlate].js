import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TransferOwnershipScreen() {
  const { licensePlate } = useLocalSearchParams();
  const [targetId, setTargetId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const url = process.env.EXPO_PUBLIC_API_URL;

  // בדיקה בסיסית לתעודת זהות
  const isValidId = (id) => /^\d{5,10}$/.test(id);

  const sendTransferRequest = async () => {
    if (!targetId.trim()) {
      Alert.alert('שגיאה', 'יש להזין תעודת זהות של מקבל הרכב');
      return;
    }
    if (!isValidId(targetId.trim())) {
      Alert.alert('שגיאה', 'תעודת הזהות אינה תקינה');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://${url}:4000/transfer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licensePlate,
          toId: targetId.trim()
        }),
      });

      const resJson = await response.json();
      if (!response.ok) throw new Error(resJson.message || 'שגיאה בשליחת הבקשה');

      Alert.alert('הצלחה', 'בקשת ההעברה נשלחה בהצלחה');
      setTargetId('');
      router.back();
    } catch (e) {
      Alert.alert('שגיאה', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>העברת בעלות על רכב</Text>
      <Text style={styles.label}>מספר רישוי: {licensePlate}</Text>

      <TextInput
        style={styles.input}
        placeholder="תעודת זהות של מקבל הרכב"
        value={targetId}
        onChangeText={setTargetId}
        keyboardType="numeric"
        placeholderTextColor="#999"
        maxLength={10}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={sendTransferRequest}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>שלח בקשה להעברה</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 18, marginBottom: 12, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#2196f3',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
