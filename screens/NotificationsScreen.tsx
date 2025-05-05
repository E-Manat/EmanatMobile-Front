import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconCheck from 'react-native-vector-icons/Ionicons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import Toast from 'react-native-toast-message';
import * as signalR from '@microsoft/signalr';
import {Swipeable} from 'react-native-gesture-handler';
import Config from 'react-native-config';
const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState<any>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const handleLongPress = (id: string) => {
    setSelectionMode(true);
    if (!selectedIds.includes(id)) {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const filteredData = useMemo(() => {
    return (
      filter === 'all' ? data : data?.filter((item: any) => item.unread)
    ).sort((a: any, b: any) => b.unread - a.unread);
  }, [filter, data]);

  const handleNotificationPress = (notification: any) => {
    setData((prevData: any) =>
      prevData.map((item: any) =>
        item.id === notification.id ? {...item, unread: false} : item,
      ),
    );
    setSelectedNotification(notification);
    markAsRead(notification.id);
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatDate = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleDateString('az-AZ');
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('Token tapılmadı');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${Config.API_URL}/notification/Notification/Get`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const text = await response.text();
        if (text) {
          const notifications = JSON.parse(text);
          const formattedNotifications = notifications.map((item: any) => ({
            id: item.id,
            title: item.title,
            text: item.message,
            unread: !item.isRead,
            time: formatTime(item.createdAt),
            date: formatDate(item.createdAt),
          }));
          setData(formattedNotifications);
        } else {
          setData([]);
        }
      } else {
        console.error('❌ API xətası:', response.status, response.statusText);
        setData([]);
      }
    } catch (err) {
      console.error('❌ Bildiriş GET xətası:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications]),
  );

  console.log(AsyncStorage.getAllKeys);
  const [connectionId, setConnectionId] = useState(null);

  useEffect(() => {
    const setupConnection = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        console.log(userId, 'userid');
        if (!userId) return;

        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const connection: any = new signalR.HubConnectionBuilder()
          .withUrl(`${Config.BASE_URL}/notification/hubs/mobile`, {
            accessTokenFactory: () => token,
          })
          .withAutomaticReconnect()
          .build();

        connection
          .start()
          .then(() => {
            console.log('SignalR bağlantısı kuruldu');
            console.log('Connection ID:', connection.connectionId);
            setConnectionId(connection.connectionId);
          })
          .catch((err: any) => {
            console.error('SignalR bağlantı hatası:', err);
          });

        connection.on('TaskCreated', (data: any) => {
          console.log('Task Created Message:', data);
          // Task gəldikdə frontend yenilənə bilər
        });
      } catch (err) {
        console.error('AsyncStorage və ya SignalR xəta:', err);
      }
    };

    setupConnection();
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('Token tapılmadı');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${Config.API_URL}/notification/Notification/GetUnreads`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const text = await response.text();
        if (text) {
          const notifications = JSON.parse(text);
          const formattedNotifications = notifications.map((item: any) => ({
            id: item.id,
            title: item.title,
            text: item.message,
            unread: !item.isRead,
            time: formatTime(item.createdAt),
            date: formatDate(item.createdAt),
          }));
          setData(formattedNotifications);
        } else {
          setData([]);
        }
      } else {
        console.error('❌ API xətası:', response.status, response.statusText);
        setData([]);
      }
    } catch (err) {
      console.error('❌ Oxunmamış GET xətası:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filter === 'unread') {
      fetchUnreadNotifications();
    } else {
      fetchNotifications();
    }
  }, [filter, fetchNotifications, fetchUnreadNotifications]);

  const [successMessage, setSuccessMessage] = useState('');

  console.log(data, 'data');

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('Token tapılmadı');
        return;
      }

      const response = await fetch(
        `${Config.API_URL}/notification/Notification/MarkAllAsRead`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(response, 'response');
      if (response) {
        setData((prevData: any) =>
          prevData.map((item: any) => ({...item, unread: false})),
        );
        setSuccessMessage('Bütün bildirişlər uğurla işarələndi!');
        setModalVisible(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Xəta baş verdi',
          text2: 'Bildirişlər işarələnə bilmədi',
        });
      }
    } catch (err) {
      console.error('❌ markAllAsRead API xətası:', err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('Token tapılmadı');
        return;
      }

      const response = await fetch(
        `${Config.API_URL}/notification/Notification/MarkAsRead`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({notificationId: notificationId}),
        },
      );

      if (!response.ok) {
        console.error('❌ markAsRead API xətası:', response.status);
      }
    } catch (err) {
      console.error('❌ markAsRead istisna xətası:', err);
    }
  };

  const handleSwipeDelete = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('Token tapılmadı');
        return;
      }

      console.log(id);

      const response: any = await fetch(
        `${Config.API_URL}/notification/Notification/Delete`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({notificationId: id}),
        },
      );

      console.log(response, 'response');

      if (response) {
        setData((prev: any) => prev.filter((item: any) => item.id !== id));
        Toast.show({
          type: 'success',
          text1: 'Bildiriş silindi',
        });
      } else {
        console.error('❌ Bildiriş silinmədi:', response.status);
      }
    } catch (err) {
      console.error('❌ handleSwipeDelete istisna:', err);
    }
  };

  const renderItem = ({item}: any) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <Swipeable
        renderRightActions={() => (
          <TouchableOpacity
            onPress={() => handleSwipeDelete(item.id)}
            style={{
              backgroundColor: '#FF3B30',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
            }}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>Sil</Text>
          </TouchableOpacity>
        )}>
        <TouchableOpacity
          onPress={() =>
            selectionMode
              ? handleSelect(item.id)
              : handleNotificationPress(item)
          }
          onLongPress={() => handleLongPress(item.id)}
          style={[
            styles.notificationCard,
            isSelected && {backgroundColor: '#e6f0ff'},
          ]}>
          {item.unread && <View style={styles.unreadDot} />}
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
            <Text style={styles.notificationText}>
              {item.text.slice(0, 100)}..
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };
  console.log(selectedIds, 'selectedIds');

  const handleBulkDelete = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.warn('Token tapılmadı');

      const response = await fetch(
        `${Config.API_URL}/notification/Notification/DeleteSelectedIds`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({notificationIds: selectedIds}),
        },
      );

      if (response.ok) {
        setData((prev: any) =>
          prev.filter((item: any) => !selectedIds.includes(item.id)),
        );
        setSelectedIds([]);
        setSelectionMode(false);

        Toast.show({
          type: 'success',
          text1: 'Seçilmiş bildirişlər silindi',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Xəta baş verdi',
          text2: 'Bildirişlər silinmədi',
        });
      }
    } catch (err) {
      console.error('❌ handleBulkDelete istisna:', err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.warn('Token tapılmadı');

      const response = await fetch(
        `${Config.API_URL}/notification/Notification/DeleteAll`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        },
      );
      console.log(response, 'response');
      if (response) {
        setData([]);
        setSelectedIds([]);
        setSelectionMode(false);
        Toast.show({
          type: 'success',
          text1: 'Bütün bildirişlər silindi',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Xəta baş verdi',
          text2: 'Bildirişlər silinmədi',
        });
      }
    } catch (err) {
      console.error('❌ handleDeleteAll istisna:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#2D64AF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirişlər</Text>

        {filter === 'unread' && filteredData?.length > 0 ? (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <IconCheck name="checkmark-done-sharp" size={20} color="#2D64AF" />
          </TouchableOpacity>
        ) : (
          <View style={{width: 20}} />
        )}

        {selectionMode && selectedIds.length > 0 && (
          <TouchableOpacity
            onPress={handleBulkDelete}
            style={{
              backgroundColor: 'red',
              padding: 10,
              alignItems: 'center',
              margin: 10,
              borderRadius: 10,
            }}>
            <Text style={{color: 'white', fontFamily: 'DMSans-Regular'}}>
              Seçilmişləri Sil ({selectedIds.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}>
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.activeFilterText,
            ]}>
            Hamısı
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'unread' && styles.activeFilter,
          ]}
          onPress={() => setFilter('unread')}>
          <Text
            style={[
              styles.filterText,
              filter === 'unread' && styles.activeFilterText,
            ]}>
            Oxunmamış
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1269B5"
          style={{marginTop: 60}}
        />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={() =>
            filteredData.length ? (
              <>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text style={styles.sectionTitle}>
                    {filteredData[0].date}
                  </Text>
                  <TouchableOpacity
                    onPress={handleDeleteAll}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      marginBottom: 10,
                    }}>
                    <Text style={{color: '#000'}}>Hamısını Sil</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null
          }
          ListEmptyComponent={() =>
            data.length === 0 ? (
              <View style={styles.noResult}>
                <Image
                  source={require('../assets/img/notification_empty.png')}
                  style={styles.noContentImage}
                />
                <Text style={styles.noContentLabel}>
                  Hazırda heç bir bildirişiniz yoxdur.
                </Text>
                <Text style={styles.noContentText}>
                  Yeni bildirişlər burada görünəcək.
                </Text>
              </View>
            ) : (
              filter === 'unread' && (
                <View style={styles.noResult}>
                  <Image
                    source={require('../assets/img/notification_empty.png')}
                    style={styles.noContentImage}
                  />
                  <Text style={styles.noContentLabel}>
                    Oxunmamış bildiriş yoxdur.
                  </Text>
                </View>
              )
            )
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Təsdiqləmə</Text>
            <Text style={styles.modalText}>
              Bütün mesajları oxunmuş kimi işarələmək istəyirsiniz?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Xeyr, ləğv et</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={markAllAsRead}>
                <Text style={styles.confirmText}>Bəli, istəyirəm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {selectedNotification && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image
                source={require('../assets/img/emanat.png')}
                style={styles.image}
              />
              <Text style={styles.modalTitle}>
                {selectedNotification.title}
              </Text>
              <Text style={styles.modalText}>{selectedNotification.text}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Bağla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-SemiBold',
    color: '#2D64AF',
  },
  filterContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 25,
  },
  activeFilter: {
    backgroundColor: '#1269B5',
  },
  filterText: {
    fontSize: 14,
    color: '#1269B5',
    fontFamily: 'DMSans-Regular',
  },
  activeFilterText: {
    color: '#FFF',
    fontFamily: 'DMSans-Regular',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A8A8A8',
    marginTop: 10,
    marginBottom: 5,
  },
  notificationCard: {
    flexDirection: 'column',
    gap: 3,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 5,
    display: 'flex',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 10,
    marginTop: 8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-SemiBold',
    color: '#001D45',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#A8A8A8',
    fontFamily: 'DMSans-Regular',
  },
  notificationText: {
    fontSize: 14,
    color: '#A8A8A8',
    marginTop: 5,
    fontFamily: 'DMSans-Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'DMSans-SemiBold',
    color: '#001D45',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#A8A8A8',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'DMSans-Regular',
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1269B5',
    borderRadius: 5,
    marginRight: 5,
  },
  cancelText: {color: '#1269B5', fontSize: 14, fontFamily: 'DMSans-SemiBold'},
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1269B5',
    borderRadius: 5,
  },
  confirmText: {color: '#FFF', fontSize: 14, fontFamily: 'DMSans-SemiBold'},
  closeButton: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2D64AF',
    borderRadius: 5,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#1269B5',
    fontSize: 14,
    fontFamily: 'DMSans-SemiBold',
  },
  image: {
    width: 85,
    height: 85,
    objectFit: 'cover',
  },
  noResult: {
    color: '#A8A8A8',
    fontSize: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    width: '100%',
    height: '100%',
    paddingTop: 80,
    paddingHorizontal: 50,
  },
  noContentImage: {
    width: 180,
    height: 180,
  },
  noContentLabel: {
    color: '#063A66',
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    marginTop: 10,
  },
  noContentText: {
    color: '#616161',
    textAlign: 'center',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
  },
});
