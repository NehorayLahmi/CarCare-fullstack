import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../lib/api';
import { showAlert } from '../../lib/alert';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError('');
    if (newPassword.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      showAlert('הצלחה', 'הסיסמה אופסה!');
      router.replace('/');
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
        <Text style={styles.title}>איפוס סיסמה</Text>
        <Text style={styles.label}>הזן סיסמה חדשה:</Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          style={styles.input}
          placeholder="סיסמה חדשה"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>אפס סיסמה</Text>}
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
    fontSize: 18,
    borderColor: '#e3e6ed',
    borderWidth: 1,
    marginBottom: 12,
    elevation: 1,
  },
  error: {
    color: '#ff4444',
    fontSize: 16,
    marginBottom: 10,
    alignSelf: 'center',
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
    marginTop: 8,
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
