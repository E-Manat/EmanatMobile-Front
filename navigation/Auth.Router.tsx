import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpScreen from '../screens/OtpScreen';
import OtpSubmitScreen from '../screens/OtpSubmitScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import {Routes} from './routes';
import {authStackScreenOption} from '@utils/navigationConfig';
import {View} from 'react-native';
import {AuthStackParamList} from 'types/types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export const AuthRouter = () => {
  return (
    <View style={{flex: 1}}>
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
    </View>
  );
};
