import React, {useRef, useEffect} from 'react';
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Ana səhifə'>;
const {width} = Dimensions.get('window');

const images = [
  require('../assets/img/slider1.png'),
  require('../assets/img/slider2.png'),
  require('../assets/img/slider3.png'),
];

const ImageSlider = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<NavigationProp>();
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // const handleButtonPress = () => {
  //   navigation.navigate('TaskProcess');
  // };

  return (
    <Swiper autoplay height={250} showsPagination={false}>
      {images.map((image, index) => (
        <View key={index} style={styles.imageContainer}>
          <Image source={image} style={styles.image} />
          <Animated.View
            style={[
              styles.animatedButtonWrapper,
              {transform: [{scale: scaleAnim}]},
            ]}>
            {/* <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
              <Icon name="map-marker-down" color="#fff" size={20} />
            </TouchableOpacity> */}
          </Animated.View>
        </View>
      ))}
    </Swiper>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: 250,
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
  animatedButtonWrapper: {
    position: 'absolute',
    top: 20,
    right: 10,
  },
  button: {
    width: 35,
    height: 35,
    backgroundColor: '#38C172',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default ImageSlider;
