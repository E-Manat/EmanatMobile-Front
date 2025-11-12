import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {AuthRouter} from './Auth.Router';
import {MainRouter} from './Main.Router';
import {checkTokenExpiry} from '../utils/checkTokenExpiry';
import {setNavigation} from '../services/apiService';
import {navigationRef} from '@utils/navigationUtils';
import {defaultScreenOptions} from '@utils/navigationConfig';

const RootStack = createNativeStackNavigator();

const Router = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const isExpired = await checkTokenExpiry();
      if (isExpired) {
        await AsyncStorage.multiRemove([
          'userToken',
          'expiresAt',
          'isLoggedIn',
        ]);
        setIsAuthenticated(false);
      } else {
        const token = await AsyncStorage.getItem('userToken');
        setIsAuthenticated(!!token);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
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
