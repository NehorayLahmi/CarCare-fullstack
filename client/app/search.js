import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';

// מיפוי שמות שדות לאנגלית -> עברית
const fieldLabels = {
  mispar_rechev: 'מספר רכב',
  baalut: 'בעלות',
  tozeret_nm: 'יצרן',
  degem_nm: 'דגם יצרן',
  kinuy_mishari: 'כינוי מסחרי',
  shnat_yitzur: 'שנת ייצור',
  moed_aliya_lakvish: 'עליה לכביש',
  tokef_dt: 'תוקף רישיון',
  mispar_rechevchan_acharon_dt: 'מועד טסט אחרון',
  sug_delek_nm: 'סוג דלק',
  degem_cd: 'קוד דגם',
  degem_manoa: 'קוד מנוע',
  misgeret: 'מספר שלדה',
  kvutzat_zihum: 'קבוצת זיהום',
  ramat_gank: 'רמת גנ״ק',
  ramat_eivzur_betihuty: 'רמת אבזור בטיחותי',
  tzeva_rechev: 'צבע רכב',
  tzeva_cd: 'קוד צבע',
  zmig_kidmi: 'צמיג קדמי',
  zmig_ahori: 'צמיג אחורי',
  sug_degem: 'סוג דגם',
  // תוכל להוסיף עוד שדות לפי הצורך
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
  'misgeret',
  'kvutzat_zihum',
  'ramat_gank',
  'ramat_eivzur_betihuty',
  'tzeva_rechev',
  'tzeva_cd',
  'zmig_kidmi',
  'zmig_ahori',
  'sug_degem',
];

export default function CarSearchScreen() {
  const [plate, setPlate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!plate.trim()) {
      setError('אנא הזן מספר רישוי');
      setResult(null);
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch(`https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&q=${plate}`);
      const data = await response.json();
      if (!data.result.records || data.result.records.length === 0) {
        setError('לא נמצאו תוצאות עבור מספר הרישוי שהוזן');
        setResult(null);
      } else {
        setResult(data.result.records[0]); // מציג את התוצאה הראשונה
      }
    } catch (e) {
      setError('אירעה שגיאה, נסה שוב');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, direction: 'ltr' }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>חיפוש רכב לפי מספר רישוי</Text>
        <TextInput
          style={styles.input}
          placeholder="הזן מספר רישוי"
          value={plate}
          onChangeText={setPlate}
          keyboardType="numeric"
        />
        <Button title="חפש" onPress={handleSearch} disabled={loading} />
        {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
        {error && <Text style={styles.error}>{error}</Text>}
        {result && (
          <ScrollView style={styles.resultContainer}>
            <Text style={styles.resultTitle}>פרטי הרכב:</Text>


            <View style={styles.detailsBox}>
              {fieldsOrder.map((key) =>
                result[key] !== undefined && result[key] !== null && result[key] !== '' ? (
                  <View key={key} style={styles.row}>
                    <Text style={styles.key}>{fieldLabels[key] || key}:</Text>
                    <Text style={styles.value}>{String(result[key])}</Text>
                  </View>
                ) : null
              )}
            </View>

          </ScrollView>
        )}
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
  error: {
    color: 'red',
    marginTop: 15,
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 25,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 0,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  detailsBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
        direction: 'ltr', // הוספה!

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
    width: 130,
    textAlign: 'right',
  },
  value: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
    textAlign: 'right',
  },
});
