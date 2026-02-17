import React from 'react';
import {StatusBar} from 'react-native';
import {enableScreens} from 'react-native-screens';
import Router from './navigation/Router';
import {usePushNotifications} from './hooks/usePushNotifications';
import {registerDeviceWithBackend} from './services/deviceRegistrationService';
import 'react-native-url-polyfill/auto';

enableScreens();

const AppContent = () => {
  usePushNotifications({
    requestPermissionOnMount: true,
    onTokenReceived: async token => {
      console.log('FCM TOKEN:', token);
      if (__DEV__) {
        console.log(
          '[PushNotifications] onTokenReceived, registering with backend...',
        );
      }
      const success = await registerDeviceWithBackend(token);
      if (__DEV__) {
        console.log(
          '[PushNotifications] Backend registration',
          success ? 'success' : 'failed',
        );
      }
    },
  });

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Router />
    </>
  );
};

const App = () => (
  <>
    <AppContent />
  </>
);

export default App;
