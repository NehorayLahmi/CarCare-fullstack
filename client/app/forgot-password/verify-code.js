import { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const url = process.env.EXPO_PUBLIC_API_URL || 'localhost';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${url}:4000/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      Alert.alert('הצלחה', 'קוד אומת, המשך לאיפוס סיסמה');
      router.push({ pathname: '/forgot-password/reset-password', params: { email, code } });
    } catch (e) {
      Alert.alert('שגיאה', e.message);
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
        <Text style={styles.title}>אימות קוד</Text>
        <Text style={styles.label}>הזן את קוד האימות שנשלח למייל:</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
          style={styles.input}
          placeholder="6 ספרות"
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>אמת קוד</Text>}
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
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 16,
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
