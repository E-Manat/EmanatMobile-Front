import React from 'react';
import {View, Image, Dimensions, StyleSheet} from 'react-native';
import Swiper from 'react-native-swiper';

const {width} = Dimensions.get('window');

const images = [
  require('../assets/img/slider1.png'),
  require('../assets/img/slider2.png'),
  require('../assets/img/slider3.png'),
];

const ImageSlider = () => {
  return (
    <Swiper autoplay height={200} showsPagination={false}>
      {images.map((image, index) => (
        <View key={index} style={styles.imageContainer}>
          <Image source={image} style={styles.image} />
        </View>
      ))}
    </Swiper>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    resizeMode: 'contain',
    height: '100%',
    borderRadius: 20,
  },
});

export default ImageSlider;
