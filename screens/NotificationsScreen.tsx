import React, {useCallback, useMemo, useState} from 'react';
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
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SvgImage} from '@components/SvgImage';
import {Routes} from '@navigation/routes';
import {MainStackParamList} from 'types/types';
import {NotificationItem} from '@components/NotificationItem';
import {useNotifications} from '../hooks/useNotifications';
import {useSignalRNotifications} from '../hooks/useSignalRNotifications';
import {useNotificationSelection} from '../hooks/useNotificationSelection';
import type {Notification} from '../types/notification';

const NotificationsScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.notifications>
> = ({navigation}) => {
  const {top} = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const {
    data,
    filteredData,
    loading,
    refreshing,
    refresh,
    addNotification,
    markAsRead,
    updateLocalAsRead,
    markAllAsRead,
    deleteNotification,
    deleteSelected,
    deleteAll,
  } = useNotifications(filter);

  const {
    selectedIds,
    selectionMode,
    handleLongPress,
    handleSelect,
    clearSelection,
  } = useNotificationSelection();

  useSignalRNotifications(addNotification);

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      updateLocalAsRead(notification.id);
      setSelectedNotification(notification);
      markAsRead(notification.id);
    },
    [updateLocalAsRead, markAsRead],
  );

  const handleBulkDelete = useCallback(async () => {
    await deleteSelected(selectedIds);
    clearSelection();
  }, [deleteSelected, selectedIds, clearSelection]);

  const handleDeleteAll = useCallback(async () => {
    await deleteAll();
    clearSelection();
  }, [deleteAll, clearSelection]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
    setModalVisible(false);
  }, [markAllAsRead]);

  const closeDetailModal = useCallback(() => {
    setSelectedNotification(null);
  }, []);

  const renderItem = useCallback(
    ({item}: {item: Notification}) => (
      <NotificationItem
        item={item}
        isSelected={selectedIds.includes(item.id)}
        selectionMode={selectionMode}
        onPress={handleNotificationPress}
        onLongPress={handleLongPress}
        onSelect={handleSelect}
        onDelete={deleteNotification}
      />
    ),
    [
      selectedIds,
      selectionMode,
      handleNotificationPress,
      handleLongPress,
      handleSelect,
      deleteNotification,
    ],
  );

  const keyExtractor = useCallback((item: Notification) => String(item.id), []);

  const ListHeaderComponent = useMemo(
    () =>
      () =>
        loading || !filteredData.length ? null : (
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>{filteredData[0].date}</Text>
            <TouchableOpacity
              onPress={handleDeleteAll}
              style={styles.deleteAllButton}>
              <Text style={styles.deleteAllText}>Hamısını Sil</Text>
            </TouchableOpacity>
          </View>
        ),
    [loading, filteredData, handleDeleteAll],
  );

  const ListEmptyComponent = useMemo(() => {
    return () => {
      if (loading) {
        return (
          <ActivityIndicator
            size="large"
            color="#1269B5"
            style={styles.loader}
          />
        );
      }
      if (data.length === 0) {
        return (
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
        );
      }
      if (filter === 'unread') {
        return (
          <View style={styles.noResult}>
            <Image
              source={require('../assets/img/notification_empty.png')}
              style={styles.noContentImage}
            />
            <Text style={styles.noContentLabel}>
              Oxunmamış bildiriş yoxdur.
            </Text>
          </View>
        );
      }
      return null;
    };
  }, [loading, data.length, filter]);

  return (
    <View style={[styles.container, {paddingTop: top}]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <SvgImage
            color="#2D64AF"
            source={require('assets/icons/svg/go-back.svg')}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirişlər</Text>

        <View style={styles.headerActions}>
          {filter === 'unread' && filteredData.length > 0 ? (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.headerAction}>
              <SvgImage source={require('assets/icons/svg/seen.svg')} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerActionPlaceholder} />
          )}

          {selectionMode && selectedIds.length > 0 && (
            <TouchableOpacity
              onPress={handleBulkDelete}
              style={styles.bulkDeleteButton}>
              <SvgImage
                source={require('assets/icons/svg/trash.svg')}
                color="#FF3B30"
              />
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

      <FlatList
        data={filteredData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={5}
        refreshing={refreshing}
        onRefresh={refresh}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
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
                onPress={handleMarkAllAsRead}>
                <Text style={styles.confirmText}>Bəli, istəyirəm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {selectedNotification && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <SvgImage
                style={styles.modalImage}
                source={require('assets/icons/mpay.svg')}
              />
              <Text style={styles.modalTitle}>
                {selectedNotification.title}
              </Text>
              <Text style={styles.modalText}>{selectedNotification.text}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeDetailModal}>
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
    backgroundColor: '#F7F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    height: 80,
  },
  backButton: {
    marginLeft: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-SemiBold',
    color: '#2D64AF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    marginRight: 12,
  },
  headerActionPlaceholder: {
    width: 24,
    marginRight: 12,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A8A8A8',
    marginTop: 10,
    marginBottom: 5,
  },
  deleteAllButton: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  loader: {
    marginTop: 60,
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
  modalImage: {
    width: 50,
    height: 57,
    objectFit: 'cover',
    marginBottom: 20,
    alignSelf: 'center',
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
  cancelText: {
    color: '#1269B5',
    fontSize: 14,
    fontFamily: 'DMSans-SemiBold',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1269B5',
    borderRadius: 5,
  },
  confirmText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'DMSans-SemiBold',
  },
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
