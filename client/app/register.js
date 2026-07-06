import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { showAlert } from '../lib/alert';

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ id: '', name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleRegister = async () => {
    const { id, name, email, phone, password } = form;
    if (!id || !name || !email || !phone || !password)
      return showAlert('שגיאה', 'נא למלא את כל השדות');

    setLoading(true);
    try {
      await api.post('/auth/register', form);
      showAlert('נרשמת בהצלחה', 'ניתן להתחבר עכשיו');
      router.replace('/');
    } catch (err) {
      showAlert('שגיאה', err?.response?.data || 'אירעה שגיאה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f0f4ff' }}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Text style={styles.appName}>CarCare</Text>
            <Text style={styles.subtitle}>יצירת חשבון חדש</Text>
          </View>

          <Text style={styles.label}>תעודת זהות</Text>
          <TextInput
            style={styles.input}
            placeholder="הזן ת.ז"
            placeholderTextColor="#aaa"
            onChangeText={v => handleChange('id', v)}
            keyboardType="numeric"
            textAlign="right"
          />

          <Text style={styles.label}>שם מלא</Text>
          <TextInput
            style={styles.input}
            placeholder="הזן שם מלא"
            placeholderTextColor="#aaa"
            onChangeText={v => handleChange('name', v)}
            textAlign="right"
          />

          <Text style={styles.label}>מייל</Text>
          <TextInput
            style={styles.input}
            placeholder="הזן מייל"
            placeholderTextColor="#aaa"
            onChangeText={v => handleChange('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign="right"
          />

          <Text style={styles.label}>טלפון</Text>
          <TextInput
            style={styles.input}
            placeholder="הזן מספר טלפון"
            placeholderTextColor="#aaa"
            onChangeText={v => handleChange('phone', v)}
            keyboardType="phone-pad"
            textAlign="right"
          />

          <Text style={styles.label}>סיסמה</Text>
          <TextInput
            style={styles.input}
            placeholder="הזן סיסמה"
            placeholderTextColor="#aaa"
            onChangeText={v => handleChange('password', v)}
            secureTextEntry
            textAlign="right"
          />

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.btnPrimaryText}>הרשם</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backText}>יש לי כבר חשבון — התחבר</Text>
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
  },
  btnPrimary: {
    backgroundColor: '#3949ab',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  btnDisabled: { backgroundColor: '#9fa8da' },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backText: {
    color: '#3949ab',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
