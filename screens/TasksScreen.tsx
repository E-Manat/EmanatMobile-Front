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

import {apiService} from '../services/apiService';
import TopHeader from '../components/TopHeader';
import Toast from 'react-native-toast-message';
import * as signalR from '@microsoft/signalr';
import {RefreshIcon} from '../assets/icons';

import {API_ENDPOINTS} from '../services/api_endpoint';
import Config from 'react-native-config';
import {SvgImage} from '@components/SvgImage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';

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
const TasksScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.tasks>
> = ({navigation, route}) => {
  const [selectedFilter, setSelectedFilter] =
    useState<string>('İcra olunmamış');

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return '#9E9E9E';
      case 1:
      case 2:
      case 3:
        return '#eeee1eff';
      case 5:
        return '#EF4444';
      case 9:
        return '#090b3eff';
      case 10:
        return '#29C0B9';
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
      case 'Ləğv edilmiş':
        fetchTasks(5);
        break;
      case 'Uğursuz əməliyyat':
        fetchTasks(9);
        break;
      case 'İnkassasiya edildi':
        fetchTasks(10);
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
      case 'Ləğv edilmiş':
        return 5;
      case 'Uğursuz əməliyyat':
        return 9;
      case 'İnkassasiya edildi':
        return 10;
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

          navigation.navigate(Routes.terminalDetails, {taskData: taskDetails});
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
          <SvgImage
            source={require('assets/icons/svg/dot.svg')}
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
        if (!token || connectionRef.current) {
          return;
        }

        const connection = new signalR.HubConnectionBuilder()
          .withUrl(`${Config.SIGNALR_URL}`, {
            accessTokenFactory: () => token,
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information)
          .build();

        const createdEvent =
          roleName === 'Collector' ? 'TaskCreated' : 'TechnicianTaskCreated';
        const deletedEvent =
          roleName === 'Collector' ? 'TaskDeleted' : 'TechnicianTaskDeleted';

        connection.on('TaskCreated', (notification: any) => {
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
            text1: 'Yeni bildiriş',
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

  const ListHeaderComponent = () => (
    <>
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
            'İnkassasiya edildi',
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
                <SvgImage
                  source={require('assets/icons/svg/dot.svg')}
                  color={getStatusColor(
                    filter === 'İcra olunan'
                      ? 1
                      : filter === 'İnkassasiya edildi'
                      ? 10
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
    </>
  );

  const ListEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2D64AF" />
        </View>
      );
    }

    return (
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
    );
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title="Tapşırıqlar"
        variant="tapsiriq"
        onRightPress={() => fetchTasks(getStatusFromFilter(selectedFilter))}
        rightIconComponent={<RefreshIcon color="#fff" width={30} />}
      />
      <FlatList
        data={sortedTasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={<View style={{height: 20}} />}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.flatListContent}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

export default TasksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
    paddingBottom: 80,
  },
  flatListContent: {
    flexGrow: 1,
    paddingHorizontal: 15,
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
    marginTop: 50,
    paddingVertical: 20,
    marginHorizontal: 'auto',
    transform: [{translateY: -46}],
    width: '100%',
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
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    lineHeight: 21,
  },
  taskText: {
    fontSize: 12,
    color: '#A8A8A8',
  },
  taskDistance: {
    color: '#616161',
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
    marginBottom: 10,
  },
});
