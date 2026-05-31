import { View, Text, StyleSheet } from 'react-native';

export default function GaragesMap() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>מפת מוסכים זמינה באפליקציית המובייל בלבד</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f6fa' },
  text: { fontSize: 18, color: '#3949ab', textAlign: 'center' },
});
