



import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // מחיקת הטוקן

const { width } = Dimensions.get('window');


export default function HomeScreen() {

  const router = useRouter();

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token'); // מחיקת הטוקן
      router.replace('.'); // ניווט לתיקיה הנוכחית (index.js)
    } catch (e) {
      Alert.alert('שגיאה', 'אירעה שגיאה בעת ההתנתקות');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'התנתקות',
      'האם אתה בטוח שברצונך להתנתק?',
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'התנתק', onPress: logout }
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#232526', '#414345', '#2b5876', '#4e4376']}
      style={styles.gradient}
    >
      <Image
        source={{ uri: 'https://static.pakwheels.com/2018/10/Caroline-Racing-Quad-turbo-2JZ-Powered-Nissan-S14-05.jpg' }}
        style={styles.backgroundImage}
        blurRadius={0.6}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      {/* כפתור התנתקות קטן בפינה */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <MaterialIcons name="logout" size={28} color="#fff" />
      </TouchableOpacity>
      <View style={styles.container}>
        <Text style={styles.title}>איזור אישי</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push('/vehicles')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>הרכבים שלי</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.push('/search')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>חיפוש רכב ציבורי</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={() => router.push('../garages/garages')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>חיפוש מוסכים</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: '100%',
    top: 0,
    left: 0,
    opacity: 0.9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(40,40,50,0.18)',
    zIndex: 1,
  },
  logoutBtn: {
    position: 'absolute',
    top: 42,
    right: 24,
    zIndex: 10,
    backgroundColor: '#3949abcc',
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 24,
    zIndex: 2,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'rgb(255, 0, 0)',
    marginBottom: 48,
    letterSpacing: 2,
    textShadowColor: '#000a',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 16,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 22,
  },
  button: {
    width: 260,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.21,
    shadowRadius: 18,
  },
  primaryButton: {
    backgroundColor: '#3949abcc',
  },
  secondaryButton: {
    backgroundColor: '#00bcd4cc',
  },
  tertiaryButton: {
    backgroundColor: '#43a047cc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1.2,
    textShadowColor: '#0007',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
