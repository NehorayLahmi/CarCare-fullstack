import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function GarageDetail() {
  const { data } = useLocalSearchParams();
  const garage = JSON.parse(data);

  const address = `${garage.ktovet || ''} ${garage.yishuv || ''}`.trim();
  const encoded = encodeURIComponent(address);

  const openWaze = () => {
    if (!address) return;
    const wazeUrl = `waze://?q=${encoded}`;
    Linking.openURL(wazeUrl).catch(() =>
      Linking.openURL(`https://waze.com/ul?q=${encoded}`)
    );
  };

  const openGoogleMaps = () => {
    if (!address) return;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    Linking.openURL(mapsUrl);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{garage.shem_mosah || 'שם מוסך לא זמין'}</Text>

      <Text style={styles.item}><Text style={styles.label}>מספר מוסך:</Text> {garage.mispar_mosah}</Text>
      <Text style={styles.item}><Text style={styles.label}>סוג מוסך:</Text> {garage.sug_mosah}</Text>
      
      {/* כתובת + אייקונים */}
      <View style={styles.addressRow}>
        <Text style={styles.item}>
          <Text style={styles.label}>כתובת:</Text> {address || 'לא צוינה'}
        </Text>
        {address ? (
          <>
            <TouchableOpacity style={styles.mapIcon} onPress={openGoogleMaps}>
              <MaterialIcons name="map" size={26} color="#4285F4" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapIcon} onPress={openWaze}>
              <FontAwesome5 name="waze" size={26} color="#05C3DD" />
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      <Text style={styles.item}><Text style={styles.label}>ישוב:</Text> {garage.yishuv || 'לא צויין'}</Text>
      
      <View style={styles.phoneRow}>
        <Text style={styles.item}>
          <Text style={styles.label}>טלפון:</Text> {garage.telephone || 'לא צויין'}
        </Text>
        {garage.telephone ? (
          <TouchableOpacity
            style={styles.phoneIcon}
            onPress={() => Linking.openURL(`tel:${garage.telephone}`)}
          >
            <MaterialIcons name="phone" size={24} color="#1976d2" />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.item}><Text style={styles.label}>מיקוד:</Text> {garage.mikud || 'לא צויין'}</Text>
      <Text style={styles.item}><Text style={styles.label}>תחום מקצועי:</Text> {garage.miktzoa || 'לא צויין'}</Text>
      <Text style={styles.item}><Text style={styles.label}>מנהל תחום:</Text> {garage.menahel_miktzoa || 'לא צויין'}</Text>
      <Text style={styles.item}><Text style={styles.label}>רשם חברות:</Text> {garage.rasham_havarot || 'לא צויין'}</Text>
      <Text style={styles.item}><Text style={styles.label}>שדה טסטים:</Text> {garage.TESTIME || '---'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    direction: 'rtl',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 24,
    textAlign: 'left',
  },
  item: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
    lineHeight: 24,
    textAlign: 'left',
  },
  label: {
    fontWeight: '600',
    color: '#3949ab',
    textAlign: 'left',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapIcon: {
    marginLeft: 8,
    backgroundColor: '#f3f6fa',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  phoneIcon: {
    marginLeft: 8,
  },
});
