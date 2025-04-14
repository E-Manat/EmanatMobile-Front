import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';

const {width, height} = Dimensions.get('window');
const BUTTON_SIZE = 40;
const MARGIN = 10;
const SAFE_AREA_BOTTOM = 50;

const DraggableTaskButton = () => {
  const position = useRef(new Animated.ValueXY({x: 20, y: 400})).current;
  const scale = useRef(new Animated.Value(1)).current;
  const lastOffset = useRef({x: 20, y: 400}).current;
  const [visible, setVisible] = useState(false);
  type NavigationProp = StackNavigationProp<RootStackParamList, 'TaskProcess'>;
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const checkCurrentTask = async () => {
      const currentTask = await AsyncStorage.getItem('currentTask');
      setVisible(!!currentTask);
    };

    checkCurrentTask();

    const interval = setInterval(checkCurrentTask, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const newX = lastOffset.x + gestureState.dx;
        const newY = lastOffset.y + gestureState.dy;

        const limitedX = Math.max(
          MARGIN,
          Math.min(newX, width - BUTTON_SIZE - MARGIN),
        );
        const limitedY = Math.max(
          MARGIN,
          Math.min(newY, height - BUTTON_SIZE - MARGIN - SAFE_AREA_BOTTOM),
        );

        position.setValue({x: limitedX, y: limitedY});
      },
      onPanResponderRelease: (e, gestureState) => {
        lastOffset.x = Math.max(
          MARGIN,
          Math.min(
            lastOffset.x + gestureState.dx,
            width - BUTTON_SIZE - MARGIN,
          ),
        );

        lastOffset.y = Math.max(
          MARGIN,
          Math.min(
            lastOffset.y + gestureState.dy,
            height - BUTTON_SIZE - MARGIN - SAFE_AREA_BOTTOM,
          ),
        );
      },
    }),
  ).current;

  const handlePress = async () => {
    const task = await AsyncStorage.getItem('currentTask');
    if (task) {
      const taskData = JSON.parse(task);
      navigation.navigate('TaskProcess', {taskData});
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.draggable,
        {
          transform: [
            {translateX: position.x},
            {translateY: position.y},
            {scale},
          ],
        },
      ]}>
      <TouchableOpacity onPress={handlePress}>
        <Icon color="#fff" name="share-location" size={24} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default DraggableTaskButton;

const styles = StyleSheet.create({
  draggable: {
    position: 'absolute',
    borderRadius: BUTTON_SIZE / 2,
    zIndex: 9999,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: '#38C172',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
