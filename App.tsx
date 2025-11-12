import React from 'react';
import {StatusBar} from 'react-native';
import {enableScreens} from 'react-native-screens';
import Router from './navigation/Router';
import 'react-native-url-polyfill/auto';

enableScreens();

const App = () => {
  return (
    <>
      <StatusBar />
      <Router />
    </>
  );
};

export default App;
