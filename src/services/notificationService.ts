import {Platform, PermissionsAndroid} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import type {FirebaseMessagingTypes} from '@react-native-firebase/messaging';

export type NotificationPayload = {
  title?: string;
  body?: string;
  data?: Record<string, string>;
};

export type ForegroundMessageHandler = (
  message: FirebaseMessagingTypes.RemoteMessage,
) => void;
export type TokenRefreshHandler = (token: string) => void;

class NotificationServiceClass {
  private foregroundUnsubscribe: (() => void) | null = null;
  private tokenRefreshUnsubscribe: (() => void) | null = null;
  private foregroundHandler: ForegroundMessageHandler | null = null;
  private tokenHandler: TokenRefreshHandler | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      if (__DEV__) {
        console.log(
          '[PushNotifications] requestPermission: platform=',
          Platform.OS,
        );
      }
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (__DEV__) {
          console.log(
            '[PushNotifications] requestPermission: android result=',
            granted,
          );
        }
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      const authStatus = await messaging().requestPermission();
      if (__DEV__) {
        console.log(
          '[PushNotifications] requestPermission: ios authStatus=',
          authStatus,
        );
      }
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    } catch (error) {
      if (__DEV__) {
        console.warn('[PushNotifications] requestPermission failed', error);
      }
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (__DEV__) {
        console.log('[PushNotifications] getToken: platform=', Platform.OS);
      }
      if (Platform.OS === 'ios') {
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
          if (__DEV__) {
            console.log('[PushNotifications] getToken: ios permission denied');
          }
          return null;
        }
      }
      const token = await messaging().getToken();
      if (__DEV__) {
        console.log(
          '[PushNotifications] getToken: success, token=',
          token + '...',
        );
      }
      return token;
    } catch (error) {
      if (__DEV__) {
        console.warn('[PushNotifications] getToken failed', error);
      }
      return null;
    }
  }

  setupForegroundListener(handler: ForegroundMessageHandler): () => void {
    if (this.foregroundUnsubscribe) {
      this.foregroundUnsubscribe();
    }
    this.foregroundHandler = handler;
    this.foregroundUnsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('FCM Foreground message:', JSON.stringify(remoteMessage));
      if (__DEV__) {
        console.log(
          '[PushNotifications] foreground message received',
          remoteMessage,
        );
      }
      try {
        this.foregroundHandler?.(remoteMessage);
      } catch (err) {
        if (__DEV__) {
          console.warn('[PushNotifications] foreground handler error', err);
        }
      }
    });
    return () => {
      this.foregroundUnsubscribe?.();
      this.foregroundUnsubscribe = null;
      this.foregroundHandler = null;
    };
  }

  setupTokenRefreshListener(handler: TokenRefreshHandler): () => void {
    if (this.tokenRefreshUnsubscribe) {
      this.tokenRefreshUnsubscribe();
    }
    this.tokenHandler = handler;
    this.tokenRefreshUnsubscribe = messaging().onTokenRefresh(token => {
      if (__DEV__) {
        console.log(
          '[PushNotifications] token refreshed',
          token?.slice(0, 20) + '...',
        );
      }
      try {
        this.tokenHandler?.(token);
      } catch (err) {
        if (__DEV__) {
          console.warn('[PushNotifications] token refresh handler error', err);
        }
      }
    });
    return () => {
      this.tokenRefreshUnsubscribe?.();
      this.tokenRefreshUnsubscribe = null;
      this.tokenHandler = null;
    };
  }

  cleanup(): void {
    this.foregroundUnsubscribe?.();
    this.foregroundUnsubscribe = null;
    this.foregroundHandler = null;
    this.tokenRefreshUnsubscribe?.();
    this.tokenRefreshUnsubscribe = null;
    this.tokenHandler = null;
  }
}

export const NotificationService = new NotificationServiceClass();
