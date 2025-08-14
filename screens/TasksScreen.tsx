import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {API_ENDPOINTS} from '../services/api_endpoint';
import Config from 'react-native-config';

export enum TaskStatus {
  NotStarted = 'NotStarted',
  InTransit = 'InTransit',
  TechnicalWorkInProgress = 'TechnicalWorkInProgress',
  CollectionInProgress = 'CollectionInProgress',
  Completed = 'Completed',
  Canceled = 'Canceled',
}
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
  pointId?: string;
  order: number;
}

interface TasksPayload {
  tasks: Task[];
  pendingTaskCount: number;
  inProgressTaskCount: number;
  completedTaskCount: number;
}
const TasksScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] =
    useState<string>('İcra olunmamış');

  const getStatusColor = (status: number) => {
    switch (status) {
      case 5:
        return '#EF4444';
      case 1:
      case 2:
      case 3:
      case 4:
        return '#29C0B9';
      case 0:
        return '#9E9E9E';
      case 9:
        return '#090b3eff';
      default:
        return '#9E9E9E';
    }
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tasksData, setTasksData] = useState<TasksPayload>({
    tasks: [],
    pendingTaskCount: 0,
    inProgressTaskCount: 0,
    completedTaskCount: 0,
  });

  const navigation = useNavigation<NavigationProp>();
  const [filteredTasks, setFilteredTasks] = useState<any>([]);
  const [refreshing, setRefreshing] = useState(false);

  const tasksRef = useRef<any>([]);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    tasksRef.current = filteredTasks;
  }, [filteredTasks]);

  const fetchTasks = async (statusFilter?: number) => {
    setLoading(true);
    try {
      const userRole = await AsyncStorage.getItem('roleName');
      const endpointBase =
        userRole === 'Collector'
          ? API_ENDPOINTS.mobile.collector.getAll
          : API_ENDPOINTS.mobile.technician.getAll;
      const url =
        statusFilter != null
          ? `${endpointBase}?status=${statusFilter}`
          : endpointBase;
      const response: TasksPayload = await apiService.get(url);

      setTasksData(response);

      setFilteredTasks(response.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks(0);
      setSelectedFilter('İcra olunmamış');
    }, []),
  );

  const filterTasks = (filter: string) => {
    setSelectedFilter(filter);

    switch (filter) {
      case 'İcra olunmamış':
        fetchTasks(0);
        break;
      case 'İcra olunan':
        fetchTasks(1);
        break;
      case 'Tamamlanıb':
        fetchTasks(4);
        break;
      case 'Ləğv edilmiş':
        fetchTasks(5);
        break;
      case 'Uğursuz əməliyyat':
        fetchTasks(9);
        break;
      case 'Hamısı':
      default:
        fetchTasks();
        break;
    }
  };

  const getStatusFromFilter = (filter: string): number | undefined => {
    switch (filter) {
      case 'İcra olunmamış':
        return 0;
      case 'İcra olunan':
        return 1;
      case 'Tamamlanıb':
        return 4;
      case 'Ləğv edilmiş':
        return 5;
      case 'Uğursuz əməliyyat':
        return 9;
      case 'Hamısı':
      default:
        return undefined;
    }
  };

  const renderTask = ({item}: any) => (
    <TouchableOpacity
      onPress={async () => {
        try {
          setLoading(true);
          const roleName = await AsyncStorage.getItem('roleName');
          const isCollector = roleName === 'Collector';

          const endpoint = isCollector
            ? API_ENDPOINTS.mobile.collector.getById(item.id)
            : API_ENDPOINTS.mobile.technician.getById(item.id);

          const taskDetails = await apiService.get(endpoint);

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
          <Text style={styles.taskTitle}>Terminal ID : {item?.pointId}</Text>
          <Text style={styles.taskDistance}>
            Adress: {item?.address || item?.terminal?.address}
          </Text>
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
        const roleName = await AsyncStorage.getItem('roleName');
        if (!token || connectionRef.current) return;

        const connection = new signalR.HubConnectionBuilder()
          .withUrl(`${Config.SIGNALR_URL}`, {
            accessTokenFactory: () => token,
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information)
          .build();

        console.log(connection, 'connection');

        const createdEvent =
          roleName === 'Collector' ? 'TaskCreated' : 'TechnicianTaskCreated';
        const deletedEvent =
          roleName === 'Collector' ? 'TaskDeleted' : 'TechnicianTaskDeleted';

        connection.on('TaskCreated', (notification: any) => {
          console.log(notification, 'TaskCreated');
          const {taskId, status, pointName, pointId, order} = notification;

          if (status === TaskStatus.Canceled) {
            const removed = tasksRef.current.find((t: any) => t.id === taskId);

            tasksRef.current = tasksRef.current.filter(
              (t: any) => t.id !== taskId,
            );
            setFilteredTasks(tasksRef.current);

            setTasksData(prev => {
              let {pendingTaskCount, inProgressTaskCount, completedTaskCount} =
                prev;

              if (removed) {
                pendingTaskCount = Math.max(0, pendingTaskCount - 1);
              }

              return {
                ...prev,
                tasks: tasksRef.current,
                pendingTaskCount,
                inProgressTaskCount,
                completedTaskCount,
              };
            });

            Toast.show({
              type: 'error',
              text1: 'Tapşırıq ləğv olundu',
              text2: `Terminal ID ${pointId}`,
              position: 'top',
              visibilityTime: 3000,
            });
            return;
          }

          if (
            status === TaskStatus.InTransit ||
            status === TaskStatus.TechnicalWorkInProgress ||
            status === TaskStatus.CollectionInProgress
          ) {
            return;
          }

          tasksRef.current = [
            ...tasksRef.current.filter((t: any) => t.id !== taskId),
            {id: taskId, status, address: pointName, pointId, order},
          ].sort((a, b) => a.order - b.order);

          setFilteredTasks(tasksRef.current);

          const pending = tasksRef.current.filter(
            (t: any) => t.status === TaskStatus.NotStarted,
          ).length;

          setTasksData(prev => ({
            ...prev,
            tasks: tasksRef.current,
            pendingTaskCount: pending,
          }));

          Toast.show({
            type: 'info',
            text1: `Yeni bildiriş`,
            position: 'top',
            visibilityTime: 4000,
            autoHide: true,
          });
        });

        connection.on('TaskDeleted', (notification: any) => {
          const {taskId, pointId} = notification;

          const removed = tasksRef.current.find((t: any) => t.id === taskId);
          if (!removed) {
            return;
          }

          tasksRef.current = tasksRef.current.filter(
            (t: any) => t.id !== taskId,
          );
          setFilteredTasks(tasksRef.current);

          setTasksData(prev => {
            let {pendingTaskCount, inProgressTaskCount, completedTaskCount} =
              prev;

            switch (removed.status) {
              case TaskStatus.NotStarted:
                pendingTaskCount = Math.max(0, pendingTaskCount - 1);
                break;
              // case TaskStatus.InTransit:
              // case TaskStatus.TechnicalWorkInProgress:
              // case TaskStatus.CollectionInProgress:
              //   inProgressTaskCount = Math.max(0, inProgressTaskCount - 1);
              //   break;
              // case TaskStatus.Completed:
              //   completedTaskCount = Math.max(0, completedTaskCount - 1);
              //   break;
            }

            return {
              ...prev,
              tasks: tasksRef.current,
              pendingTaskCount,
              inProgressTaskCount,
              completedTaskCount,
            };
          });

          Toast.show({
            type: 'error',
            text1: 'Tapşırıq silindi',
            text2: `Terminal ID ${pointId}`,
            position: 'top',
            visibilityTime: 3000,
          });
        });

        await connection.start();
        connectionRef.current = connection;
      } catch (err) {
        console.error('❌ SignalR connection error:', err);
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

  const sortedTasks = [...(filteredTasks ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks(getStatusFromFilter(selectedFilter));
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title="Tapşırıqlar"
        variant="tapsiriq"
        onRightPress={() => fetchTasks(getStatusFromFilter(selectedFilter))}
        rightIconComponent={<RefreshIcon color="#fff" width={30} />}
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
          <Text style={styles.statusLabel}>İcra olunan</Text>
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
            'Uğursuz əməliyyat',
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
                      : filter === 'Uğursuz əməliyyat'
                      ? 9
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

      {sortedTasks?.length > 0 && <Text style={styles.currentDay}>Bu gün</Text>}

      <ScrollView contentContainerStyle={styles.mainContainer}>
        {loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color="#2D64AF" />
          </View>
        ) : sortedTasks?.length > 0 ? (
          <FlatList
            data={[...filteredTasks].sort((a, b) => a.order - b.order)}
            keyExtractor={item => item.id}
            renderItem={renderTask}
            ListFooterComponent={<View style={{height: 20}} />}
            refreshing={refreshing}
            onRefresh={handleRefresh}
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
    backgroundColor: '#F7F9FB',
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
    paddingVertical: 20,
    margin: 'auto',
    transform: [{translateY: -46}],
    width: '89%',
    zIndex: 3,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    width: '100%',
    height: '100%',
    paddingTop: 60,
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
