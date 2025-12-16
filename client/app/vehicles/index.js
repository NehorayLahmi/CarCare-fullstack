import React, { useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, Modal, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { jwtDecode } from "jwt-decode";


export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [kilometer, setKilometer] = useState('');
  const [searching, setSearching] = useState(false);

  const [hasRequests, setHasRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);


  const [userRole, setUserRole] = useState(null);


  const [isValidPlate, setIsValidPlate] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role); // צריך ששם השדה ב-token הוא "role"

      }
    }
    fetchUserRole();
  }, []);


  const router = useRouter();
  const url = process.env.EXPO_PUBLIC_API_URL

  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
      fetchPendingRequests();
    }, [])
  );


  useEffect(() => {
    const checkRequests = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const myId = await AsyncStorage.getItem('myId');
      //console.log('myId:', myId);

      try {
        //console.log('מבצע קריאה לשרת...');


        const response = await fetch(`http://${url}:4000/transfer?toId=${myId}&status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        //const data = await response.json();
        //console.log('קיבלתי מהשרת:', data);
        setHasRequests(data.length > 0);
      } catch (e) {
        setHasRequests(false);
      } finally {
        setLoading(false);
      }
    };
    checkRequests();
  }, []);


  const getToken = async () => {
    return await AsyncStorage.getItem('token');
  };

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`http://${url}:4000/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setVehicles(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (vehicleId) => {
    Alert.alert('אישור מחיקה', 'האם למחוק את הרכב?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const token = await getToken();
            const response = await fetch(`http://${url}:4000/vehicles/${vehicleId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(await response.text());
            await fetchVehicles();
          } catch (e) {
            Alert.alert('שגיאה', e.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // חיפוש ב-data.gov.il לפי מספר רישוי
  const searchPlate = async () => {
    if (!plate.trim()) {
      Alert.alert('שגיאה', 'אנא הזן מספר רישוי');
      setIsValidPlate(false);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&q=${plate.trim()}`
      );
      const data = await response.json();
      if (data.result.records && data.result.records.length > 0) {
        const record = data.result.records[0];
        setModel(record.kinuy_mishari || '');
        setYear(record.shnat_yitzur !== undefined && record.shnat_yitzur !== null ? String(record.shnat_yitzur) : '');
        setIsValidPlate(true);
      } else {
        Alert.alert('לא נמצא', 'לא נמצאו נתונים למספר רישוי זה');
        setIsValidPlate(false);
      }
    } catch (e) {
      Alert.alert('שגיאה', 'אירעה שגיאה בעת החיפוש');
      setIsValidPlate(false);
    } finally {
      setSearching(false);
    }
  };


  const addVehicle = async () => {
    if (!plate.trim() || !model.trim() || !year.trim()) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`http://${url}:4000/vehicles`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licensePlate: plate, model, year, kilometer }),
      });

      if (!response.ok) {
        //Alert.alert('שגיאה', 'לא ניתן להוסיף את הרכב. ייתכן ומספר הרישוי כבר קיים.');
        throw new Error(await response.text());
      }
      setPlate('');
      setModel('');
      setYear('');
      setKilometer('');
      setModalVisible(false);
      fetchVehicles();
    } catch (e) {
      Alert.alert('שגיאה', e.message);
      setLoading(false);
    }
  };

  // --- כאן הפתרון שלך ---
  const renderRightActions = (item) => (
    <View style={{ flexDirection: 'row' }}>
      {/* כפתור העברת בעלות */}
      <TouchableOpacity
        style={styles.transferButton}
        onPress={() => router.push(`/vehicles/transfer/${item.licensePlate}`)}
        activeOpacity={0.85}
      >
        <Text style={styles.transferButtonText}>העבר</Text>
      </TouchableOpacity>
      {/* כפתור מחיקה */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteVehicle(item._id)}
        activeOpacity={0.85}
      >
        <Text style={styles.deleteButtonText}>מחק</Text>
      </TouchableOpacity>
    </View>
  );

  const fetchPendingRequests = async () => {
    setLoadingRequests(true);
    const token = await AsyncStorage.getItem('token');
    const myId = await AsyncStorage.getItem('myId'); // תעודת זהות של המשתמש הנוכחי
    try {
      const response = await fetch(`http://${url}:4000/transfer?toId=${myId}&status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPendingRequests(data);
    } catch (e) {
      setPendingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };


  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity onPress={() => router.push(`/vehicles/${item.licensePlate}`)}>
        <View style={styles.vehicleRow}>
          <Text style={styles.plate}>{item.licensePlate}</Text>
          <Text style={styles.model}>{item.model} | {item.year}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      {/* פס התראה בראש הדף אם יש בקשות */}
      {!loadingRequests && pendingRequests.length > 0 && (
        <View style={{ backgroundColor: '#ffeb3b', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontWeight: 'bold', color: '#333' }}>
            יש לך {pendingRequests.length} בקשות להעברת רכב שממתינות לאישורך!
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#3949ab', padding: 8, borderRadius: 6, marginTop: 8 }}
            onPress={() => router.push('../vehicles/transfer/incoming')}
          >
            <Text style={{ color: '#fff' }}>מעבר לניהול בקשות</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>


      {userRole === 'admin' && (
        <TouchableOpacity
          style={styles.adminServicesBtn}
          onPress={() => router.push('../../all_services_list/servicesByAdmin')}
        >
          <Text style={styles.adminServicesBtnText}>ניהול טיפולים - הוסף טיפול חדש</Text>
        </TouchableOpacity>
      )}
      {userRole === 'admin' && (
        <TouchableOpacity
          style={styles.adminServicesBtn}
          onPress={() => router.push('../../all_services_list/listServicesType')}
        >
          <Text style={styles.adminServicesBtnText}>רשימת טיפולים מלאה</Text>
        </TouchableOpacity>
      )}



      <Text style={styles.title}>הרכבים שלך</Text>


      {loading && <ActivityIndicator size="large" color="#3949ab" />}
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && !error && (
        <FlatList
          data={vehicles}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>לא נמצאו רכבים</Text>}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}

      {/* Modal להוספת רכב */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>הוספת רכב חדש</Text>
            <View style={styles.plateRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="מספר רישוי"
                value={plate}
                onChangeText={setPlate}
                keyboardType="numeric"
                placeholderTextColor="rgba(0, 0, 0, 0.37)"
              />
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={searchPlate}
                disabled={searching}
              >
                <Text style={styles.searchBtnText}>
                  {searching ? 'מחפש...' : 'חפש'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="דגם"
              value={model}
              onChangeText={setModel}
              placeholderTextColor="rgba(0, 0, 0, 0.37)"
            />
            <TextInput
              style={styles.input}
              placeholder="שנה"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              placeholderTextColor="rgba(0, 0, 0, 0.37)"
            />
            <TextInput
              style={styles.input}
              placeholder="קילומטר לא חובה"
              value={kilometer}
              onChangeText={setKilometer}
              keyboardType="numeric"
              placeholderTextColor="rgba(0, 0, 0, 0.37)"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn, { opacity: isValidPlate ? 1 : 0.5 }]}
                onPress={addVehicle}
                disabled={!isValidPlate}
              >
                <Text style={styles.modalBtnText}>שמור</Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({


  adminServicesBtn: {
    backgroundColor: '#3949ab',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  adminServicesBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  container: {
    flex: 1,
    backgroundColor: '#f3f6fa',
    padding: 24,
    paddingTop: 48,
  },
  addButton: {
    position: 'absolute',
    top: 38,
    right: 28,
    zIndex: 10,
    backgroundColor: '#3949ab',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#3949ab',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 20,
    textAlign: 'center',
  },
  vehicleRow: {
    backgroundColor: '#e3eafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
    minHeight: 60, // שורה בגובה קבוע
    flexDirection: 'column',
    justifyContent: 'center',
  },
  plate: {
    fontSize: 22,
    color: '#3949ab',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  model: {
    fontSize: 16,
    color: '#333',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 16,
  },
  empty: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  deleteButton: {
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '86%', // תמיד בגובה השורה!
    borderRadius: 8,
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  transferButton: {
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '86%', // תמיד בגובה השורה!
    borderRadius: 8,
    marginBottom: 12,
  },
  transferButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(60,60,60,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    color: 'rgb(60, 60, 60)',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    width: 180,
    marginBottom: 12,
    textAlign: 'right',
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  searchBtn: {
    backgroundColor: '#00bcd4',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },
  modalBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 8,
  },
  saveBtn: {
    backgroundColor: '#3949ab',
  },
  cancelBtn: {
    backgroundColor: '#bbb',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
