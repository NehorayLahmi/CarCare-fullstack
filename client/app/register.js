import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { showAlert } from '../lib/alert';
import { KeyboardAvoidingView, Platform } from 'react-native';


export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ id: '', name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => setForm({ ...form, [field]: value });

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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>הרשמה</Text>
        <TextInput style={styles.input} placeholder="ת.ז" onChangeText={(v) => handleChange('id', v)} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="שם מלא" onChangeText={(v) => handleChange('name', v)} />
        <TextInput style={styles.input} placeholder="מייל" onChangeText={(v) => handleChange('email', v)} />
        <TextInput style={styles.input} placeholder="טלפון" onChangeText={(v) => handleChange('phone', v)} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="סיסמה" secureTextEntry onChangeText={(v) => handleChange('password', v)} />
        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.btnText}>הרשם</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>יש לי כבר חשבון</Text>
        </TouchableOpacity>
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
    textAlign: 'right',
  },
  btnPrimary: {
    backgroundColor: '#3949ab',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  btnDisabled: { backgroundColor: '#9fa8da' },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  backText: {
    color: '#3949ab',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
