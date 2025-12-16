import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function IncomingTransfersScreen() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const url = process.env.EXPO_PUBLIC_API_URL;

    const router = useRouter();
    const fetchRequests = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        const myId = await AsyncStorage.getItem('myId'); // תעודת זהות שלי
        try {
            const response = await fetch(`http://${url}:4000/transfer?toId=${myId}&status=pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setRequests(data);
        } catch (e) {
            Alert.alert('שגיאה', 'בעיה בשליפת בקשות');
        } finally {
            setLoading(false);
        }
    };

    const respondToRequest = async (requestId, decision) => {
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await fetch(`http://${url}:4000/transfer/${requestId}/respond`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ decision }),
            });
            const resJson = await response.json();
            if (!response.ok) throw new Error(resJson.message);
            Alert.alert('הצלחה', decision === 'approved' ? 'הרכב עבר לבעלותך!' : 'הבקשה נדחתה', [
                {
                    text: 'סגור',
                    onPress: () => {
                        // סגור את מסך הבקשות (חזור אחורה)
                        router.back(); // expo-router
                        // navigation.goBack(); // react-navigation
                    },
                },
            ]);
            fetchRequests();
        } catch (e) {
            Alert.alert('שגיאה', e.message);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const renderItem = ({ item }) => (
        <View style={{ padding: 16, margin: 8, backgroundColor: '#f5f5f5', borderRadius: 10 }}>
            <Text>רכב: {item.licensePlate}</Text>
            <Text>משולח: {item.fromId}</Text>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity
                    style={{ backgroundColor: '#4caf50', padding: 10, borderRadius: 8, marginRight: 8 }}
                    onPress={() => respondToRequest(item._id, 'approved')}

                >
                    <Text style={{ color: '#fff' }}>אשר</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ backgroundColor: '#e53935', padding: 10, borderRadius: 8 }}
                    onPress={() => respondToRequest(item._id, 'rejected')}
                >
                    <Text style={{ color: '#fff' }}>דחה</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>בקשות להעברה</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#3949ab" />
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text>אין בקשות ממתינות</Text>}
                />
            )}
        </View>
    );
}
