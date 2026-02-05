import React, {useEffect, useState} from 'react';
import {View, StyleSheet, AppState} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {AuthRouter} from './Auth.Router';
import {MainRouter} from './Main.Router';
import {checkTokenExpiry} from '../utils/checkTokenExpiry';
import {setNavigation, validateTokenWithBackend} from '../services/apiService';
import {navigationRef} from '@utils/navigationUtils';
import {defaultScreenOptions} from '@utils/navigationConfig';

const RootStack = createNativeStackNavigator();

const Router = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      console.log('==================token==================');
      console.log(token);
      console.log('===============refreshToken=====================');
      console.log(refreshToken);

      if (!token || !refreshToken) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // First check local expiry
      const isExpired = await checkTokenExpiry();

      // If expired or close to expiry, validate with backend
      // This will catch cases where token was deleted from backend
      if (isExpired) {
        const isValid = await validateTokenWithBackend();
        setIsAuthenticated(isValid);
      } else {
        // Even if not expired, validate with backend to catch deleted tokens
        const isValid = await validateTokenWithBackend();
        setIsAuthenticated(isValid);
      }
    } catch (error) {
      console.error('Auth check xətası:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for app state changes to validate token when app comes to foreground
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (nextAppState === 'active') {
          const token = await AsyncStorage.getItem('userToken');
          const refreshToken = await AsyncStorage.getItem('refreshToken');

          if (token && refreshToken) {
            const isValid = await validateTokenWithBackend();
            if (!isValid) {
              setIsAuthenticated(false);
            }
          }
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (navigationRef.current) {
      setNavigation(navigationRef.current);
    }
  }, []);

  if (loading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          setNavigation(navigationRef.current);
        }}>
        <RootStack.Navigator
          screenOptions={defaultScreenOptions}
          initialRouteName={isAuthenticated ? 'Main' : 'Auth'}>
          <RootStack.Screen
            name="Main"
            component={MainRouter}
            options={{headerShown: false}}
          />
          <RootStack.Screen
            name="Auth"
            component={AuthRouter}
            options={{headerShown: false}}
          />
        </RootStack.Navigator>
      </NavigationContainer>
      <Toast />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Router;
