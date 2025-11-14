import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {navigationRef, reset} from '@utils/navigationUtils';
import {SvgImage} from './SvgImage';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const BUTTON_SIZE = 50;
const MARGIN = 10;

const DraggableTaskButton = () => {
  const pan = useRef(
    new Animated.ValueXY({
      x: SCREEN_WIDTH - BUTTON_SIZE - MARGIN,
      y: SCREEN_HEIGHT - 200,
    }),
  ).current;
  const [isVisible, setIsVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const checkCurrentTask = async () => {
      const task = await AsyncStorage.getItem('currentTask');
      setIsVisible(!!task);
    };

    checkCurrentTask();
    const interval = setInterval(checkCurrentTask, 2000);
    return () => clearInterval(interval);
  }, []);

  const panOffset = useRef({x: 0, y: 0}).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
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
  }, [scaleAnim]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      panOffset.x = (pan.x as any).__getValue();
      panOffset.y = (pan.y as any).__getValue();
      pan.setOffset(panOffset);
      pan.setValue({x: 0, y: 0});
    },
    onPanResponderMove: (_, gestureState) => {
      let newX = panOffset.x + gestureState.dx;
      let newY = panOffset.y + gestureState.dy;

      newX = Math.max(
        MARGIN,
        Math.min(SCREEN_WIDTH - BUTTON_SIZE - MARGIN, newX),
      );
      newY = Math.max(
        MARGIN,
        Math.min(SCREEN_HEIGHT - BUTTON_SIZE - MARGIN, newY),
      );

      pan.setValue({x: newX - panOffset.x, y: newY - panOffset.y});
    },
    onPanResponderRelease: () => {
      pan.flattenOffset();
      panOffset.x = (pan.x as any).__getValue();
      panOffset.y = (pan.y as any).__getValue();
    },
  });

  const handlePress = async () => {
    const task = await AsyncStorage.getItem('currentTask');
    if (task && navigationRef.current) {
      const taskData = JSON.parse(task);
      navigationRef.current.navigate(
        'TaskProcess' as never,
        {taskData} as never,
      );
    }
  };

  return (
    <Animated.View
      style={[styles.buttonContainer, pan.getLayout()]}
      {...panResponder.panHandlers}>
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <TouchableOpacity onPress={handlePress} style={styles.button}>
          <SvgImage
            color="#fff"
            source={require('assets/icons/svg/timer.svg')}
          />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    zIndex: 999,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#1269B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DraggableTaskButton;
