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

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const filteredData: any = (
    filter === 'all' ? data : data?.filter((item: any) => item.unread)
  ).sort((a: any, b: any) => b.unread - a.unread);

  const markAllAsRead = () => {
    setData((prevData: any) =>
      prevData.map((item: any) => ({...item, unread: false})),
    );
    setModalVisible(false);
  };
  const handleNotificationPress = (notification: any) => {
    setData((prevData: any) =>
      prevData.map((item: any) =>
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

        {filter === 'unread' && filteredData?.length > 0 ? (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <IconCheck name="checkmark-done-sharp" size={20} color="#2D64AF" />
          </TouchableOpacity>
        ) : (
          <View style={{width: 20}} /> 
        )}
      </View>

      {filteredData.length > 0 && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.activeFilter,
            ]}
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
      )}

      <FlatList
        data={filteredData}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={() =>
          filteredData.length ? (
            <Text style={styles.sectionTitle}>{filteredData[0].date}</Text>
          ) : null
        }
        ListEmptyComponent={() => (
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
