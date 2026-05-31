import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView,
  TouchableOpacity, Alert, Modal, TextInput, FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker'; // ייבוא חדש זה
import { KeyboardAvoidingView, Platform } from 'react-native';
import api from '../../../lib/api';
// רשימות קבועות
const SERVICE_TYPES = [
  'החלפת שמן',
  'החלפת רפידות בלם',
  'החלפת צמיגים',
  'בדיקת בלמים',
  'טיפול תקופתי',
  'בדיקת מערכת חשמל',
  'החלפת פילטר',
  'טיפול אחר'
];
const PERIODIC_SERVICE_TYPES = [
  'טיפול תקופתי'
];
const COST_OPTIONS = [
  100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000
];



export default function VehicleServicesScreen() {
  const { id } = useLocalSearchParams(); // מספר רישוי הרכב
  const [services, setServices] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [openServiceType, setOpenServiceType] = useState(false);
  const [serviceTypeItems, setServiceTypeItems] = useState(SERVICE_TYPES.map(t => ({ label: t, value: t })));

  const [showDatePicker, setShowDatePicker] = useState(false); // קובע אם בורר התאריכים מוצג // ה-datePickerValue ישמור את התאריך כאובייקט Date עבור בורר התאריכים
  const [datePickerValue, setDatePickerValue] = useState(new Date());

  const [lastPeriodicService, setLastPeriodicService] = useState(null);
  const [nextPeriodicServiceDate, setNextPeriodicServiceDate] = useState('');

  const [lastKilometer, setLastKilometer] = useState(0);

  const [form, setForm] = useState({
    type: SERVICE_TYPES[0],
    customType: '',
    date: '',
    cost: COST_OPTIONS[0],
    note: '',
    garageName: '',
    kilometer: 0,
    _id: null
  });
  const [noteModal, setNoteModal] = useState({ visible: false, note: '' });

  // מוסכים
  const [garageResults, setGarageResults] = useState([]);
  const [garageLoading, setGarageLoading] = useState(false);

  const router = useRouter();


  const calculateNextPeriodicService = (allServices) => {
    const periodicServices = allServices.filter(service =>
      PERIODIC_SERVICE_TYPES.includes(service.type) && service.date && !isNaN(new Date(service.date))
    );

    if (periodicServices.length === 0) {
      setLastPeriodicService(null);
      setNextPeriodicServiceDate('אין נתונים זמינים');
      return;
    }

    periodicServices.sort((a, b) => new Date(b.date) - new Date(a.date));

    const lastService = periodicServices[0]; // הטיפול התקופתי האחרון
    setLastPeriodicService(lastService);

    const lastServiceDate = new Date(lastService.date);
    lastServiceDate.setMonth(lastServiceDate.getMonth() + 6); // מוסיף 6 חודשים לתאריך האחרון

    // מפרמט את התאריך לפורמט YYYY-MM-DD
    const nextDateFormatted = lastServiceDate.toISOString().split('T')[0];
    setNextPeriodicServiceDate(nextDateFormatted);
  };


  useEffect(() => {
    fetchServices();
    fetchVehicle();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/services/${id}`);
      setServices(data);

      // 🟡 חישוב הקילומטראז' האחרון (הגבוה ביותר)
      const maxKilometer = Math.max(...data.map(service => Number(service.kilometer) || 0));
      setLastKilometer(maxKilometer); // שמור אותו לסטייט (אל תשכח להגדיר useState!)

      // 🟢 חישוב הטיפול התקופתי הבא
      calculateNextPeriodicService(data);
    } catch (e) {
      setServices([]);
      setLastKilometer(0); // במידה ויש שגיאה – אפס גם את הקילומטר האחרון
      setLastPeriodicService(null);
      setNextPeriodicServiceDate('שגיאת טעינה / אין נתונים');
      Alert.alert('שגיאה', 'לא ניתן לטעון את היסטוריית הטיפולים');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicle = async () => {
    try {
      const { data } = await api.get(`/vehicles/${id}`);
      setVehicle(data);
    } catch (e) {
      setVehicle(null);
    }
  };



  useEffect(() => {
    async function init() {

      try {
        console.log('[init] מתחיל שליפת פרטי רכב עבור מזהה:', id);

        // קריאה ל-API לקבלת פרטי הרכב
        const carDetails = await fetchCarDetailsByLicensePlate(id);

        console.log('[init] התקבלו פרטי רכב מהשרת:', carDetails);

        setVehicle(carDetails);

        // קח את שם היצרן (מילה ראשונה)
        let tozeret = carDetails.tozeret_nm.split(" ")[0];
        console.log('[init] זוהה שם יצרן - tozeret_nm:', tozeret);

        // שליפת טיפולים עבור יצרן ודגם
        await fetchServicesByModel(tozeret, carDetails.degem_nm);
      } catch (error) {
        console.log('[init] שגיאה בשליפת פרטי רכב:', error);
        Alert.alert('שגיאה', error.message);
        setServiceTypeItems(SERVICE_TYPES.map(t => ({ label: t, value: t })));
      }
    }
    init();
  }, [id]);

  async function fetchCarDetailsByLicensePlate(licensePlate) {
    try {
      const apiUrl = `https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&q=${encodeURIComponent(licensePlate)}`;

      console.log('[fetchCarDetailsByLicensePlate] שולח בקשה לכתובת:', apiUrl);

      const response = await fetch(apiUrl);

      console.log('[fetchCarDetailsByLicensePlate] סטטוס תגובה:', response.status);

      if (!response.ok) {
        throw new Error(`שגיאת רשת: ${response.status}`);
      }

      const json = await response.json();

      console.log('[fetchCarDetailsByLicensePlate] התקבלה תשובת JSON:', json);

      if (json.result && json.result.records && json.result.records.length > 0) {
        console.log('[fetchCarDetailsByLicensePlate] פרטי רכב שנמצאו:', json.result.records[0]);
        return json.result.records[0];
      } else {
        console.log('[fetchCarDetailsByLicensePlate] לא נמצאו פרטי רכב!');
        throw new Error('לא נמצאו פרטי רכב למספר זה');
      }
    } catch (error) {
      console.error('[fetchCarDetailsByLicensePlate] שגיאה:', error.message);
      throw error;
    }
  }

  async function fetchServicesByModel(tozeret, degem) {
    try {
      const { data: services1 } = await api.get(`/modelService/${encodeURIComponent(tozeret)}/${encodeURIComponent(degem)}`);
      console.log('[fetchServicesByModel] התקבלו טיפולים:', services1, '| פרמטרים:', tozeret, degem);

      if (services1.length > 0) {
        const items = services1.map(s => ({
          label: s.serviceType,
          value: s.serviceType
        }));
        items.push({ label: 'טיפול אחר', value: 'טיפול אחר' });
        console.log('[fetchServicesByModel] רשימת טיפולים לתצוגה:', items);
        setServiceTypeItems(items);
      } else {
        console.log('[fetchServicesByModel] לא נמצאו טיפולים. מציג רשימה דיפולטיבית.');
        setServiceTypeItems(SERVICE_TYPES.map(t => ({ label: t, value: t })));
      }
    } catch (error) {
      console.error('[fetchServicesByModel] שגיאה:', error);
      setServiceTypeItems(SERVICE_TYPES.map(t => ({ label: t, value: t })));
    }
  }



  /////////////////////////////////////////////////////////////////////////////
  // חיפוש מוסכים ב-data.gov.il
  const searchGarages = async (query) => {
    if (!query || query.length < 2) {
      setGarageResults([]);
      return;
    }
    setGarageLoading(true);
    try {
      const res = await fetch(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=bb68386a-a331-4bbc-b668-bba2766d517d&q=${encodeURIComponent(query)}&limit=20`
      );
      const data = await res.json();
      if (data.result && data.result.records) {
        const garages = data.result.records
          .map(rec =>
            rec.shem_mosah
              ? `${rec.shem_mosah} (${rec.yishuv}${rec.ktovet ? ', ' + rec.ktovet : ''})`
              : ''
          )
          .filter(Boolean);
        setGarageResults(garages);
      } else {
        setGarageResults([]);
      }
    } catch (e) {
      setGarageResults([]);
    } finally {
      setGarageLoading(false);
    }
  };



  // פורמט תאריך
  const isValidDate = (dateStr) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && dateStr === date.toISOString().split('T')[0];
  };

  // הוספת/עדכון טיפול
  const handleSaveService = async () => {
    const { type, customType, date, cost, note, garageName, kilometer, _id } = form;
    const finalType = type === 'טיפול אחר' ? customType.trim() : type;

    // ולידציה של שדות חובה
    if (!finalType || !date || !cost || !garageName || !kilometer) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות החובה');
      return;
    }
    if (Number(kilometer) < lastKilometer) {
      Alert.alert(
        'שגיאה',
        `הקילומטראז' שהוזן (${kilometer}) נמוך מהקילומטראז' האחרון (${lastKilometer})`
      );
      return;
    }

    // ולידציה של תאריך
    if (!isValidDate(form.date)) {
      Alert.alert('שגיאה', 'אנא הזן תאריך תקין בפורמט YYYY-MM-DD');
      return;
    }

    try {
      const requestBody = {
        type: finalType,
        date,
        cost: Number(cost),
        note,
        garageName,
        kilometer: Number(kilometer),
      };

      if (editMode && _id) {
        await api.put(`/services/${_id}`, requestBody);
        Alert.alert('הצלחה', `הטיפול עודכן בהצלחה!`);
      } else {
        await api.post(`/services`, { ...requestBody, vehicleId: id });
        Alert.alert('הצלחה', `הטיפול נשמר בהצלחה!`);
      }

      setModalVisible(false);
      resetForm();
      await fetchServices();

    } catch (e) {
      Alert.alert('שגיאה', `לא ניתן לשמור טיפול: ${e.response?.data?.message || e.message || 'נסה שוב מאוחר יותר'}`);
    }
  };

  const deleteService = async (serviceId) => {
    try {
      await api.delete(`/services/${serviceId}`);
      await fetchServices();
      Alert.alert('הצלחה', 'הטיפול נמחק בהצלחה!');
    } catch (e) {
      Alert.alert('שגיאה', `לא ניתן למחוק טיפול: ${e.response?.data?.message || e.message || 'נסה שוב מאוחר יותר'}`);
    }
  };

  // פתיחת מודל לעריכה
  const openEditModal = (service) => {
    const typeInList = SERVICE_TYPES.includes(service.type);

    // ודא שהתאריך הוא תקין לפני יצירת אובייקט Date
    let initialDate = new Date(); // ברירת מחדל לתאריך הנוכחי
    if (service.date && !isNaN(new Date(service.date))) {
      initialDate = new Date(service.date);
    }

    setForm({
      type: typeInList ? service.type : 'טיפול אחר',
      customType: typeInList ? '' : service.type,
      date: service.date, // שומר את התאריך כמחרוזת YYYY-MM-DD
      cost: service.cost,
      note: service.note || '',
      garageName: service.garageName || '',
      // ודא שקילומטר הוא מחרוזת עבור ה-TextInput
      kilometer: service.kilometer ? String(service.kilometer) : '',
      _id: service._id
    });

    // עדכן את הסטייט של בורר התאריכים עם אובייקט Date
    setDatePickerValue(initialDate);

    setEditMode(true);
    setModalVisible(true);
  };

  // פתיחת מודל להוספה
  const openAddModal = () => {
    resetForm();
    setEditMode(false);
    setModalVisible(true);
  };

  const resetForm = () => {
    setForm({
      type: SERVICE_TYPES[0], // ברירת מחדל לסוג הטיפול הראשון
      customType: '',
      date: '', // מאפס את שדה התאריך בטופס למחרוזת ריקה
      cost: 0, // מאפס את העלות ל-0, מתאים לטווח הסליידר החדש
      note: '',
      garageName: '',
      kilometer: '', // מאפס את הקילומטראז' למחרוזת ריקה עבור TextInput
      _id: null
    });
    // מאפס את בורר התאריכים לתאריך הנוכחי
    setDatePickerValue(new Date());
    // מאפס את תוצאות חיפוש המוסכים
    setGarageResults([]);
  };



  // הצגת הערה בלחיצה
  const handleShowNote = (note) => {
    setNoteModal({ visible: true, note });
  };

  return (

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>היסטוריית טיפולים לרכב {id}</Text>

        {/* הוספת תיבת המידע של הטיפול התקופתי */}
        <View style={styles.periodicInfoBox}>
          <Text style={styles.periodicInfoTitle}>הטיפול התקופתי האחרון:</Text>
          <Text style={styles.periodicInfoText}>
            {lastPeriodicService ?
              `${lastPeriodicService.type} ב-${lastPeriodicService.date} (קילומטראז': ${lastPeriodicService.kilometer})`
              : 'אין נתונים על טיפול תקופתי קודם.'
            }
          </Text>
          <Text style={styles.periodicInfoTitle}>הטיפול התקופתי הבא מומלץ בתאריך:</Text>
          <Text style={styles.periodicInfoDate}>
            {nextPeriodicServiceDate}
          </Text>
        </View>

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
              <TouchableOpacity
                key={service._id || idx}
                style={styles.serviceRow}
                activeOpacity={0.8}
                onPress={() => service.note ? handleShowNote(service.note) : null}
              >
                <Text style={styles.serviceType}>סוג טיפול: {service.type}</Text>
                <Text style={styles.serviceDate}>תאריך: {service.date}</Text>
                <Text style={styles.serviceCost}>עלות: {service.cost} ₪</Text>
                <Text style={styles.garageName}>מוסך: {service.garageName}</Text>
                <Text style={styles.kilometer}>קילומטר בעת הטיפול: {service.kilometer}</Text>
                <View style={styles.actionsRow}>

                  {/* מחיקת ועריכת טיפול*/}

                  {/*<TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(service)}>
                  <Text style={styles.editBtnText}>ערוך</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteService(service._id)}>
                  <Text style={styles.deleteBtnText}>מחק</Text>
                </TouchableOpacity> */}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* מודל הוספה/עריכה */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{editMode ? 'עריכת טיפול' : 'הוספת טיפול'}</Text>
                <Text style={styles.label}>סוג טיפול</Text>

                <DropDownPicker
                  open={openServiceType}
                  value={form.type} // הערך הנבחר
                  items={serviceTypeItems} // רשימת הפריטים
                  setOpen={setOpenServiceType}
                  setValue={(callback) => setForm(f => ({ ...f, type: callback() }))} // עדכון הערך הנבחר
                  setItems={setServiceTypeItems}
                  style={styles.input} // אתה יכול להשתמש בעיצוב ה-input הקיים שלך
                  placeholder="בחר סוג טיפול"
                  listMode="MODAL" // חשוב - במיוחד לאייפון כדי שייפתח כמודאל
                  // ועוד פרופסים לעיצוב והתנהגות
                  // כדי שהערך הנבחר יוצג מימין (עברית):
                  textStyle={{ textAlign: 'right' }}
                  labelStyle={{ textAlign: 'right' }}
                  arrowIconStyle={{ // אולי תרצה שהחץ יהיה משמאל
                    marginLeft: 5,
                    transform: [{ rotateY: '180deg' }] // היפוך החץ ימינה
                  }}
                // listItemLabelStyle={{ textAlign: 'right' }}
                // selectedItemLabelStyle={{ fontWeight: 'bold' }}
                // containerStyle={{ height: 40 }} // הגדרת גובה קבוע
                />
                {form.type === 'טיפול אחר' && (
                  <TextInput
                    style={styles.input}
                    placeholder="הזן סוג טיפול"
                    value={form.customType}
                    onChangeText={customType => setForm(f => ({ ...f, customType }))}
                  />
                )}

                <Text style={styles.label}>תאריך</Text>
                <TouchableOpacity
                  style={styles.dateInputButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateInputText}>
                    {form.date ? form.date : new Date().toISOString().split('T')[0]}
                  </Text>

                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={datePickerValue} // הערך הנוכחי של בורר התאריכים (אובייקט Date)
                    mode="date" // מצב "תאריך"
                    // שינוי קריטי: עבור iOS, השתמש ב-'compact' כדי לקבל כפתור "Done"
                    display={Platform.OS === 'ios' ? 'compact' : 'default'}
                    onChange={(event, selectedDate) => {
                      // ב-iOS במצב 'compact', האירוע 'set' נזרק רק בלחיצה על 'Done'.
                      // באנדרואיד, 'set' נזרק בבחירה, ו-'dismissed' בביטול.
                      if (event.type === 'set' && selectedDate) { // אם המשתמש בחר תאריך (ולא ביטל)
                        setDatePickerValue(selectedDate); // עדכן את ערך בורר התאריכים (אובייקט Date)
                        // המר את אובייקט ה-Date לפורמט YYYY-MM-DD ושמור ב-form.date
                        const formattedDate = selectedDate.toISOString().split('T')[0];
                        setForm(f => ({ ...f, date: formattedDate }));
                      }
                      // סגור את בורר התאריכים בכל מקרה (לאחר בחירה או ביטול)
                      setShowDatePicker(false);
                    }}
                  />
                )}



                <Text style={styles.label}>עלות</Text>
                {/* הצגת הערך הנוכחי של הסליידר */}
                <Text style={styles.sliderValueText}>{form.cost} ₪</Text>
                <Slider
                  style={styles.slider} // נגדיר סגנון חדש עבור הסליידר
                  minimumValue={0} // הערך המינימלי
                  maximumValue={100000} // הערך המקסימלי
                  step={100} // קפיצות של 20
                  value={form.cost}
                  onValueChange={(value) => {
                    // אין צורך ב"snapping" מורכב מכיוון שה-step כבר מטפל בזה
                    setForm(f => ({ ...f, cost: value }));
                  }}
                  minimumTrackTintColor="#3949ab" // צבע הקו שעבר
                  maximumTrackTintColor="#a0a0a0" // צבע הקו שלא עבר
                  thumbTintColor="#3949ab" // צבע הגלגלת
                />
                <TextInput
                  style={styles.input}
                  value={form.cost.toString()}
                  onChangeText={(text) => {
                    let numericValue = parseInt(text);
                    if (isNaN(numericValue)) numericValue = 0;
                    if (numericValue > 100000) numericValue = 100000;
                    setForm(f => ({ ...f, cost: numericValue }));
                  }}
                  keyboardType="numeric"
                  placeholder="הכנס עלות בש״ח"
                />
                <Text style={styles.label}>מוסך בו טופל הרכב</Text>
                <TextInput
                  style={styles.input}
                  placeholder="חפש מוסך"
                  value={form.garageName}
                  onChangeText={q => {
                    setForm(f => ({ ...f, garageName: q }));
                    searchGarages(q);
                  }}
                />
                {garageLoading && <ActivityIndicator size="small" color="#3949ab" />}
                {garageResults.length > 0 && (
                  <FlatList
                    data={garageResults}
                    keyExtractor={(item, idx) => item + idx}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.garageItem}
                        onPress={() => {
                          setForm(f => ({ ...f, garageName: item }));
                          setGarageResults([]);
                        }}
                      >
                        <Text style={styles.garageItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    style={styles.garageList}
                  />
                )}
                <Text style={styles.label}>קילומטר בעת הטיפול</Text>
                <TextInput
                  style={styles.input}
                  placeholder="קילומטר בעת הטיפול"
                  value={form.kilometer}
                  onChangeText={kilometer => setForm(f => ({ ...f, kilometer }))}
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
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveService}>
                    <Text style={styles.saveBtnText}>שמור</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelBtnText}>ביטול</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* מודל הערה */}
        <Modal
          visible={noteModal.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setNoteModal({ visible: false, note: '' })}
        >
          <View style={styles.noteOverlay}>
            <View style={styles.noteModal}>
              <Text style={styles.noteTitle}>הערה לטיפול</Text>
              <Text style={styles.noteText}>{noteModal.note}</Text>
              <TouchableOpacity
                style={styles.closeNoteBtn}
                onPress={() => setNoteModal({ visible: false, note: '' })}
              >
                <Text style={styles.closeNoteBtnText}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>חזרה לפרטי הרכב</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f3f6fa',
    minHeight: '100%',
  },
  date: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  // **הוסף את הסגנונות האלה:**
  screenTitle: { // סגנון עבר שינוי קטן בשם, וודא שהוא מתאים ל-Text ב-JSX
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20, // הגדלנו קצת רווח תחתון
    textAlign: 'center',
    color: '#3949ab',
  },
  periodicInfoBox: {
    backgroundColor: '#e3f2fd', // רקע כחול בהיר
    padding: 15,
    borderRadius: 10,
    marginBottom: 20, // רווח תחתון לפני הכפתור הבא
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3', // קו כחול עדין בצד שמאל
    alignItems: 'flex-end', // יישור כל הטקסט בתיבה לימין (עברית)
    width: '100%', // תופס את כל הרוחב
    elevation: 2, // צל קל לאפקט עומק
  },
  periodicInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'right',
  },
  periodicInfoText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 10,
    textAlign: 'right',
  },
  periodicInfoDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e', // כחול כהה יותר לתאריך
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 24,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 18,
    alignSelf: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  servicesBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 24,
    elevation: 1,
  },
  serviceRow: {
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    paddingBottom: 8,
    alignItems: 'flex-end',
  },
  serviceType: {
    fontWeight: 'bold',
    color: '#1a237e',
    fontSize: 16,
    marginBottom: 2,

  },
  serviceDate: {
    color: '#3949ab',
    fontSize: 15,
    marginBottom: 2,
  },
  serviceCost: {
    color: '#333',
    fontSize: 15,
    marginBottom: 2,
  },
  garageName: {
    color: '#3949ab',
    fontSize: 15,
    marginBottom: 2,
    textAlign: 'right'   //----------------------
  },
  kilometer: {
    color: '#333',
    fontSize: 15,
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    marginTop: 4,
  },
  editBtn: {
    marginLeft: 12,
  },
  editBtnText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteBtn: {
    marginLeft: 0,
  },
  deleteBtnText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  empty: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 3,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 7,
    padding: 8,
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'right',
    backgroundColor: '#f9f9f9',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 7,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 44,
    textAlign: 'right',
  },
  garageList: {
    maxHeight: 120,
    backgroundColor: '#fff',
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 7,
    marginBottom: 10,
  },
  garageItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  garageItemText: {
    fontSize: 15,
    color: '#222',
  },
  modalActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#bbb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Note Modal
  noteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 12,
  },
  noteText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 18,
    textAlign: 'right',
  },
  closeNoteBtn: {
    backgroundColor: '#3949ab',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeNoteBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },


  dateInputButton: {
    borderWidth: 1,
    borderColor: '#ccc', // קצת יותר כהה כדי שיראו את המסגרת
    borderRadius: 7,
    padding: 10, // קצת יותר ריווח פנימי
    marginBottom: 10,
    backgroundColor: '#ffffff', // רקע לבן מובהק (אפשר גם להשאיר ריק אם הרקע הכללי לבן)
    // אם הרקע הכללי של המודאל הוא כבר לבן, אפשר להסיר את backgroundColor לגמרי
    alignItems: 'flex-end', // ליישר את הטקסט לימין
    justifyContent: 'center', // למרכז אנכית
    minHeight: 48, // גובה מעט יותר גדול לנוחות לחיצה
  },
  dateInputText: {
    fontSize: 16, // גודל פונט קצת יותר גדול
    fontWeight: 'bold', // להדגיש את הטקסט
    color: '#3949ab', // צבע כחול שמתאים לשאר העיצוב שלך
    textAlign: 'right', // לוודא שהטקסט בתוך הכפתור מיושר לימין
  },

});
