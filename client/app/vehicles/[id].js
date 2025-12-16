import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// מיפוי שמות שדות לאנגלית -> עברית (אפשר להוסיף/להחסיר לפי הצורך)
const fieldLabels = {
  mispar_rechev: 'מספר רכב',
  baalut: 'בעלות',
  degem_cd: 'קוד דגם',
  degem_manoa: 'קוד מנוע',
  degem_nm: 'דגם יצרן',
  kinuy_mishari: 'כינוי מסחרי',
  kvutzat_zihum: 'קבוצת זיהום',
  misgeret: 'מספר שלדה',
  mispar_rechevchan_acharon_dt: 'מועד טסט אחרון',
  moed_aliya_lakvish: 'עליה לכביש',
  ramat_eivzur_betihuty: 'רמת אבזור בטיחותי',
  ramat_gank: 'רמת גנ"ק',
  shnat_yitzur: 'שנת ייצור',
  sug_degem: 'סוג דגם',
  sug_delek_nm: 'סוג דלק',
  tokef_dt: 'תוקף רישיון',
  tozeret_nm: 'יצרן',
  tzeva_cd: 'קוד צבע',
  tzeva_rechev: 'צבע רכב',
  zmig_ahori: 'צמיג אחורי',
  zmig_kidmi: 'צמיג קדמי',
  mispar_manoa: 'מספר מנוע',
  mispar_shilda: 'מספר שלדה',
  horaat_rishum: 'הוראת רישום',
  mispar_rishayon_rechev: 'מספר רישיון רכב',
  mispar_rishayon_nahega: 'מספר רישיון נהיגה',
  sug_rechev: 'סוג רכב',
  mishkal_kolel: 'משקל כולל',
  mishkal_rashui: 'משקל רשוי',
  mispar_krav: 'מספר כרב',
  mispar_moshavim: 'מספר מושבים',
  mispar_dlatot: 'מספר דלתות',
  mispar_baalim_kodmim: 'מספר בעלים קודמים',
  // הוסף כאן עוד שדות לפי הצורך
};

// סדר הצגת השדות
const fieldsOrder = [
  'mispar_rechev',
  'baalut',
  'tozeret_nm',
  'degem_nm',
  'kinuy_mishari',
  'shnat_yitzur',
  'moed_aliya_lakvish',
  'tokef_dt',
  'mispar_rechevchan_acharon_dt',
  'sug_delek_nm',
  'degem_cd',
  'degem_manoa',
  'mispar_manoa',
  'misgeret',
  'kvutzat_zihum',
  'ramat_gank',
  'ramat_eivzur_betihuty',
  'tzeva_rechev',
  'tzeva_cd',
  'zmig_kidmi',
  'zmig_ahori',
  'sug_degem',
  'sug_rechev',
  'mishkal_kolel',
  'mishkal_rashui',
  'mispar_krav',
  'mispar_moshavim',
  'mispar_dlatot',
  'mispar_baalim_kodmim',
  'horaat_rishum',
  'mispar_rishayon_rechev',
  'mispar_rishayon_nahega',
  // הוסף כאן עוד שדות אם תרצה להציג
];

export default function VehicleDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&q=${id}`
      );
      const data = await response.json();
      console.log('Vehicle data:', data.result.records[0].degem_nm);
      if (data.result && data.result.records && data.result.records.length > 0) {
        setVehicle(data.result.records[0]);
      } else {
        setVehicle(null);
      }
    } catch (e) {
      Alert.alert('שגיאה', 'לא ניתן לטעון את פרטי הרכב');
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3949ab" />
      </View>
    );

  if (!vehicle)
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>לא נמצאו נתונים לרכב</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>פרטי רכב</Text>
      <TouchableOpacity
        style={styles.servicesBtn}
        onPress={() => router.push(`/vehicles/${id}/services`)}
      >
        <Text style={styles.servicesBtnText}>מעבר להיסטוריית טיפולים</Text>
      </TouchableOpacity>
      <View style={styles.detailsBox}>
        {fieldsOrder.map((key) =>
          vehicle[key] !== undefined && vehicle[key] !== null && vehicle[key] !== '' ? (
            <View key={key} style={styles.row}>
              <Text style={styles.key}>{fieldLabels[key] || key}:</Text>
              <Text style={styles.value}>{String(vehicle[key])}</Text>
            </View>
          ) : null
        )}
      </View>

      {/* כפתור מעבר להיסטוריית טיפולים */}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f3f6fa',
    minHeight: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f6fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3949ab',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  detailsBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 0.5,
    borderColor: '#e0e0e0',
    paddingBottom: 6,
  },
  key: {
    fontWeight: 'bold',
    color: '#1a237e',
    marginLeft: 8,
    fontSize: 16,
    width: 140,
    textAlign: 'right',
  },
  value: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
    textAlign: 'right',
  },
  error: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
  servicesBtn: {
    marginTop: 24,
    backgroundColor: '#3949ab',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'center',
  },
  servicesBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
});
