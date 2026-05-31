import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../../../lib/api';

export default function IncomingTransfersScreen() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const fetchRequests = async () => {
        setLoading(true);
        const myId = await AsyncStorage.getItem('myId');
        try {
            const { data } = await api.get('/transfer', { params: { toId: myId, status: 'pending' } });
            setRequests(data);
        } catch (e) {
            Alert.alert('שגיאה', 'בעיה בשליפת בקשות');
        } finally {
            setLoading(false);
        }
    };

    const respondToRequest = async (requestId, decision) => {
        try {
            await api.post(`/transfer/${requestId}/respond`, { decision });
            Alert.alert('הצלחה', decision === 'approved' ? 'הרכב עבר לבעלותך!' : 'הבקשה נדחתה', [
                {
                    text: 'סגור',
                    onPress: () => { router.back(); },
                },
            ]);
            fetchRequests();
        } catch (e) {
            Alert.alert('שגיאה', e.response?.data?.message || e.message);
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
