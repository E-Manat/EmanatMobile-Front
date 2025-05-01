import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';

const {width, height} = Dimensions.get('window');
const BUTTON_SIZE = 50;
const MARGIN = 10;
const SAFE_AREA_BOTTOM = 50;

const DraggableTaskButton = () => {
  const position = useRef(new Animated.ValueXY({x: 20, y: 400})).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [visible, setVisible] = useState(false);
  const lastTap = useRef<number>(0);

  type NavigationProp = StackNavigationProp<RootStackParamList, 'TaskProcess'>;
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const checkCurrentTask = async () => {
      const currentTask = await AsyncStorage.getItem('currentTask');
      setVisible(!!currentTask);
    };

    checkCurrentTask();
    const interval = setInterval(checkCurrentTask, 1500);
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
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value,
        });
        position.setValue({x: 0, y: 0});
      },
      onPanResponderMove: (e, gestureState) => {
        const newX = gestureState.dx + position.x._offset;
        const newY = gestureState.dy + position.y._offset;

        const limitedX = Math.max(
          MARGIN,
          Math.min(newX, width - BUTTON_SIZE - MARGIN),
        );
        const limitedY = Math.max(
          MARGIN,
          Math.min(newY, height - BUTTON_SIZE - MARGIN - SAFE_AREA_BOTTOM),
        );

        position.x.setValue(limitedX - position.x._offset);
        position.y.setValue(limitedY - position.y._offset);
      },
      onPanResponderRelease: () => {
        position.flattenOffset();
      },
    }),
  ).current;

  const handlePress = async () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double click - heç nə etmə
      return;
    }
    lastTap.current = now;

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
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.buttonTouchable}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
        <Icon color="#fff" name="share-location" size={26} />
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
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  buttonTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
