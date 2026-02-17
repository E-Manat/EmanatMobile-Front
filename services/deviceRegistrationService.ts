import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import {apiService} from './apiService';
import {API_ENDPOINTS} from './api_endpoint';
import {getDeviceId, getPlatformNumber} from '../utils/deviceId';
import type {
  DeactivateDeviceRequest,
  RegisterDeviceRequest,
} from '../types/deviceRegistration';

export const registerDeviceWithBackend = async (
  fcmToken: string,
): Promise<boolean> => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) {
      if (__DEV__) {
        console.log('[DeviceRegistration] Skipped: no userToken (user not logged in)');
      }
      return false;
    }

    const deviceId = await getDeviceId();
    const platform = getPlatformNumber();

    const payload: RegisterDeviceRequest = {
      deviceId,
      fcmToken,
      platform,
    };

    if (__DEV__) {
      console.log('[DeviceRegistration] Sending to', `${Config.API_URL}${API_ENDPOINTS.device.register}`, {
        deviceId,
        platform,
        fcmTokenLength: fcmToken.length,
      });
    }

    await apiService.post(API_ENDPOINTS.device.register, payload);

    if (__DEV__) {
      console.log('[DeviceRegistration] Success');
    }
    return true;
  } catch (error: any) {
    if (__DEV__) {
      console.warn('[DeviceRegistration] Failed:', {
        message: error?.message,
        status: error?.status,
        responseData: error?.responseData,
      });
    }
    return false;
  }
};

export const deactivateDeviceWithBackend = async (): Promise<void> => {
  try {
    const deviceId = await getDeviceId();
    const payload: DeactivateDeviceRequest = {deviceId};
    await apiService.postWithoutAuth(
      API_ENDPOINTS.device.deactivate,
      payload,
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('Device deactivation failed:', error);
    }
  }
};
