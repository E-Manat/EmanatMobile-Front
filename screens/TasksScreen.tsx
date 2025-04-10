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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Dot from 'react-native-vector-icons/Octicons';

import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import {apiService} from '../services/apiService';
import TopHeader from '../components/TopHeader';

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
      case 5:
        return '#EF4444'; // Canceled (Ləğv edilib)
      case 3:
      case 2:
      case 1:
        return '#FFB600'; // In progress (İcra olunur)
      case 4:
        return '#29C0B9'; // Completed (Tamamlanıb)
      case 0:
        return '#9E9E9E'; // Not started (Başlanmayıb)
      default:
        return '#CCC';
    }
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tasksData, setTasksData] = useState<any>([]);

  const navigation = useNavigation<NavigationProp>();
  const [filteredTasks, setFilteredTasks] = useState<any>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const userRole = await AsyncStorage.getItem('roleName');
        const endpoint =
          userRole === 'Collector'
            ? '/mobile/CollectorTask/GetAll'
            : '/mobile/TechnicianTask/GetAll';
        const response = await apiService.get(endpoint);
        console.log(response, 'response');
        setTasksData(response);
        setFilteredTasks(response.tasks);
      } catch (error) {
        console.error('Reportlar alınarkən xəta:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filterTasks = (filter: any) => {
    let filtered = [...tasksData.tasks];
    switch (filter) {
      case 'İcra olunmamış':
        filtered = filtered.filter((task: any) => task.status === 0); // NotStarted
        break;
      case 'İcra olunan':
        filtered = filtered.filter((task: any) =>
          [1, 2, 3].includes(task.status),
        ); // InTransit, Arrived, CollectionInProgress
        break;
      case 'İcra olunmuş':
        filtered = filtered.filter((task: any) => task.status === 4); // Completed
        break;
      case 'Ləğv edilmiş':
        filtered = filtered.filter((task: any) => task.status === 5); // Canceled
        break;
      default:
        break;
    }

    setSelectedFilter(filter);
    setFilteredTasks(filtered);
  };

  const renderTask = ({item}: any) => (
    <TouchableOpacity
      onPress={async () => {
        try {
          setLoading(true);
          const taskDetails = await apiService.get(
            `/mobile/CollectorTask/GetById?id=${item.id}`,
          );
          navigation.navigate('TerminalEtrafli', {taskData: taskDetails});
        } catch (err) {
          console.error('Detalları alarkən xəta:', err);
        } finally {
          setLoading(false);
        }
      }}>
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
      <TopHeader title="Tapşırıqlar" />
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            {tasksData?.remainingTaskCount || 0}
          </Text>
          <Text style={styles.statusLabel}>Icra olunan</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            {tasksData?.completedTaskCount || 0}
          </Text>
          <Text style={styles.statusLabel}>İcra olunmuş</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            {tasksData?.pendingTaskCount || 0}
          </Text>
          <Text style={styles.statusLabel}>Qalan</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContentContainer}>
          {[
            'Hamısı',
            'İcra olunmamış',
            'İcra olunan',
            'İcra olunmuş',
            'Ləğv edilmiş',
          ].map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilter,
              ]}
              onPress={() => filterTasks(filter)}>
              {filter !== 'Hamısı' && (
                <Dot
                  name="dot-fill"
                  size={16}
                  color={getStatusColor(
                    filter === 'İcra olunan'
                      ? 1
                      : filter === 'İcra olunmuş'
                      ? 4
                      : filter === 'Ləğv edilmiş'
                      ? 5
                      : 0,
                  )}
                  style={{marginRight: 6}}
                />
              )}
              <Text style={styles.filterText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.mainContainer}>
        {loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#2D64AF" />
          </View>
        ) : filteredTasks?.length > 0 ? (
          <FlatList
            data={filteredTasks}
            keyExtractor={item => item.id}
            renderItem={renderTask}
            ListFooterComponent={<View style={{height: 20}} />}
          />
        ) : (
          <Text style={styles.noResult}>Nəticə tapılmadı</Text>
        )}
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
  noResult: {
    textAlign: 'center',
    color: '#A8A8A8',
    fontSize: 16,
    marginTop: 20,
  },
});
