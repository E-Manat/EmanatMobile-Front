import React, {memo, useCallback} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {SvgImage} from '@components/SvgImage';
import type {Notification} from '../types/notification';

const styles = StyleSheet.create({
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
  swipeDelete: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  swipeDeleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

interface NotificationItemProps {
  item: Notification;
  isSelected: boolean;
  selectionMode: boolean;
  onPress: (item: Notification) => void;
  onLongPress: (id: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  item,
  isSelected,
  selectionMode,
  onPress,
  onLongPress,
  onSelect,
  onDelete,
}) => {
  const handlePress = useCallback(() => {
    if (selectionMode) {
      onSelect(item.id);
    } else {
      onPress(item);
    }
  }, [selectionMode, item, onPress, onSelect]);

  const handleLongPress = useCallback(() => {
    onLongPress(item.id);
  }, [item.id, onLongPress]);

  const renderRightActions = useCallback(
    () => (
      <TouchableOpacity
        onPress={() => onDelete(item.id)}
        style={styles.swipeDelete}>
        <Text style={styles.swipeDeleteText}>Sil</Text>
      </TouchableOpacity>
    ),
    [item.id, onDelete],
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
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

export const NotificationItem = memo(NotificationItemComponent);
