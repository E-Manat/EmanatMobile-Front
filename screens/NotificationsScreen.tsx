import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  SafeAreaView,
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
import {apiService} from '../services/apiService';
import {API_ENDPOINTS} from '../services/api_endpoint';
import {SvgImage} from '@components/SvgImage';
import {Routes} from '@navigation/routes';
import {MainStackParamList} from 'types/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

const NotificationsScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.newReport>
> = ({navigation, route}) => {
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
      const raw: any[] = await apiService.get(API_ENDPOINTS.notification.get);
      console.log(raw, 'raw');
      const formatted = raw?.map(item => ({
        id: item.id,
        title: item.title,
        text: item.message,
        unread: !item.isRead,
        time: formatTime(item.createdAt),
        date: formatDate(item.createdAt),
      }));
      setData(formatted);
    } catch (err) {
      console.error('GET notifications error:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications]),
  );

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const connectSignalR = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.warn('Token tapılmadı');
          return;
        }

        if (connectionRef.current) {
          console.log('⚠️ Mövcud bağlantı var, yenidən qurulmur');
          return;
        }

        const connection = new signalR.HubConnectionBuilder()
          .withUrl(`${Config.SIGNALR_URL}`, {
            accessTokenFactory: () => token,
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information)
          .build();

        connection.off('ReceiveNotification');

        connection.on('ReceiveNotification', (notification: any) => {
          console.log('📩 Yeni real-time bildiriş:', notification);

          const newNotification = {
            id: notification.id,
            title: notification.title,
            text: notification.message,
            unread: !notification.isRead,
            time: formatTime(notification.createdAt),
            date: formatDate(notification.createdAt),
          };

          setData((prev: any) => [newNotification, ...prev]);

          Toast.show({
            type: 'success',
            text1: notification.title,
            text2: notification.message,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
          });

          const ding = new Sound(
            'notification.mp3',
            Sound.MAIN_BUNDLE,
            error => {
              if (error) {
                console.log('❌ Səs yükləmə xətası:', error);
                return;
              }
              ding.play(success => {
                if (!success) {
                  console.log('🔇 Səs çalınmadı');
                }
              });
            },
          );
        });

        await connection.start();
        connectionRef.current = connection;

        console.log('✅ SignalR bağlantısı quruldu');
      } catch (err) {
        console.error('❌ SignalR bağlantı xətası:', err);
      }
    };

    connectSignalR();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        console.log('🔌 SignalR bağlantısı dayandırıldı');
        connectionRef.current = null;
      }
    };
  }, []);

  const fetchUnreadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const raw: any[] = await apiService.get(
        API_ENDPOINTS.notification.getUnreads,
      );
      console.log(raw, 'raw');
      const formatted = raw?.map(item => ({
        id: item.id,
        title: item.title,
        text: item.message,
        unread: !item.isRead,
        time: formatTime(item.createdAt),
        date: formatDate(item.createdAt),
      }));
      setData(formatted);
    } catch (err) {
      console.error('GET unreads error:', err);
      setData([]);
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

  const markAllAsRead = async () => {
    try {
      await apiService.post(API_ENDPOINTS.notification.markAllAsRead, {});
      setData((d: any) => d.map((x: any) => ({...x, unread: false})));
      setModalVisible(false);
      Toast.show({type: 'success', text1: 'Bütün bildirişlər oxundu.'});
    } catch (err) {
      Toast.show({type: 'error', text1: 'Xəta', text2: 'İşarələnmədi.'});
      console.error(err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.patch(API_ENDPOINTS.notification.markAsRead, {
        notificationId,
      });
    } catch (err) {
      console.error('❌ markAsRead error:', err);
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

  const handleBulkDelete = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        return console.warn('Token tapılmadı');
      }

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
      if (!token) {
        return console.warn('Token tapılmadı');
      }

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={{marginLeft: 20}}
          onPress={() => navigation.goBack()}>
          <SvgImage
            color="#2D64AF"
            source={require('assets/icons/svg/go-back.svg')}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirişlər</Text>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {filter === 'unread' && filteredData.length > 0 ? (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{marginRight: 12}}>
              <IconCheck
                name="checkmark-done-sharp"
                size={20}
                color="#2D64AF"
              />
            </TouchableOpacity>
          ) : (
            <View style={{width: 20, marginRight: 12}} />
          )}

          {selectionMode && selectedIds.length > 0 && (
            <TouchableOpacity
              onPress={handleBulkDelete}
              style={styles.bulkDeleteButton}>
              <Icon name="trash" size={20} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>
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
        <View>
          {' '}
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
                      <Text style={styles.deleteAllText}>Hamısını Sil</Text>
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
        </View>
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
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    height: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-SemiBold',
    color: '#2D64AF',
  },
  bulkDeleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
    marginBottom: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    width: '90%',
    alignSelf: 'center',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
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
    fontFamily: 'DMSans-SemiBold',
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
    color: '#1269B5',
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
    width: '85%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'DMSans-SemiBold',
    color: '#001D45',
    marginBottom: 10,
    textAlign: 'left',
  },
  modalText: {
    fontSize: 12,
    color: '#A8A8A8',
    textAlign: 'left',
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
    paddingVertical: 15,
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
    width: 50,
    height: 57,
    objectFit: 'cover',
    marginBottom: 5,
    alignSelf: 'center',
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
    textAlign: 'center',
    paddingTop: '40%',
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
  deleteAllText: {
    color: '#063A66',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '400',
  },
});
