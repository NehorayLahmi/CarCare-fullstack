import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { KeyboardAvoidingView, Platform } from 'react-native';


export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ id: '', name: '', email: '', phone: '', password: '' });

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

  const handleRegister = async () => {
    const { id, name, email, phone, password } = form;
    if (!id || !name || !email || !phone || !password)
      return Alert.alert('שגיאה', 'נא למלא את כל השדות');

    try {
      await api.post('/auth/register', form);
      //console.log('Registration successful:', form); // 🐞
      Alert.alert('נרשמת בהצלחה', 'ניתן להתחבר עכשיו');
      router.replace('/');
    } catch (err) {
      Alert.alert('4שגיאה', err?.response?.data || 'אירעה שגיאה');
    }
  };

  return (



    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>הרשמה</Text>
        <TextInput style={styles.input} placeholder="ת.ז" onChangeText={(v) => handleChange('id', v)} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="שם מלא" onChangeText={(v) => handleChange('name', v)} />
        <TextInput style={styles.input} placeholder="מייל" onChangeText={(v) => handleChange('email', v)} />
        <TextInput style={styles.input} placeholder="טלפון" onChangeText={(v) => handleChange('phone', v)} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="סיסמה" secureTextEntry onChangeText={(v) => handleChange('password', v)} />
        <Button title="הרשם" onPress={handleRegister} />
      </View>
    </KeyboardAvoidingView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'right',           // יישור הטקסט לימין בשדה קלט

  },
});
