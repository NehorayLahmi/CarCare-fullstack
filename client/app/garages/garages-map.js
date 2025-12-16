import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

export default function GaragesMap() {
  const [garages, setGarages] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(100000); // ברירת מחדל: 10 ק"מ
  const [filteredGarages, setFilteredGarages] = useState([]);

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        
        const res = await fetch(
          'https://data.gov.il/api/3/action/datastore_search?resource_id=bb68386a-a331-4bbc-b668-bba2766d517d&limit=5000'
        );
        const data = await res.json();
        if (data.result?.records) {
          const locatedGarages = await Promise.all(
            data.result.records.map(async (garage) => {
              const coords = await geocodeGarage(garage);
              return coords ? { ...garage, coords } : null;
            })
          );
          setGarages(locatedGarages.filter(Boolean));
        }
      } catch (err) {
        //console.error('Error loading garages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGarages();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      });
    })();
  }, []);

  const geocodeGarage = async (garage) => {
    const attempts = [];

    if (garage.ktovet && garage.yishuv) {
      attempts.push(`${garage.ktovet}, ${garage.yishuv}, ישראל`);
    }
    if (garage.mikud) {
      attempts.push(`${garage.mikud}, ישראל`);
    }
    if (garage.yishuv) {
      attempts.push(`${garage.yishuv}, ישראל`);
    }

    for (const address of attempts) {
      //console.log('🔍 מנסה גיאוקודינג עבור הכתובת:', address);
      const geo = await tryGeocode(address);
      //console.log('📍 תוצאה:', geo);
      if (geo) {
        //console.log('✅ כתובת נמצאה:', address);
        return geo;
      }
      //console.log('❌ כתובת לא נמצאה:', address);
    }

    //console.log('🚫 לא נמצא מיקום עבור:', garage.shem_mosah || 'לא ידוע');
    return null;
  };

  const tryGeocode = async (query) => {
    try {
      const geo = await Location.geocodeAsync(query);
      if (geo.length > 0) {
        return { latitude: geo[0].latitude, longitude: geo[0].longitude };
      }
    } catch (e) {
      //console.warn('⚠️ שגיאה בגיאוקודינג עבור:', query);
    }
    return null;
  };

  const isWithinRadius = (coords) => {
    if (!region || !coords) return false;
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(coords.latitude - region.latitude);
    const dLon = toRad(coords.longitude - region.longitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(region.latitude)) *
      Math.cos(toRad(coords.latitude)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance <= radius;
  };


  filteredGarages.forEach((g) => {
    //console.log(`🛠️ ${g.shem_mosah}:`);
    //console.log(`   📍 Latitude: ${g.coords.latitude}, Longitude: ${g.coords.longitude}`);
  });
  useEffect(() => {
    if (!loading && region && garages.length > 0) {
      const inRange = garages.filter((g) => isWithinRadius(g.coords));
      setFilteredGarages(inRange);
      //console.log(`🔍 נמצאו ${inRange.length} מוסכים בטווח של ${(radius / 1000).toFixed(1)} ק"מ:`);
      inRange.forEach((g) => {
        //console.log(`🛠️ ${g.shem_mosah || 'ללא שם'} - 📍 ${g.coords.latitude}, ${g.coords.longitude}`);
      });
    }
  }, [radius, region, garages, loading]);

  if (loading || !region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3949ab" />
        <Text style={{ marginTop: 10 }}>טוען מפה ומיקומים...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView style={styles.map} initialRegion={region}>
        <Circle
          center={region}
          radius={radius}
          strokeColor="rgba(0,0,255,0.4)"
          fillColor="rgba(0,0,255,0.1)"
        />
        {filteredGarages.map((garage, idx) => (
          <Marker
            key={idx}
            coordinate={garage.coords}
            title={garage.shem_mosah}
            description={`${garage.yishuv}${garage.ktovet ? ', ' + garage.ktovet : ''}`}
          />
        ))}
      </MapView>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderText}>טווח חיפוש: {(radius / 1000).toFixed(1)} ק"מ</Text>
        <Slider
          minimumValue={1000}
          maximumValue={30000}
          step={1000}
          value={radius}
          onValueChange={setRadius}
          style={{ width: '90%' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  sliderText: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
});
