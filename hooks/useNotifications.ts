import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {apiService} from '../services/apiService';
import {API_ENDPOINTS} from '../services/api_endpoint';
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

let notificationsCache: Notification[] = [];

export const useNotifications = (filter: 'all' | 'unread') => {
  const [data, setData] = useState<Notification[]>(() => notificationsCache);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isFirstFilterRender = useRef(true);
  const dataRef = useRef<Notification[]>([]);
  dataRef.current = data;

  const fetchAll = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const raw: any[] = await apiService.get(API_ENDPOINTS.notification.get);
        const formatted = raw?.map(formatNotification) ?? [];
        setData(formatted);
        notificationsCache = formatted;
      } catch (err) {
        if (!silent) {
          setData([]);
          notificationsCache = [];
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [],
  );

  const fetchUnread = useCallback(async () => {
    setLoading(true);
    try {
      const raw: any[] = await apiService.get(
        API_ENDPOINTS.notification.getUnreads,
      );
      setData(raw?.map(formatNotification) ?? []);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByFilter = useCallback(() => {
    if (filter === 'unread') {
      fetchUnread();
    } else {
      fetchAll();
    }
  }, [filter, fetchAll, fetchUnread]);

  useFocusEffect(
    useCallback(() => {
      const silent = dataRef.current.length > 0;
      fetchAll(silent);
    }, [fetchAll]),
  );

  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    fetchByFilter();
  }, [filter, fetchByFilter]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchByFilter();
    } finally {
      setRefreshing(false);
    }
  }, [fetchByFilter]);

  const addNotification = useCallback((notification: Notification) => {
    setData(prev => {
      const next = [notification, ...prev];
      notificationsCache = next;
      return next;
    });
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiService.patch(API_ENDPOINTS.notification.markAsRead, {
        notificationId: id,
      });
    } catch (err) {
      console.error('markAsRead error:', err);
    }
  }, []);

  const updateLocalAsRead = useCallback((id: string) => {
    setData(prev => {
      const next = prev.map(item =>
        item.id === id ? {...item, unread: false} : item,
      );
      notificationsCache = next;
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.post(API_ENDPOINTS.notification.markAllAsRead, {});
      setData(d => {
        const next = d.map(x => ({...x, unread: false}));
        notificationsCache = next;
        return next;
      });
      Toast.show({type: 'success', text1: 'Bütün bildirişlər oxundu.'});
    } catch (err) {
      Toast.show({type: 'error', text1: 'Xəta', text2: 'İşarələnmədi.'});
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await apiService.delete(API_ENDPOINTS.notification.delete, {
        notificationId: id,
      });
      setData(prev => {
        const next = prev.filter(item => item.id !== id);
        notificationsCache = next;
        return next;
      });
      Toast.show({type: 'success', text1: 'Bildiriş silindi'});
    } catch (err) {
      console.error('deleteNotification error:', err);
    }
  }, []);

  const deleteSelected = useCallback(async (ids: string[]) => {
    try {
      await apiService.delete(API_ENDPOINTS.notification.deleteSelected, {
        notificationIds: ids,
      });
      setData(prev => {
        const next = prev.filter(item => !ids.includes(item.id));
        notificationsCache = next;
        return next;
      });
      Toast.show({type: 'success', text1: 'Seçilmiş bildirişlər silindi'});
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Xəta baş verdi',
        text2: 'Bildirişlər silinmədi',
      });
    }
  }, []);

  const deleteAll = useCallback(async () => {
    try {
      await apiService.delete(API_ENDPOINTS.notification.deleteAll, {});
      setData([]);
      notificationsCache = [];
      Toast.show({type: 'success', text1: 'Bütün bildirişlər silindi'});
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Xəta baş verdi',
        text2: 'Bildirişlər silinmədi',
      });
    }
  }, []);

  const filteredData = useMemo(() => {
    const list =
      filter === 'all' ? data : data.filter(item => item.unread);
    return [...list].sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0));
  }, [filter, data]);

  return {
    data,
    filteredData,
    loading,
    refreshing,
    fetchAll,
    refresh,
    addNotification,
    markAsRead,
    updateLocalAsRead,
    markAllAsRead,
    deleteNotification,
    deleteSelected,
    deleteAll,
  };
};
