import {useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import Toast from 'react-native-toast-message';
import * as signalR from '@microsoft/signalr';
import Config from 'react-native-config';
import {formatDate, formatTime} from '../utils/notificationUtils';
import type {Notification} from '../types/notification';

const formatNotification = (item: any): Notification => ({
  id: item.id,
  title: item.title,
  text: item.message,
  unread: !item.isRead,
  time: formatTime(item.createdAt),
  date: formatDate(item.createdAt),
});

const playNotificationSound = () => {
  const ding = new Sound('notification.mp3', Sound.MAIN_BUNDLE, error => {
    if (!error) {
      ding.play(() => ding.release());
    }
  });
};

export const useSignalRNotifications = (onReceive: (n: Notification) => void) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const onReceiveRef = useRef(onReceive);
  onReceiveRef.current = onReceive;

  useEffect(() => {
    let cancelled = false;

    const connect = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token || connectionRef.current || cancelled) return;

        const connection = new signalR.HubConnectionBuilder()
          .withUrl(`${Config.SIGNALR_URL}`, {
            accessTokenFactory: () => token,
          })
          .withAutomaticReconnect()
          .configureLogging(
            __DEV__ ? signalR.LogLevel.Information : signalR.LogLevel.Warning,
          )
          .build();

        connectionRef.current = connection;

        connection.off('ReceiveNotification');
        connection.on('ReceiveNotification', (notification: any) => {
          const formatted = formatNotification(notification);
          onReceiveRef.current(formatted);

          Toast.show({
            type: 'success',
            text1: notification.title,
            text2: notification.message,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
          });

          playNotificationSound();
        });

        if (cancelled) return;
        await connection.start();
        if (cancelled) {
          await connection.stop();
          connectionRef.current = null;
          return;
        }
      } catch (err) {
        if (!cancelled) console.error('SignalR connection error:', err);
      }
    };

    connect();

    return () => {
      cancelled = true;
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, []);
};
