import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import api from '../../lib/api';
import { showAlert } from '../../lib/alert';

export default function ManufacturerTreatments({ manufacturer, onBack }) {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    async function fetchTreatments() {
      try {
        const { data } = await api.get('/modelService', { params: { tozeret_nm: manufacturer } });
        setTreatments(data);
      } catch (error) {
        showAlert('שגיאה', error.response?.data?.message || error.message || 'אירעה שגיאה');
      } finally {
        setLoading(false);
      }
    }

    fetchTreatments();
  }, [manufacturer]);

  async function deleteTreatment(item) {
    try {
      const { data: json } = await api.delete(
        `/modelService/${encodeURIComponent(item.tozeret_nm)}/${encodeURIComponent(item.degem_nm)}`
      );
      showAlert('הצלחה', json.message);
      setTreatments(prev =>
        prev.filter(
          t =>
            !(
              t.tozeret_nm === item.tozeret_nm &&
              t.degem_nm === item.degem_nm &&
              t._id === item._id
            ),
        ),
      );
      setExpandedIndex(null);
    } catch (error) {
      showAlert('שגיאה', error.response?.data?.message || error.message);
    }
  }

  const renderItem = ({ item, index }) => {
    const isExpanded = expandedIndex === index;
    return (
      <TouchableOpacity
        style={styles.rowFront}
        onPress={() => setExpandedIndex(isExpanded ? null : index)}
        activeOpacity={0.8}
      >
        <View style={styles.headerExpanded}>
          <Text style={styles.treatmentTitle}>דגם: {item.degem_nm}</Text>
          <Text style={styles.treatmentTitle}>יצרן: {item.tozeret_nm}</Text>
        </View>

        {isExpanded && (
          <View style={styles.details}>
            <Text style={styles.detailText}>סוג טיפול: {item.serviceType}</Text>
            <Text style={styles.detailText}>
              מרחק בק"מ לטיפול: {item.serviceIntervalKm ?? '-'}
            </Text>
            <Text style={styles.detailText}>
              חודשים לטיפול: {item.serviceIntervalMonths ?? '-'}
            </Text>
            <Text style={styles.detailText}>הערות: {item.notes || '-'}</Text>
            <Text style={styles.detailText}>
              עלות ממוצעת: {item.averageCost ? `₪ ${item.averageCost} ` : '-'}</Text>
            <Text style={styles.detailText}>
              מוסך מומלץ: {item.garageName || '-'}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() =>
          showAlert(
            'אישור מחיקה',
            `האם למחוק טיפול לדגם ${data.item.degem_nm}?`,
            [
              { text: 'ביטול', style: 'cancel' },
              {
                text: 'מחק',
                style: 'destructive',
                onPress: () => {
                  deleteTreatment(data.item);
                  if (rowMap[data.item.key]) {
                    rowMap[data.item.key].closeRow();
                  }
                },
              },
            ],
          )
        }
      >
        <Text style={styles.deleteButtonText}>מחק</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#4a90e2"
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );
  }

  if (treatments.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>לא נמצאו טיפולים.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>טיפולים ליצרן {manufacturer}</Text>

      <SwipeListView
        data={treatments}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-60}
        previewRowKey={'0'}
        previewOpenValue={-40}
        previewOpenDelay={1500}
        disableRightSwipe
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, writingDirection: 'rtl' },

  headerExpanded: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    marginBottom: 6,
  },
  treatmentTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 6,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  rowFront: {
    backgroundColor: '#f3f9fa',
    borderColor: '#80cbc4',
    borderWidth: 1,
    borderRadius: 7,
    padding: 12,
    marginBottom: 14,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center', // שונה ל-center
    minHeight: 70,            // גובה מינימלי קבוע
    direction: 'rtl',
  },
  rowBack: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 7,
    marginBottom: 14,
    height: 70,               // להתאים לגובה של rowFront
    backgroundColor: 'transparent',
  },
  deleteButton: {
    width: 60,
    height: '100%',           // שיהיה בגובה מלא של השורה
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
    marginRight: 2,
  },

  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',

  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
    writingDirection: 'rtl',
  },
});
