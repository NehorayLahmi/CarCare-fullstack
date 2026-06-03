import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../lib/api';
import { scheduleServiceReminder } from '../../../lib/notifications';
import { SERVICE_TYPES, PERIODIC_SERVICE_TYPES, INITIAL_FORM } from '../../../lib/serviceConstants';
import PeriodicInfoBox from './components/PeriodicInfoBox';
import ServiceCard from './components/ServiceCard';
import ServiceFormModal from './components/ServiceFormModal';
import NoteModal from './components/NoteModal';

export default function VehicleServicesScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastPeriodicService, setLastPeriodicService] = useState(null);
  const [nextPeriodicServiceDate, setNextPeriodicServiceDate] = useState('');
  const [lastKilometer, setLastKilometer] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState(INITIAL_FORM);
  const [serviceTypeItems, setServiceTypeItems] = useState(
    SERVICE_TYPES.map(t => ({ label: t, value: t }))
  );

  const [noteModal, setNoteModal] = useState({ visible: false, note: '' });

  const calculateNextPeriodicService = (allServices) => {
    const periodic = allServices.filter(
      s => PERIODIC_SERVICE_TYPES.includes(s.type) && s.date && !isNaN(new Date(s.date))
    );
    if (periodic.length === 0) {
      setLastPeriodicService(null);
      setNextPeriodicServiceDate('אין נתונים זמינים');
      return;
    }
    periodic.sort((a, b) => new Date(b.date) - new Date(a.date));
    setLastPeriodicService(periodic[0]);
    const next = new Date(periodic[0].date);
    next.setMonth(next.getMonth() + 6);
    const nextDateStr = next.toISOString().split('T')[0];
    setNextPeriodicServiceDate(nextDateStr);
    scheduleServiceReminder(id, nextDateStr);
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/services/${id}`);
      setServices(data);
      setLastKilometer(Math.max(...data.map(s => Number(s.kilometer) || 0)));
      calculateNextPeriodicService(data);
    } catch {
      setServices([]);
      setLastKilometer(0);
      setLastPeriodicService(null);
      setNextPeriodicServiceDate('שגיאת טעינה / אין נתונים');
      Alert.alert('שגיאה', 'לא ניתן לטעון את היסטוריית הטיפולים');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  useEffect(() => {
    async function loadModelServices() {
      try {
        const res = await fetch(
          `https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&q=${encodeURIComponent(id)}`
        );
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (!json.result?.records?.length) throw new Error();
        const car = json.result.records[0];
        const tozeret = car.tozeret_nm.split(' ')[0];
        const { data } = await api.get(
          `/modelService/${encodeURIComponent(tozeret)}/${encodeURIComponent(car.degem_nm)}`
        );
        if (data.length > 0) {
          const items = data.map(s => ({ label: s.serviceType, value: s.serviceType }));
          items.push({ label: 'טיפול אחר', value: 'טיפול אחר' });
          setServiceTypeItems(items);
        }
      } catch {
        setServiceTypeItems(SERVICE_TYPES.map(t => ({ label: t, value: t })));
      }
    }
    loadModelServices();
  }, [id]);

  const openAddModal = () => {
    setInitialFormValues({ ...INITIAL_FORM });
    setEditMode(false);
    setModalVisible(true);
  };

  const openEditModal = (service) => {
    setInitialFormValues({
      type: SERVICE_TYPES.includes(service.type) ? service.type : 'טיפול אחר',
      customType: SERVICE_TYPES.includes(service.type) ? '' : service.type,
      date: service.date,
      cost: service.cost,
      note: service.note || '',
      garageName: service.garageName || '',
      kilometer: service.kilometer ? String(service.kilometer) : '',
      _id: service._id,
    });
    setEditMode(true);
    setModalVisible(true);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>היסטוריית טיפולים לרכב {id}</Text>

        <PeriodicInfoBox
          lastPeriodicService={lastPeriodicService}
          nextPeriodicServiceDate={nextPeriodicServiceDate}
        />

        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>הוסף טיפול חדש</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#3949ab" />
        ) : services.length === 0 ? (
          <Text style={styles.empty}>לא נמצאו טיפולים לרכב זה</Text>
        ) : (
          <View style={styles.servicesBox}>
            {services.map((service, idx) => (
              <ServiceCard
                key={service._id || idx}
                service={service}
                onPress={() => service.note ? setNoteModal({ visible: true, note: service.note }) : null}
              />
            ))}
          </View>
        )}

        <ServiceFormModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          editMode={editMode}
          initialValues={initialFormValues}
          serviceTypeItems={serviceTypeItems}
          setServiceTypeItems={setServiceTypeItems}
          lastKilometer={lastKilometer}
          vehicleId={id}
          onSaved={fetchServices}
        />

        <NoteModal
          visible={noteModal.visible}
          note={noteModal.note}
          onClose={() => setNoteModal({ visible: false, note: '' })}
        />

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>חזרה לפרטי הרכב</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center', backgroundColor: '#f3f6fa', minHeight: '100%' },
  screenTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#3949ab' },
  addBtn: { backgroundColor: '#3949ab', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, marginBottom: 18, alignSelf: 'center' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  servicesBox: { backgroundColor: '#fff', borderRadius: 12, padding: 14, width: '100%', marginBottom: 24, elevation: 1 },
  empty: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 12 },
  backBtn: { marginTop: 16, backgroundColor: '#3949ab', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
