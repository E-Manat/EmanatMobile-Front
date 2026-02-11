import {Platform} from 'react-native';

export const isAndroid = Platform.OS === 'android';
export const isIos = Platform.OS === 'ios';
export const platformString = String(Platform.OS);

export const keyboardShowEvent = isIos ? 'keyboardWillShow' : 'keyboardDidShow';
export const keyboardHideEvent = isIos ? 'keyboardWillHide' : 'keyboardDidHide';
