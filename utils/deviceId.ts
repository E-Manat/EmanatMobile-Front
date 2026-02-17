import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

const DEVICE_ID_KEY = '@device_id';

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getDeviceId = async (): Promise<string> => {
  try {
    let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = generateId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return generateId();
  }
};

export const getPlatform = (): 'ios' | 'android' => {
  return Platform.OS === 'ios' ? 'ios' : 'android';
};

export const getPlatformNumber = (): number => {
  return Platform.OS === 'ios' ? 0 : 1;
};
