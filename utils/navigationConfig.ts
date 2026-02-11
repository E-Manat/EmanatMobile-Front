import {NativeStackNavigationOptions} from '@react-navigation/native-stack';

export const defaultScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  animation: 'slide_from_right',
};

export const authStackScreenOption: NativeStackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  animation: 'slide_from_right',
};

export const modalStackScreenOption: NativeStackNavigationOptions = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  headerShown: false,
};
