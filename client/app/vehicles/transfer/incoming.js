import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../../../lib/api';
import { showAlert } from '../../../lib/alert';

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
            showAlert('שגיאה', 'בעיה בשליפת בקשות');
        } finally {
            setLoading(false);
        }
    };

    const respondToRequest = async (requestId, decision) => {
        try {
            await api.post(`/transfer/${requestId}/respond`, { decision });
            showAlert(
                decision === 'approved' ? 'הרכב עבר לבעלותך!' : 'הבקשה נדחתה',
                '',
                [{ text: 'סגור', onPress: () => router.back() }]
            );
            fetchRequests();
        } catch (e) {
            showAlert('שגיאה', e.response?.data?.message || e.message);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.cardLine}>
                <Text style={styles.cardLabelBold}>רכב: </Text>
                {item.licensePlate}
            </Text>
            <Text style={styles.cardLine}>
                <Text style={styles.cardLabelBold}>שולח: </Text>
                {item.fromName || item.fromId}
            </Text>
            <View style={styles.btnRow}>
                <TouchableOpacity
                    style={[styles.btn, styles.rejectBtn]}
                    onPress={() => respondToRequest(item._id, 'rejected')}
                >
                    <Text style={styles.btnText}>דחה</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btn, styles.approveBtn]}
                    onPress={() => respondToRequest(item._id, 'approved')}
                >
                    <Text style={styles.btnText}>אשר קבלה</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>בקשות העברת רכב</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#3949ab" style={{ marginTop: 32 }} />
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.empty}>אין בקשות ממתינות</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f6fa',
        padding: 20,
        paddingTop: 48,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a237e',
        textAlign: 'right',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        marginBottom: 14,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    cardLine: {
        fontSize: 15,
        color: '#333',
        textAlign: 'right',
        writingDirection: 'rtl',
        marginBottom: 6,
    },
    cardLabelBold: {
        fontWeight: 'bold',
        color: '#3949ab',
    },
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 14,
        gap: 10,
    },
    btn: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 8,
        alignItems: 'center',
    },
    approveBtn: { backgroundColor: '#4caf50' },
    rejectBtn: { backgroundColor: '#e53935' },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
    empty: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        marginTop: 40,
    },
});
