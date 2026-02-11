import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TasksScreen from '../screens/TasksScreen';
import TerminalDetailsScreen from '../screens/TerminalDetailsScreen';

const Stack = createNativeStackNavigator();

const TasksStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="TasksMain" component={TasksScreen} />
      <Stack.Screen name="TerminalEtrafli" component={TerminalDetailsScreen} />
    </Stack.Navigator>
  );
};

export default TasksStackNavigator;
