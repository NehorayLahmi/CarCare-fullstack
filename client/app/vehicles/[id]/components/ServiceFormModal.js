import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, FlatList,
  ActivityIndicator, Alert, StyleSheet, Platform, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../../../lib/api';
import { SERVICE_TYPES } from './constants';

const isValidDate = (dateStr) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && dateStr === d.toISOString().split('T')[0];
};

export default function ServiceFormModal({
  visible,
  onClose,
  editMode,
  initialValues,
  serviceTypeItems,
  setServiceTypeItems,
  lastKilometer,
  vehicleId,
  onSaved,
}) {
  const [form, setForm] = useState(initialValues);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(new Date());
  const [garageResults, setGarageResults] = useState([]);
  const [garageLoading, setGarageLoading] = useState(false);

  useEffect(() => {
    if (visible && initialValues) {
      setForm(initialValues);
      const d = initialValues.date && !isNaN(new Date(initialValues.date))
        ? new Date(initialValues.date)
        : new Date();
      setDatePickerValue(d);
    }
    if (!visible) {
      setGarageResults([]);
      setShowDatePicker(false);
    }
  }, [visible, initialValues]);

  const searchGarages = async (query) => {
    if (!query || query.length < 2) { setGarageResults([]); return; }
    setGarageLoading(true);
    try {
      const res = await fetch(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=bb68386a-a331-4bbc-b668-bba2766d517d&q=${encodeURIComponent(query)}&limit=20`
      );
      const data = await res.json();
      if (data.result?.records) {
        setGarageResults(
          data.result.records
            .map(r => r.shem_mosah ? `${r.shem_mosah} (${r.yishuv}${r.ktovet ? ', ' + r.ktovet : ''})` : '')
            .filter(Boolean)
        );
      } else {
        setGarageResults([]);
      }
    } catch {
      setGarageResults([]);
    } finally {
      setGarageLoading(false);
    }
  };

  const handleSave = async () => {
    const { type, customType, date, cost, note, garageName, kilometer, _id } = form;
    const finalType = type === 'טיפול אחר' ? customType.trim() : type;

    if (!finalType || !date || !cost || !garageName || !kilometer) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות החובה');
      return;
    }
    if (Number(kilometer) < lastKilometer) {
      Alert.alert('שגיאה', `הקילומטראז' שהוזן (${kilometer}) נמוך מהקילומטראז' האחרון (${lastKilometer})`);
      return;
    }
    if (!isValidDate(date)) {
      Alert.alert('שגיאה', 'אנא הזן תאריך תקין בפורמט YYYY-MM-DD');
      return;
    }

    try {
      const body = { type: finalType, date, cost: Number(cost), note, garageName, kilometer: Number(kilometer) };
      if (editMode && _id) {
        await api.put(`/services/${_id}`, body);
        Alert.alert('הצלחה', 'הטיפול עודכן בהצלחה!');
      } else {
        await api.post('/services', { ...body, vehicleId });
        Alert.alert('הצלחה', 'הטיפול נשמר בהצלחה!');
      }
      onClose();
      onSaved();
    } catch (e) {
      Alert.alert('שגיאה', `לא ניתן לשמור טיפול: ${e.response?.data?.message || e.message || 'נסה שוב מאוחר יותר'}`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title}>{editMode ? 'עריכת טיפול' : 'הוספת טיפול'}</Text>

            <Text style={styles.label}>סוג טיפול</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTypePicker(true)}>
              <Text style={styles.pickerArrow}>‹</Text>
              <Text style={styles.pickerValue}>{form.type || 'בחר סוג טיפול'}</Text>
            </TouchableOpacity>

            <Modal visible={showTypePicker} transparent animationType="slide" onRequestClose={() => setShowTypePicker(false)}>
              <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowTypePicker(false)}>
                <View style={styles.pickerSheet}>
                  <View style={styles.pickerHandle} />
                  <Text style={styles.pickerTitle}>בחר סוג טיפול</Text>
                  <ScrollView>
                    {serviceTypeItems.map(item => (
                      <TouchableOpacity
                        key={item.value}
                        style={[styles.pickerItem, form.type === item.value && styles.pickerItemSelected]}
                        onPress={() => { setForm(f => ({ ...f, type: item.value })); setShowTypePicker(false); }}
                      >
                        <Text style={[styles.pickerItemText, form.type === item.value && styles.pickerItemTextSelected]}>
                          {item.label}
                        </Text>
                        {form.type === item.value && <Text style={styles.pickerCheck}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>

            {form.type === 'טיפול אחר' && (
              <TextInput
                style={styles.input}
                placeholder="הזן סוג טיפול"
                value={form.customType}
                onChangeText={customType => setForm(f => ({ ...f, customType }))}
              />
            )}

            <Text style={styles.label}>תאריך</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateBtnText}>
                {form.date || new Date().toISOString().split('T')[0]}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={datePickerValue}
                mode="date"
                display={Platform.OS === 'ios' ? 'compact' : 'default'}
                onChange={(event, selectedDate) => {
                  if (event.type === 'set' && selectedDate) {
                    setDatePickerValue(selectedDate);
                    setForm(f => ({ ...f, date: selectedDate.toISOString().split('T')[0] }));
                  }
                  setShowDatePicker(false);
                }}
              />
            )}

            <Text style={styles.label}>עלות</Text>
            <Text style={styles.sliderValue}>{form.cost} ₪</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100000}
              step={100}
              value={form.cost}
              onValueChange={value => setForm(f => ({ ...f, cost: value }))}
              minimumTrackTintColor="#3949ab"
              maximumTrackTintColor="#a0a0a0"
              thumbTintColor="#3949ab"
            />
            <TextInput
              style={styles.input}
              value={form.cost.toString()}
              onChangeText={text => {
                let n = parseInt(text);
                if (isNaN(n)) n = 0;
                if (n > 100000) n = 100000;
                setForm(f => ({ ...f, cost: n }));
              }}
              keyboardType="numeric"
              placeholder="הכנס עלות בש״ח"
            />

            <Text style={styles.label}>מוסך בו טופל הרכב</Text>
            <TextInput
              style={styles.input}
              placeholder="חפש מוסך"
              value={form.garageName}
              onChangeText={q => { setForm(f => ({ ...f, garageName: q })); searchGarages(q); }}
            />
            {garageLoading && <ActivityIndicator size="small" color="#3949ab" />}
            {garageResults.length > 0 && (
              <FlatList
                data={garageResults}
                keyExtractor={(item, i) => item + i}
                style={styles.garageList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.garageItem}
                    onPress={() => { setForm(f => ({ ...f, garageName: item })); setGarageResults([]); }}
                  >
                    <Text style={styles.garageItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <Text style={styles.label}>קילומטר בעת הטיפול</Text>
            <TextInput
              style={styles.input}
              placeholder="קילומטר בעת הטיפול"
              value={form.kilometer}
              onChangeText={km => setForm(f => ({ ...f, kilometer: km }))}
              keyboardType="numeric"
            />

            <Text style={styles.label}>הערה (לא חובה)</Text>
            <TextInput
              style={styles.input}
              placeholder="הערה"
              value={form.note}
              onChangeText={note => setForm(f => ({ ...f, note }))}
              multiline
            />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>שמור</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  content: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 3 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#3949ab', marginBottom: 12, textAlign: 'center' },
  label: { fontSize: 15, fontWeight: 'bold', color: '#1a237e', marginBottom: 3, textAlign: 'right', alignSelf: 'flex-end' },
  input: { borderWidth: 1, borderColor: '#bbb', borderRadius: 7, padding: 8, fontSize: 15, marginBottom: 10, textAlign: 'right', backgroundColor: '#f9f9f9' },
  dateBtn: { borderWidth: 1, borderColor: '#ccc', borderRadius: 7, padding: 10, marginBottom: 10, alignItems: 'flex-end', minHeight: 48 },
  dateBtnText: { fontSize: 16, fontWeight: 'bold', color: '#3949ab', textAlign: 'right' },
  sliderValue: { fontSize: 14, color: '#333', textAlign: 'right', marginBottom: 4 },
  slider: { width: '100%', marginBottom: 6 },
  garageList: { maxHeight: 120, backgroundColor: '#fff', borderColor: '#bbb', borderWidth: 1, borderRadius: 7, marginBottom: 10 },
  garageItem: { padding: 10, borderBottomWidth: 0.5, borderColor: '#eee' },
  garageItemText: { fontSize: 15, color: '#222' },
  actions: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 10 },
  saveBtn: { backgroundColor: '#3949ab', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { backgroundColor: '#bbb', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20 },
  cancelBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  pickerBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 7,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  pickerValue: { fontSize: 15, color: '#222', textAlign: 'right' },
  pickerArrow: { fontSize: 20, color: '#aaa', marginLeft: 4 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  pickerHandle: {
    width: 40, height: 4, backgroundColor: '#ddd',
    borderRadius: 2, alignSelf: 'center', marginVertical: 12,
  },
  pickerTitle: {
    fontSize: 17, fontWeight: 'bold', color: '#1a237e',
    textAlign: 'center', marginBottom: 12,
  },
  pickerItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  pickerItemSelected: { backgroundColor: '#e8eaf6' },
  pickerItemText: { fontSize: 16, color: '#333', textAlign: 'right' },
  pickerItemTextSelected: { color: '#3949ab', fontWeight: 'bold' },
  pickerCheck: { fontSize: 16, color: '#3949ab', marginLeft: 8 },
});
