import 'react-native-gesture-handler';
import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import { KeyboardAvoidingView, Platform } from 'react-native';


export default function LoginScreen() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!id || !password) return Alert.alert('שגיאה', 'נא למלא את כל השדות');

    try {
      const res = await api.post('/auth/login', { id, password });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('myId', id); // שמור את תעודת הזהות
      router.replace('/home');
    } catch (err) {
      Alert.alert('שגיאה', err?.response?.data || err.message || 'אירעה שגיאה');
    }
  };


  return (

    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>התחברות</Text>
        <TextInput style={styles.input} placeholder="ת.ז" value={id} onChangeText={setId} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="סיסמה" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="התחבר" onPress={handleLogin} />
        <Button title="אין חשבון? להרשמה" onPress={() => router.push('/register')} />
        <Button title="שכחת סיסמה?" onPress={() => router.push('../forgot-password/forgot-password')} />
      </View>

      {/* כאן כל התוכן שלך, כולל ScrollView/TextInput וכו' */}
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
    textAlign: 'right'

  },
});
