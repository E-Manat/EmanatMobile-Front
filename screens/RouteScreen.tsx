import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';

const YandexMapScreen = () => {
  const mapUrl = `https://yandex.com/maps/?ll=37.618423,55.751244&z=10`; // Xəritə URL-nu öz koordinatlarınızla dəyişdirin

  return (
    // <View style={{flex: 1}}>
    //   <WebView source={{uri: mapUrl}} style={{flex: 1}} />
    // </View>
    <Text>Yandex Map Screen</Text>
  );
};

export default YandexMapScreen;
