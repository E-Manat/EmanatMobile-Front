import {useCallback, useEffect, useRef, useState} from 'react';
import {NotificationService} from '../src/services/notificationService';
import type {FirebaseMessagingTypes} from '@react-native-firebase/messaging';

type UsePushNotificationsOptions = {
  onForegroundMessage?: (message: FirebaseMessagingTypes.RemoteMessage) => void;
  onTokenReceived?: (token: string) => void;
  requestPermissionOnMount?: boolean;
};

export const usePushNotifications = (
  options: UsePushNotificationsOptions = {},
) => {
  const {
    onForegroundMessage,
    onTokenReceived,
    requestPermissionOnMount = true,
  } = options;

  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const onForegroundRef = useRef(onForegroundMessage);
  const onTokenRef = useRef(onTokenReceived);
  onForegroundRef.current = onForegroundMessage;
  onTokenRef.current = onTokenReceived;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (__DEV__) {
        console.log(
          '[PushNotifications] usePushNotifications: requestPermission start',
        );
      }
      setIsLoading(true);
      const granted = await NotificationService.requestPermission();
      if (__DEV__) {
        console.log(
          '[PushNotifications] usePushNotifications: permission granted=',
          granted,
        );
      }
      setHasPermission(granted);
      if (granted) {
        const token = await NotificationService.getToken();
        if (__DEV__) {
          console.log(
            '[PushNotifications] usePushNotifications: token received=',
            !!token,
          );
        }
        if (token) {
          setFcmToken(token);
          onTokenRef.current?.(token);
        }
      }
      return granted;
    } catch (error) {
      if (__DEV__) {
        console.warn(
          '[PushNotifications] usePushNotifications: requestPermission error',
          error,
        );
      }
      setHasPermission(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await NotificationService.getToken();
      if (token) {
        setFcmToken(token);
        onTokenRef.current?.(token);
      }
      return token;
    } catch (error) {
      if (__DEV__) {
        console.warn('usePushNotifications: getToken error', error);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        if (__DEV__) {
          console.log(
            '[PushNotifications] usePushNotifications: init, requestPermissionOnMount=',
            requestPermissionOnMount,
          );
        }
        if (requestPermissionOnMount) {
          await requestPermission();
        } else {
          const token = await NotificationService.getToken();
          if (token && !cancelled) {
            setFcmToken(token);
            setHasPermission(true);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn(
            '[PushNotifications] usePushNotifications: init error',
            err,
          );
        }
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    const cleanupForeground = NotificationService.setupForegroundListener(
      message => {
        if (!cancelled) {
          onForegroundRef.current?.(message);
        }
      },
    );

    const cleanupTokenRefresh = NotificationService.setupTokenRefreshListener(
      token => {
        if (!cancelled) {
          setFcmToken(token);
          onTokenRef.current?.(token);
        }
      },
    );

    return () => {
      cancelled = true;
      cleanupForeground();
      cleanupTokenRefresh();
    };
  }, [requestPermissionOnMount]);

  return {
    fcmToken,
    hasPermission,
    isLoading,
    requestPermission,
    getToken,
  };
};
