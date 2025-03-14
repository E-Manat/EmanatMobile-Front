import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconCheck from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const notificationsData = [
  {
    id: '1',
    title: 'Bildiriş 1',
    text: 'Lorem ipsum dolor sit amet consectetur. Laoreet ipsum egestas sit laoreet amet porttitor. Quis aliquam molestie arcu leo et quam. Sagittis nibh placerat ultrices lorem nunc curabitur. ',
    time: '12:03',
    date: 'Bu gün',
    unread: true,
  },
  {
    id: '2',
    title: 'Bildiriş 2',
    text: 'Lorem ipsum dolor sit amet consectetur. Laoreet ipsum egestas sit laoreet amet porttitor. Quis aliquam molestie arcu leo et quam. Sagittis nibh placerat ultrices lorem nunc curabitur. ',
    time: '13:00',
    date: 'Dünən',
    unread: true,
  },
  {
    id: '3',
    title: 'Bildiriş 3',
    text: 'Lorem ipsum dolor sit amet consectetur. Laoreet ipsum egestas sit laoreet amet porttitor. Quis aliquam molestie arcu leo et quam. Sagittis nibh placerat ultrices lorem nunc curabitur. ',
    time: '14:00',
    date: '12.09.2024',
    unread: false,
  },
  {
    id: '4',
    title: 'Bildiriş 4',
    text: 'Lorem ipsum dolor sit amet consectetur. Laoreet ipsum egestas sit laoreet amet porttitor. Quis aliquam molestie arcu leo et quam. Sagittis nibh placerat ultrices lorem nunc curabitur. ',
    time: '12:52',
    date: '12.09.2024',
    unread: true,
  },
  {
    id: '5',
    title: 'Bildiriş 5',
    text: 'Lorem ipsum dolor sit amet consectetur. Laoreet ipsum egestas sit laoreet amet porttitor. Quis aliquam molestie arcu leo et quam. Sagittis nibh placerat ultrices lorem nunc curabitur. ',
    time: '17:25',
    date: '12.09.2024',
    unread: false,
  },
  {
    id: '6',
    title: 'Bildiriş 6',
    text: 'Lorem ipsum dolor sit amet consectetur. Laoreet ipsum egestas sit laoreet amet porttitor. Quis aliquam molestie arcu leo et quam. Sagittis nibh placerat ultrices lorem nunc curabitur. ',
    time: '16:03',
    date: '05.09.2024',
    unread: false,
  },
  {
    id: '14',
    title: 'Bildiriş 4',
    text: 'Lorem ipsum dolor sit amet consectetur. Laoreet ipsum egestas sit laoreet amet porttitor. Quis aliquam molestie arcu leo et quam. Sagittis nibh placerat ultrices lorem nunc curabitur. ',
    time: '12:52',
    date: '12.09.2024',
    unread: true,
  },
  {
    id: '15',
    title: 'Bildiriş 5',
    text: 'Lorem ipsum dolor sit amet consectetur. Laoreet ipsum egestas sit laoreet amet porttitor. Quis aliquam molestie arcu leo et quam. Sagittis nibh placerat ultrices lorem nunc curabitur. ',
    time: '17:25',
    date: '12.09.2024',
    unread: false,
  },
  {
    id: '16',
    title: 'Bildiriş 6',
    text: 'Lorem ipsum dolor sit amet consectetur. Laoreet ipsum egestas sit laoreet amet porttitor. Quis aliquam molestie arcu leo et quam. Sagittis nibh placerat ultrices lorem nunc curabitur. ',
    time: '16:03',
    date: '05.09.2024',
    unread: true,
  },
];

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState(notificationsData);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const filteredData = (
    filter === 'all' ? data : data.filter(item => item.unread)
  ).sort((a: any, b: any) => b.unread - a.unread);

  const markAllAsRead = () => {
    setData(prevData => prevData.map(item => ({...item, unread: false})));
    setModalVisible(false);
  };
  const handleNotificationPress = (notification: any) => {
    setData(prevData =>
      prevData.map(item =>
        item.id === notification.id ? {...item, unread: false} : item,
      ),
    );
    setSelectedNotification(notification);
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  const renderItem = ({item}: any) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item)}>
      <View style={styles.notificationCard}>
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
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#2D64AF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirişlər</Text>
        {filter === 'unread' && filteredData.length > 0 && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <IconCheck name="checkmark-done-sharp" size={20} color="#2D64AF" />
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

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>
            {filteredData.length ? filteredData[0].date : ''}
          </Text>
        )}
      />

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
    fontWeight: 'bold',
    color: '#2D64AF',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#2D64AF',
  },
  filterText: {
    fontSize: 14,
    color: '#2D64AF',
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#001D45',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#A8A8A8',
  },
  notificationText: {
    fontSize: 14,
    color: '#A8A8A8',
    marginTop: 5,
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
    fontWeight: 'bold',
    color: '#001D45',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#A8A8A8',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
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
  cancelText: {color: '#1269B5', fontSize: 14, fontWeight: 'bold'},
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1269B5',
    borderRadius: 5,
  },
  confirmText: {color: '#FFF', fontSize: 14, fontWeight: 'bold'},
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
  closeButtonText: {color: '#1269B5', fontSize: 14, fontWeight: 'bold'},
  image: {
    width: 85,
    height: 85,
    objectFit: 'cover',
  },
});
