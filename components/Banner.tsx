import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';

const Banner = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/img/slider1.png')}
        style={styles.image}
      />
    </View>
  );
};

export default Banner;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
});
