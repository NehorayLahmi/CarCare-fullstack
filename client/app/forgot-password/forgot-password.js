import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';
import { showAlert } from '../../lib/alert';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async () => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      showAlert('הצלחה', 'קוד אימות נשלח למייל');
      router.push({ pathname: '/forgot-password/verify-code', params: { email } });
    } catch (e) {
      showAlert('שגיאה', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>שחזור סיסמה</Text>
        <Text style={styles.label}>הזן כתובת מייל:</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="example@gmail.com"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendCode}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>שלח קוד</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3a4b',
    marginBottom: 24,
    letterSpacing: 1,
  },
  label: {
    fontSize: 18,
    color: '#2d3a4b',
    marginBottom: 8,
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderColor: '#e3e6ed',
    borderWidth: 1,
    marginBottom: 20,
    elevation: 1,
  },
  button: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#4f8cff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4f8cff',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#a5b8d8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
