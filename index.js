/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('FCM Background message:', JSON.stringify(remoteMessage));
  try {
    await Promise.resolve();
  } catch (error) {
    if (__DEV__) {
      console.warn('Background message handler error:', error);
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
