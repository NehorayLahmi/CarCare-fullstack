import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import api from '../../lib/api';
import { showAlert } from '../../lib/alert';

export default function ManufacturerTreatments({ manufacturer, onBack }) {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const [editModal, setEditModal] = useState({ visible: false, item: null });
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchTreatments() {
      try {
        const { data } = await api.get('/modelService', { params: { tozeret_nm: manufacturer } });
        setTreatments(data);
      } catch (error) {
        showAlert('שגיאה', error.response?.data?.message || error.message || 'אירעה שגיאה');
      } finally {
        setLoading(false);
      }
    }
    fetchTreatments();
  }, [manufacturer]);

  async function deleteTreatment(item) {
    try {
      const { data: json } = await api.delete(
        `/modelService/${encodeURIComponent(item.tozeret_nm)}/${encodeURIComponent(item.degem_nm)}`
      );
      showAlert('הצלחה', json.message);
      setTreatments(prev =>
        prev.filter(t => !(t.tozeret_nm === item.tozeret_nm && t.degem_nm === item.degem_nm && t._id === item._id))
      );
      setExpandedIndex(null);
    } catch (error) {
      showAlert('שגיאה', error.response?.data?.message || error.message);
    }
  }

  function openEdit(item) {
    setEditForm({
      serviceType: item.serviceType || '',
      serviceIntervalKm: item.serviceIntervalKm != null ? String(item.serviceIntervalKm) : '',
      serviceIntervalMonths: item.serviceIntervalMonths != null ? String(item.serviceIntervalMonths) : '',
      notes: item.notes || '',
      averageCost: item.averageCost != null ? String(item.averageCost) : '',
      garageName: item.garageName || '',
    });
    setEditModal({ visible: true, item });
  }

  async function handleSaveEdit() {
    const { item } = editModal;
    if (!editForm.serviceType.trim()) {
      showAlert('שגיאה', 'סוג הטיפול הוא שדה חובה');
      return;
    }
    setSaving(true);
    try {
      const body = {
        serviceType: editForm.serviceType.trim(),
        serviceIntervalKm: editForm.serviceIntervalKm ? Number(editForm.serviceIntervalKm) : undefined,
        serviceIntervalMonths: editForm.serviceIntervalMonths ? Number(editForm.serviceIntervalMonths) : undefined,
        notes: editForm.notes.trim(),
        averageCost: editForm.averageCost ? Number(editForm.averageCost) : undefined,
        garageName: editForm.garageName.trim(),
      };
      const { data } = await api.put(`/modelService/item/${item._id}`, body);
      setTreatments(prev => prev.map(t => t._id === item._id ? { ...t, ...data } : t));
      setEditModal({ visible: false, item: null });
      showAlert('הצלחה', 'הטיפול עודכן בהצלחה');
    } catch (e) {
      showAlert('שגיאה', e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  }

  const renderItem = ({ item, index }) => {
    const isExpanded = expandedIndex === index;
    return (
      <TouchableOpacity
        style={styles.rowFront}
        onPress={() => setExpandedIndex(isExpanded ? null : index)}
        activeOpacity={0.8}
      >
        <View style={styles.headerExpanded}>
          <Text style={styles.treatmentTitle}>יצרן: {item.tozeret_nm}</Text>
          <Text style={[styles.treatmentTitle, { marginRight: 12 }]}>דגם: {item.degem_nm}</Text>
        </View>

        {isExpanded && (
          <View style={styles.details}>
            <Text style={styles.detailText}>סוג טיפול: {item.serviceType}</Text>
            <Text style={styles.detailText}>מרחק בק"מ לטיפול: {item.serviceIntervalKm ?? '-'}</Text>
            <Text style={styles.detailText}>חודשים לטיפול: {item.serviceIntervalMonths ?? '-'}</Text>
            <Text style={styles.detailText}>הערות: {item.notes || '-'}</Text>
            <Text style={styles.detailText}>עלות ממוצעת: {item.averageCost ? `₪${item.averageCost}` : '-'}</Text>
            <Text style={styles.detailText}>מוסך מומלץ: {item.garageName || '-'}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          if (rowMap[data.item._id || data.index]) rowMap[data.item._id || data.index].closeRow();
          openEdit(data.item);
        }}
      >
        <Text style={styles.editButtonText}>ערוך</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          showAlert(
            'אישור מחיקה',
            `האם למחוק טיפול לדגם ${data.item.degem_nm}?`,
            [
              { text: 'ביטול', style: 'cancel' },
              {
                text: 'מחק',
                style: 'destructive',
                onPress: () => {
                  deleteTreatment(data.item);
                  if (rowMap[data.item._id || data.index]) rowMap[data.item._id || data.index].closeRow();
                },
              },
            ],
          )
        }
      >
        <Text style={styles.deleteButtonText}>מחק</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#4a90e2" style={{ flex: 1, marginTop: 40 }} />;
  }

  if (treatments.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>לא נמצאו טיפולים.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>טיפולים ליצרן {manufacturer}</Text>

      <SwipeListView
        data={treatments}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-130}
        previewRowKey={'0'}
        previewOpenValue={-40}
        previewOpenDelay={1500}
        disableRightSwipe
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      {/* מודאל עריכה */}
      <Modal
        visible={editModal.visible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModal({ visible: false, item: null })}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitle}>עריכת טיפול</Text>

                <Text style={styles.modalLabel}>סוג טיפול</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.serviceType}
                  onChangeText={v => setEditForm(f => ({ ...f, serviceType: v }))}
                  placeholder="סוג טיפול"
                  placeholderTextColor="#aaa"
                  textAlign="right"
                />

                <Text style={styles.modalLabel}>מרחק בק"מ לטיפול</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.serviceIntervalKm}
                  onChangeText={v => setEditForm(f => ({ ...f, serviceIntervalKm: v }))}
                  keyboardType="numeric"
                  placeholder='ק"מ'
                  placeholderTextColor="#aaa"
                  textAlign="right"
                />

                <Text style={styles.modalLabel}>חודשים לטיפול</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.serviceIntervalMonths}
                  onChangeText={v => setEditForm(f => ({ ...f, serviceIntervalMonths: v }))}
                  keyboardType="numeric"
                  placeholder="חודשים"
                  placeholderTextColor="#aaa"
                  textAlign="right"
                />

                <Text style={styles.modalLabel}>עלות ממוצעת (₪)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.averageCost}
                  onChangeText={v => setEditForm(f => ({ ...f, averageCost: v }))}
                  keyboardType="numeric"
                  placeholder="עלות"
                  placeholderTextColor="#aaa"
                  textAlign="right"
                />

                <Text style={styles.modalLabel}>מוסך מומלץ</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.garageName}
                  onChangeText={v => setEditForm(f => ({ ...f, garageName: v }))}
                  placeholder="שם מוסך"
                  placeholderTextColor="#aaa"
                  textAlign="right"
                />

                <Text style={styles.modalLabel}>הערות</Text>
                <TextInput
                  style={[styles.modalInput, { height: 70 }]}
                  value={editForm.notes}
                  onChangeText={v => setEditForm(f => ({ ...f, notes: v }))}
                  placeholder="הערות"
                  placeholderTextColor="#aaa"
                  multiline
                  textAlign="right"
                />

                <View style={styles.modalBtns}>
                  <TouchableOpacity
                    style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                    onPress={handleSaveEdit}
                    disabled={saving}
                  >
                    {saving
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={styles.saveBtnText}>שמור</Text>
                    }
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setEditModal({ visible: false, item: null })}
                    disabled={saving}
                  >
                    <Text style={styles.cancelBtnText}>ביטול</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: '#1a237e',
  },
  headerExpanded: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    marginBottom: 6,
  },
  treatmentTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: '#1a237e',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 6,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
    color: '#333',
  },
  rowFront: {
    backgroundColor: '#f3f9fa',
    borderColor: '#80cbc4',
    borderWidth: 1,
    borderRadius: 7,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'column',
    alignItems: 'flex-end',
    minHeight: 70,
  },
  rowBack: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 7,
    marginBottom: 14,
    height: 70,
    backgroundColor: 'transparent',
  },
  editButton: {
    width: 70,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3949ab',
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
    marginRight: 2,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
    writingDirection: 'rtl',
  },
  // מודאל עריכה
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 8 },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3949ab',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    textAlign: 'right',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 11,
    fontSize: 15,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    color: '#222',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#3949ab', fontWeight: '600', fontSize: 15 },
});
