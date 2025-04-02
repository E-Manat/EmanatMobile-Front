import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Dot from 'react-native-vector-icons/Octicons';

import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PinSetup'>;

interface Task {
  id: string;
  date: string;
  status: 'İcra olunub' | 'İcra olunur' | 'İcra olunmamış';
  route: string;
  terminal: number;
  distance: string;
  address?: string;
  hours?: string;
  phone?: string;
}
const TasksScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Hamısı');

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return '#F44336'; // Canceled
      case 1:
        return '#FFC107'; // Pending
      case 2:
        return '#00C0EF'; // InProgress
      case 3:
        return '#4CAF50'; // Completed
      default:
        return '#CCC';
    }
  };
  const API_URL = 'http://192.168.10.119:5206/mobile/CollectorTask/GetAll';

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tasksData, setTasksData] = useState<any>([]);

  const navigation = useNavigation<NavigationProp>();
  const [filteredTasks, setFilteredTasks] = useState<any>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setError('User token tapılmadı');
          setLoading(false);
          return;
        }

        console.log('📌 Token:', token);

        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('✅ Task Data:', response.data);
        setTasksData(response.data);
        setFilteredTasks(response.data.tasks);
      } catch (err: any) {
        console.log('🚨 API Xətası:', err);
        setError('Məlumatlar yüklənmədi');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filterTasks = (filter: any) => {
    let filtered = [...tasksData.tasks];
    if (filter === 'İcra olunan') {
      filtered = filtered.filter((task: any) => task.status === 2); // InProgress
    } else if (filter === 'İcra olunmuş') {
      filtered = filtered.filter((task: any) => task.status === 3); // Completed
    } else if (filter === 'İcra olunmamış') {
      filtered = filtered.filter((task: any) => task.status === 1); // Pending
    }
    setSelectedFilter(filter);
    setFilteredTasks(filtered); // Update filtered tasks
  };

  const renderTask = ({item}: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TerminalEtrafli', {taskData: item})}>
      <View
        style={[
          styles.taskCard,
          {borderLeftWidth: 3, borderLeftColor: getStatusColor(item.status)},
        ]}>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>Terminal ID : {item.code}</Text>
          <Text style={styles.taskText}>Rota: {item.routeName}</Text>
        </View>
        <Text style={styles.taskDistance}>Adress: {item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Tapşırıqlar</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>{tasksData?.remainingTaskCount}</Text>
          <Text style={styles.statusLabel}>Icra olunan</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>{tasksData?.completedTaskCount}</Text>
          <Text style={styles.statusLabel}>İcra olunmuş</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>{tasksData?.pendingTaskCount}</Text>
          <Text style={styles.statusLabel}>Qalan</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContentContainer}>
          {['Hamısı', 'İcra olunmamış', 'İcra olunan', 'İcra olunmuş'].map(
            filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.activeFilter,
                ]}
                onPress={() => filterTasks(filter)}>
                <Dot
                  name="dot-fill"
                  size={16}
                  color={getStatusColor(
                    filter === 'Hamısı'
                      ? -1
                      : filter === 'İcra olunan'
                      ? 2
                      : filter === 'İcra olunmuş'
                      ? 3
                      : 1,
                  )}
                  style={{marginRight: 6}}
                />
                <Text style={styles.filterText}>{filter}</Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.mainContainer}>
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={renderTask}
          ListFooterComponent={<View style={{height: 20}} />}
        />
      </ScrollView>
    </View>
  );
};

export default TasksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2D64AF',
    height: 80,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 20,
    margin: 'auto',
    transform: [{translateY: -30}],
    width: '80%',
    zIndex: 3,
    backgroundColor: '#fff',
    elevation: 1, // Android için yeterli
    borderRadius: 10,
  },
  statusItem: {
    alignItems: 'center',
    width: '31%',
    justifyContent: 'space-between',
  },
  statusText: {fontSize: 20, fontWeight: 'bold', color: '#001D45'},
  statusLabel: {fontSize: 12, color: '#A8A8A8'},
  filterContainer: {
    paddingHorizontal: 15,
  },
  filterContentContainer: {
    flexDirection: 'row',
  },
  activeFilter: {
    borderWidth: 1,
    borderColor: '#2D64AF',
    borderStyle: 'solid',
  },
  mainContainer: {
    marginTop: 25,
    paddingHorizontal: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 7,
    marginRight: 5,
  },
  filterText: {
    fontWeight: '500',
    fontSize: 12,
    color: '#001D45',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 9,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#001D45',
  },
  taskText: {
    fontSize: 12,
    color: '#A8A8A8',
  },
  taskDistance: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A8A8A8',
  },
});
