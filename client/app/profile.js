import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { showAlert } from '../lib/alert';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/profile');
      setProfile(data);
      setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
    } catch (e) {
      showAlert('שגיאה', 'לא ניתן לטעון את הפרופיל');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      showAlert('שגיאה', 'נא למלא את כל השדות');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/profile', form);
      setProfile(data);
      setEditMode(false);
      showAlert('הצלחה', 'הפרופיל עודכן בהצלחה');
    } catch (e) {
      showAlert('שגיאה', e.response?.data || e.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3949ab" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f0f4ff' }}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>

          {/* אווטאר */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>

          {!editMode ? (
            /* תצוגה */
            <>
              <Text style={styles.userName}>{profile.name}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>מייל</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>טלפון</Text>
                <Text style={styles.infoValue}>{profile.phone}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>תעודת זהות</Text>
                <Text style={styles.infoValue}>{profile.id}</Text>
              </View>

              <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
                <Text style={styles.editBtnText}>עריכת פרטים</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* עריכה */
            <>
              <Text style={styles.editTitle}>עריכת פרופיל</Text>

              <Text style={styles.label}>שם מלא</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={v => setForm(f => ({ ...f, name: v }))}
                placeholder="שם מלא"
                textAlign="right"
                placeholderTextColor="#aaa"
              />

              <Text style={styles.label}>מייל</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={v => setForm(f => ({ ...f, email: v }))}
                placeholder="מייל"
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="right"
                placeholderTextColor="#aaa"
              />

              <Text style={styles.label}>טלפון</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={v => setForm(f => ({ ...f, phone: v }))}
                placeholder="טלפון"
                keyboardType="phone-pad"
                textAlign="right"
                placeholderTextColor="#aaa"
              />

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.saveBtnText}>שמור</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setEditMode(false); setForm({ name: profile.name, email: profile.email, phone: profile.phone }); }}
                  disabled={saving}
                >
                  <Text style={styles.cancelBtnText}>ביטול</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>חזרה</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4ff' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f0f4ff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3949ab',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1a237e', marginBottom: 24, textAlign: 'center' },
  infoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  infoLabel: { fontSize: 14, color: '#888', fontWeight: '600', textAlign: 'right' },
  infoValue: { fontSize: 16, color: '#222', textAlign: 'left', flexShrink: 1, marginRight: 12 },
  divider: { height: 1, backgroundColor: '#eee', width: '100%' },
  editBtn: {
    backgroundColor: '#3949ab',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 40,
    marginTop: 24,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
  },
  editBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  editTitle: { fontSize: 20, fontWeight: 'bold', color: '#3949ab', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#444', textAlign: 'right', alignSelf: 'flex-end', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 13, fontSize: 16, backgroundColor: '#fafafa',
    marginBottom: 14, color: '#222', width: '100%',
  },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  saveBtn: {
    flex: 1, backgroundColor: '#3949ab', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#9fa8da' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#3949ab', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  cancelBtnText: { color: '#3949ab', fontSize: 16, fontWeight: '600' },
  backBtn: { marginTop: 20, padding: 8 },
  backBtnText: { color: '#888', fontSize: 14, textDecorationLine: 'underline', textAlign: 'center' },
});
