import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpScreen from '../screens/OtpScreen';
import OtpSubmitScreen from '../screens/OtpSubmitScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import {Routes} from './routes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {authStackScreenOption} from '@utils/navigationConfig';

const AuthStack = createNativeStackNavigator();

export const AuthRouter = () => {
  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'bottom']}>
      <AuthStack.Navigator
        screenOptions={authStackScreenOption}
        initialRouteName={Routes.login}>
        <AuthStack.Screen name={Routes.login} component={LoginScreen} />
        <AuthStack.Screen
          name={Routes.forgotPassword}
          component={ForgotPasswordScreen}
        />
        <AuthStack.Screen name={Routes.otp} component={OtpScreen} />
        <AuthStack.Screen name={Routes.otpSubmit} component={OtpSubmitScreen} />
        <AuthStack.Screen
          name={Routes.newPassword}
          component={NewPasswordScreen}
        />
      </AuthStack.Navigator>
    </SafeAreaView>
  );
};
