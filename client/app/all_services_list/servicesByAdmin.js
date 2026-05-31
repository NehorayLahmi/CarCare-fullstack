import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';

export default function AddModelService() {
  const router = useRouter();

  const [tozeretNm, setTozeretNm] = useState('');
  const [degemNm, setDegemNm] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [serviceIntervalKm, setServiceIntervalKm] = useState('');
  const [serviceIntervalMonths, setServiceIntervalMonths] = useState('');
  const [notes, setNotes] = useState('');
  const [averageCost, setAverageCost] = useState('');
  const [garageName, setGarageName] = useState('');

  const saveService = async () => {
    // בדיקת שדות חובה
    if (!tozeretNm.trim() || !degemNm.trim() || !serviceType.trim()) {
      Alert.alert('שגיאה', 'נא למלא את שדות היצרן, דגם וסוג טיפול');
      return;
    }

    try {
      await api.post('/modelService', {
        tozeret_nm: tozeretNm.trim(),
        degem_nm: degemNm.trim(),
        serviceType: serviceType.trim(),
        serviceIntervalKm: serviceIntervalKm ? Number(serviceIntervalKm) : undefined,
        serviceIntervalMonths: serviceIntervalMonths ? Number(serviceIntervalMonths) : undefined,
        notes: notes.trim(),
        averageCost: averageCost ? Number(averageCost) : undefined,
        garageName: garageName.trim(),
      });

      Alert.alert('הצלחה', 'סוג טיפול נוסף בהצלחה');
      router.back();
    } catch (e) {
      Alert.alert('שגיאה', e.response?.data?.message || e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, direction: 'ltr' }}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>הוספת סוג טיפול חדש</Text>

        <TextInput
          placeholder="יצרן"
          value={tozeretNm}
          onChangeText={setTozeretNm}
          style={styles.input}
          textAlign="right"
        />
        <TextInput
          placeholder="דגם"
          value={degemNm}
          onChangeText={setDegemNm}
          style={styles.input}
          textAlign="right"
        />
        <TextInput
          placeholder="סוג טיפול"
          value={serviceType}
          onChangeText={setServiceType}
          style={styles.input}
          textAlign="right"
        />
        <TextInput
          placeholder="מרחק בק'מ לטיפול"
          value={serviceIntervalKm}
          keyboardType="numeric"
          onChangeText={setServiceIntervalKm}
          style={styles.input}
          textAlign="right"
        />
        <TextInput
          placeholder="חודשים לטיפול"
          value={serviceIntervalMonths}
          keyboardType="numeric"
          onChangeText={setServiceIntervalMonths}
          style={styles.input}
          textAlign="right"
        />
        <TextInput
          placeholder="הערות"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={[styles.input, { height: 80 }]}
          textAlign="right"
        />
        <TextInput
          placeholder="עלות ממוצעת"
          value={averageCost}
          onChangeText={setAverageCost}
          keyboardType="numeric"
          style={styles.input}
          textAlign="right"
        />
        <TextInput
          placeholder="מוסך מומלץ"
          value={garageName}
          onChangeText={setGarageName}
          style={styles.input}
          textAlign="right"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={saveService}>
          <Text style={styles.saveBtnText}>שמור סוג טיפול</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'right',
  },
  saveBtn: {
    backgroundColor: '#3949ab',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
