import 'react-native-gesture-handler';
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import { showAlert } from '../lib/alert';

export default function LoginScreen() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!id || !password) return showAlert('שגיאה', 'נא למלא את כל השדות');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { id, password });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('myId', id);
      router.replace('/home');
    } catch (err) {
      showAlert('שגיאה', err?.response?.data || err.message || 'אירעה שגיאה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f0f4ff' }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Text style={styles.appName}>CarCare</Text>
            <Text style={styles.subtitle}>ניהול רכב חכם</Text>
          </View>

          <Text style={styles.label}>תעודת זהות</Text>
          <TextInput
            style={styles.input}
            placeholder="הזן ת.ז"
            placeholderTextColor="#aaa"
            value={id}
            onChangeText={setId}
            keyboardType="numeric"
          />

          <Text style={styles.label}>סיסמה</Text>
          <TextInput
            style={styles.input}
            placeholder="הזן סיסמה"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>{loading ? 'מתחבר...' : 'התחבר'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>יצירת חשבון חדש</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('../forgot-password/forgot-password')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>שכחת סיסמה?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f0f4ff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e8eaf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: { fontSize: 36 },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3949ab',
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    textAlign: 'right',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 16,
    color: '#222',
    textAlign: 'right',
  },
  btnPrimary: {
    backgroundColor: '#3949ab',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  btnDisabled: { backgroundColor: '#9fa8da' },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { marginHorizontal: 12, color: '#aaa', fontSize: 13 },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: '#3949ab',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnSecondaryText: {
    color: '#3949ab',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
