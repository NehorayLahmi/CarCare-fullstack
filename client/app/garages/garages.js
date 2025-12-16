import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    TextInput
} from 'react-native';
import { useRouter } from 'expo-router';

export default function GaragesScreen() {
    const [allGarages, setAllGarages] = useState([]);
    const [filteredGarages, setFilteredGarages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const router = useRouter();

    // פונקציה שמסננת כפילויות לפי מספר מוסך
    const filterUniqueByMisparMusah = (garages) => {
        const seen = new Set();
        return garages.filter(garage => {
            if (!garage.mispar_mosah) return false;
            if (seen.has(garage.mispar_mosah)) return false;
            seen.add(garage.mispar_mosah);
            return true;
        });
    };

    useEffect(() => {
        const fetchGarages = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    'https://data.gov.il/api/3/action/datastore_search?resource_id=bb68386a-a331-4bbc-b668-bba2766d517d&limit=1000000'
                );
                const data = await res.json();
                if (data.result && data.result.records) {
                    const uniqueGarages = filterUniqueByMisparMusah(data.result.records);
                    setAllGarages(uniqueGarages);
                    setFilteredGarages(uniqueGarages);
                }
            } catch (error) {
                //console.error('Error fetching garages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGarages();
    }, []);

    // שליפת תוצאות חיפוש מהשרת אם הקלט מספרי
    useEffect(() => {
        const fetchByQuery = async () => {
            const trimmed = query.trim();
            const isNumericSearch = /^\d+$/.test(trimmed);

            if (isNumericSearch) {
                setLoading(true);
                try {
                    const filtersParam = encodeURIComponent(JSON.stringify({ mispar_mosah: trimmed }));
                    const res = await fetch(
                        `https://data.gov.il/api/3/action/datastore_search?resource_id=bb68386a-a331-4bbc-b668-bba2766d517d&filters=${filtersParam}`
                    );
                    const data = await res.json();
                    if (data.result && data.result.records) {
                        const uniqueResults = filterUniqueByMisparMusah(data.result.records);
                        setFilteredGarages(uniqueResults);
                    } else {
                        setFilteredGarages([]);
                    }
                } catch (err) {
                    // console.error('Error in numeric search fetch:', err);
                    setFilteredGarages([]);
                } finally {
                    setLoading(false);
                }
            } else {
                // חיפוש טקסטואלי מקומי
                const lowerQuery = trimmed.toLowerCase();
                const filtered = allGarages.filter(garage => {
                    return (
                        (garage.shem_mosah && garage.shem_mosah.toLowerCase().includes(lowerQuery)) ||
                        (garage.yishuv && garage.yishuv.toLowerCase().includes(lowerQuery))
                    );
                });
                const uniqueFiltered = filterUniqueByMisparMusah(filtered);
                setFilteredGarages(uniqueFiltered);
            }
        };

        fetchByQuery();
    }, [query]);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: 'rgb(0, 0, 0)' }]}
                onPress={() => router.push('./garages-map')}
            >
                <Text style={styles.buttonText}>מפת מוסכים</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="חפש לפי שם מוסך, יישוב או מספר מוסך..."
                value={query}
                onChangeText={setQuery}
                textAlign="right"
                placeholderTextColor="#aaa"
            />

            {loading ? (
                <ActivityIndicator size="large" color="#3949ab" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredGarages}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() =>
                                router.push({
                                    pathname: './garage',
                                    params: { data: JSON.stringify(item) },
                                })
                            }
                        >
                            <Text style={styles.title}>{item.shem_mosah}</Text>
                            <Text style={styles.subtitle}>
                                {item.yishuv}
                                {item.ktovet ? ', ' + item.ktovet : ''}
                            </Text>
                            {item.mispar_mosah && (
                                <Text style={styles.subtitleSmall}>מספר מוסך: {item.mispar_mosah}</Text>
                            )}
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        query.length > 0 && (
                            <Text style={styles.noResults}>לא נמצאו מוסכים תואמים</Text>
                        )
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eef3f9',
        padding: 16,
        direction: 'rtl', // כל התוכן ימין
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        textAlign: 'left', // יישור לימין
    },
    item: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        elevation: 2,
        alignItems: 'flex-end', // יישור לימין של כל התוכן
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a237e',
        textAlign: 'left', // יישור לימין
        width: '100%',
    },
    subtitle: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
        textAlign: 'left', // יישור לימין
        width: '100%',
    },
    subtitleSmall: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
        textAlign: 'left',
        width: '100%',
    },
    noResults: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
        fontSize: 16,
    },
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
