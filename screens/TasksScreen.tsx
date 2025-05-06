import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import Dot from 'react-native-vector-icons/Octicons';

import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import {apiService} from '../services/apiService';
import TopHeader from '../components/TopHeader';
import Toast from 'react-native-toast-message';
import * as signalR from '@microsoft/signalr';
import {RefreshIcon} from '../assets/icons';
type NavigationProp = StackNavigationProp<RootStackParamList, 'PinSetup'>;
import Config from 'react-native-config';
interface Task {
  id: string;
  date: string;
  status: 'Tamamlanıb' | 'İcra olunur' | 'İcra olunmamış';
  route: string;
  terminal: number;
  distance: string;
  address?: string;
  hours?: string;
  phone?: string;
}
const TasksScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('İcra olunan');

  const getStatusColor = (status: number) => {
    switch (status) {
      case 5:
        return '#EF4444'; // Canceled (Ləğv edilib)
      case 1:
      case 2:
      case 3:
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

  const tasksRef = useRef<Task[]>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    tasksRef.current = filteredTasks;
  }, [filteredTasks]);

  const fetchTasks = async (statusFilter?: number) => {
    try {
      setLoading(true);
      const userRole = await AsyncStorage.getItem('roleName');
      const endpointBase =
        userRole === 'Collector'
          ? '/mobile/CollectorTask/GetAll'
          : '/mobile/TechnicianTask/GetAll';

      const url =
        statusFilter !== undefined
          ? `${endpointBase}?status=${statusFilter}`
          : endpointBase;

      console.log(url, 'url');
      const response = await apiService.get(url);
      setTasksData(response);
      setFilteredTasks(response.tasks);
    } catch (error) {
      console.error('Reportlar alınarkən xəta:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks(); // Default olaraq bütün dataları gətir
    }, []),
  );

  const filterTasks = (filter: string) => {
    setSelectedFilter(filter);

    switch (filter) {
      case 'İcra olunmamış':
        fetchTasks(0); // Not started
        break;
      case 'İcra olunan':
        fetchTasks(1); // Backdə 1, 2, 3 ümumiyyətlə 1-lə gələcək kimi qəbul edirik
        break;
      case 'Tamamlanıb':
        fetchTasks(4); // Completed
        break;
      case 'Ləğv edilmiş':
        fetchTasks(5); // Cancelled
        break;
      case 'Hamısı':
      default:
        fetchTasks(); // Statussuz bütün datalar
        break;
    }
  };

  console.log(tasksData, 'tasksData');

  const renderTask = ({item}: any) => (
    <TouchableOpacity
      onPress={async () => {
        try {
          setLoading(true);
          const taskDetails = await apiService.get(
            `/mobile/CollectorTask/GetById?id=${item.id}`,
          );
          console.log(taskDetails, 'taskDetails');
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
          {borderLeftWidth: 4, borderLeftColor: getStatusColor(item.status)},
        ]}>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>Terminal ID : {item.code}</Text>
          <Text style={styles.taskDistance}>Adress: {item.address}</Text>
        </View>
        <View>
          <Dot
            name="dot-fill"
            size={16}
            color={getStatusColor(item.status)}
            style={{marginRight: 6}}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const connectSignalR = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token || connectionRef.current) return;

        const connection = new signalR.HubConnectionBuilder()
          .withUrl(
            `https://emanat-api.siesco.studio/notification/hubs/mobile`,
            {
              accessTokenFactory: () => token,
            },
          )
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information)
          .build();

        connection.on('CollectorTaskCreated', (notification: any) => {
          const alreadyExists = tasksRef.current.some(
            t => t.id === notification.taskId,
          );
          if (alreadyExists) return;

          const newTask: any = {
            id: notification.taskId,
            status: notification.status,
            address: notification.terminalAddress,
            code: notification.terminalCode,
          };

          setFilteredTasks((prev: any) => [...prev, newTask]);

          Toast.show({
            type: 'success',
            text1: `Yeni Task: ${notification.terminalCode}`,
            text2: notification.terminalAddress,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
          });
        });

        await connection.start();
        connectionRef.current = connection;
      } catch (err) {
        console.error('❌ SignalR bağlantı xətası:', err);
      }
    };

    connectSignalR();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <TopHeader
        title="Tapşırıqlar"
        onRightPress={() => fetchTasks()}
        rightIconComponent={<RefreshIcon color="#fff" />}
      />
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            {tasksData?.pendingTaskCount || 0}
          </Text>
          <Text style={styles.statusLabel}>Gözləyən</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            {tasksData?.inProgressTaskCount || 0}
          </Text>
          <Text style={styles.statusLabel}>Icra olunan</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>
            {tasksData?.completedTaskCount || 0}
          </Text>
          <Text style={styles.statusLabel}>Tamamlanmış</Text>
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
            'Tamamlanıb',
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
                      : filter === 'Tamamlanıb'
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

      {filteredTasks?.length > 0 && (
        <Text style={styles.currentDay}>Bu gün</Text>
      )}

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
          <View style={styles.noResult}>
            <Image
              source={require('../assets/img/tasks_empty.png')}
              style={styles.noContentImage}
            />
            <Text style={styles.noContentLabel}>
              Sizin heç bir tapşırığınız yoxdur
            </Text>
            <Text style={styles.noContentText}>
              Yeni tapşırığlar burada görünəcək.
            </Text>
          </View>
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
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 30,
    margin: 'auto',
    transform: [{translateY: -50}],
    width: '80%',
    zIndex: 3,
    backgroundColor: '#fff',
    shadowColor: 'rgba(83, 121, 198, 0.95)',
    shadowRadius: 6,
    elevation: 3,
    borderRadius: 10,
  },
  statusItem: {
    alignItems: 'center',
    width: '31%',
    justifyContent: 'space-between',
  },
  statusText: {
    color: '#095291',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 26,
  },
  statusLabel: {
    color: '#616161',
    textAlign: 'center',
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 5,
  },
  filterContainer: {
    paddingHorizontal: 15,
    transform: [{translateY: -20}],
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
    marginTop: 15,
    paddingHorizontal: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 5,
    borderRadius: 5,
    backgroundColor: '#F5F9FC',
  },
  filterText: {
    color: '#063A66',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 18,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  taskTitle: {
    color: '#1269B5',
    fontFamily: 'DMSans-SemiBold', // və ya əlavə etdiyin font adı
    fontSize: 14,
    lineHeight: 21,
  },
  taskText: {
    fontSize: 12,
    color: '#A8A8A8',
  },
  taskDistance: {
    color: '#616161',
    fontFamily: 'DMSans-Regular', // və ya əlavə etdiyin font adı
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18,
  },
  noResult: {
    color: '#A8A8A8',
    fontSize: 16,
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    width: '100%',
    height: '100%',
  },
  noContentImage: {
    width: 150,
    height: 150,
  },
  noContentLabel: {
    color: '#063A66',
    textAlign: 'center',
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 24,
  },
  noContentText: {
    color: '#616161',
    textAlign: 'center',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21,
  },
  currentDay: {
    color: '#A8A8A8',
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '600',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
