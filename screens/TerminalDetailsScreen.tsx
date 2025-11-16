import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  DeviceEventEmitter,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import TopHeader from '../components/TopHeader';
import CustomModal from '../components/Modal';
import Config from 'react-native-config';
import {HomeIcon} from '../assets/icons';
import {MainStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SvgImage} from '@components/SvgImage';

const TerminalDetailsScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.terminalDetails>
> = ({navigation, route}) => {
  const isFocused = useIsFocused();
  const [taskData, setTaskDetails] = useState(route?.params?.taskData);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskInProgress, setTaskInProgress] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [roleName, setRoleName] = useState<string | null>(null);

  useEffect(() => {
    const loadRoleName = async () => {
      const storedRoleName = await AsyncStorage.getItem('roleName');
      setRoleName(storedRoleName);
    };

    loadRoleName();
  }, []);

  const handleStartTask = async () => {
    if (taskInProgress) {
      setConfirmVisible(false);
      setTaskInProgress(false);
      return;
    }

    try {
      setLoading(true);
      setTaskInProgress(true);

      const token = await AsyncStorage.getItem('userToken');
      // mobile
      const url =
        roleName === 'Collector'
          ? `${Config.API_URL}/mobile/CollectorTask/StartTask?taskId=${taskData.id}`
          : `${Config.API_URL}/mobile/TechnicianTask/StartRoute?taskId=${taskData.id}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resText: any = await response.text();

      if (
        response.status === 400 &&
        resText.includes(
          'Hazırda yerinə yetirilən başqa bir tapşırıq mövcuddur',
        )
      ) {
        setConfirmVisible(false);
        setCustomModalVisible(true);
        return;
      }

      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }

      setConfirmVisible(false);
      await AsyncStorage.setItem('currentTask', JSON.stringify(taskData));
      DeviceEventEmitter.emit('taskStarted');
      await AsyncStorage.setItem(
        'routeStartTime',
        new Date().getTime().toString(),
      );

      navigation.navigate(Routes.taskProcess, {
        taskData,
        startTime: new Date().getTime(),
      });
    } catch (error) {
      console.error('Task start error:', error);
    } finally {
      setLoading(false);
      setTaskInProgress(false);
    }
  };

  const getStatusText = (status: number) => {
    if (roleName === 'Collector') {
      switch (status) {
        case 0:
          return 'Marşruta başla';
        case 1:
          return 'Yoldadır';
        case 3:
          return 'İnkassasiya prosesi gedir';
        case 4:
          return 'Tapşırıq tamamlanıb';
        case 5:
          return 'Tapşırıq ləğv olunub';
        default:
          return 'Naməlum status';
      }
    } else if (roleName === 'Technician') {
      switch (status) {
        case 0:
          return 'Marşruta başla';
        case 1:
          return 'Yoldadır';
        case 2:
          return 'Texniki iş prosesi gedir';
        case 4:
          return 'Texniki iş prosesi tamamlandı';
        case 5:
          return 'Tapşırıq ləğv olunub';
        default:
          return 'Naməlum status';
      }
    }
  };

  const formatDuration = (durationStr: string) => {
    if (!durationStr) {
      return 'Qeyd olunmayıb';
    }

    const [hours, minutes, seconds] = durationStr.split(':').map(Number);

    const parts = [];
    if (hours > 0) {
      parts.push(`${hours} saat`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} dəqiqə`);
    }
    if (seconds > 0) {
      parts.push(`${seconds} saniyə`);
    }

    return parts.length > 0 ? parts.join(' ') : '0 saniyə';
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return '#9E9E9E';
      case 4:
        return '#38C172';
      case 1:
      case 2:
      case 3:
        return '#FFB600';
      case 5:
        return '#F03E5C';
      default:
        return '#9E9E9E';
    }
  };

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const fetchTask = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(
          `${Config.API_URL}/mobile/CollectorTask/GetById?id=${taskData.id}`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        const updated = await res.json();
        setTaskDetails(updated);
      } catch (e) {
        console.error('Task fetch error:', e);
      }
    };

    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  return (
    <View style={{flexGrow: 1}}>
      <View style={styles.container}>
        <TopHeader
          title="Tapşırıq detalları"
          onRightPress={() => navigation.navigate(Routes.home)}
          rightIconComponent={<HomeIcon color="#fff" />}
        />

        <View style={styles.terminalInfo}>
          <View style={styles.terminalName}>
            <View
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <SvgImage
                source={require('assets/icons/svg/location.svg')}
                color="#1976D2"
              />{' '}
              <Text style={styles.terminalCode}>
                {' '}
                Terminal ID: {taskData?.terminal?.pointId}
              </Text>
            </View>
            <View
              style={[
                styles.statusDot,
                {backgroundColor: getStatusColor(taskData.status)},
              ]}
            />
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.location}>
              {' '}
              {taskData.terminal?.address
                ? taskData?.terminal?.address?.charAt(0)?.toUpperCase() +
                  taskData?.terminal?.address?.slice(1)
                : ''}{' '}
            </Text>
          </View>
        </View>

        <Image
          source={require('../assets/img/task_detail.png')}
          style={styles.image}
        />

        <View style={styles.details}>
          {/* <Text style={styles.detailTitle}>
            {taskData.terminal?.address
              ? taskData.terminal.address.charAt(0).toUpperCase() +
                taskData.terminal.address.slice(1)
              : ''}
          </Text> */}

          <View style={styles.timelineItem}>
            <View style={styles.iconWrapper}>
              <SvgImage
                source={require('assets/icons/svg/location.svg')}
                color="white"
              />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.detailText}>
                {taskData.terminal?.address
                  ? taskData.terminal.address.charAt(0).toUpperCase() +
                    taskData.terminal.address.slice(1)
                  : ''}
              </Text>
            </View>
          </View>

          <View style={styles.verticalLine} />

          <View style={styles.timelineItem}>
            <View style={styles.iconWrapper}>
              <SvgImage
                source={require('assets/icons/svg/clock.svg')}
                color="white"
                width={15}
                height={15}
              />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.detailText}>
                {/* {taskData?.terminal?.workingHours
                  ? taskData.terminal.workingHours.charAt(0).toUpperCase() +
                    taskData.terminal.workingHours.slice(1)
                  : ''} */}
                08:00 - 00:00
              </Text>
            </View>
          </View>

          <View style={styles.verticalLine} />

          <View style={styles.timelineItem}>
            <View style={styles.iconWrapper}>
              <SvgImage
                source={require('assets/icons/svg/called.svg')}
                color="white"
                width={15}
                height={15}
              />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.detailText}>
                {taskData?.terminal?.responsiblePersonPhone || '012 404 48 88'}
              </Text>
            </View>
          </View>

          {/* {taskData.taskDuration && <View style={styles.verticalLine} />}

          {taskData.taskDuration && (
            <View style={styles.timelineItem}>
              <View style={styles.iconWrapper}>
                <Icon2 name="check-circle-fill" size={15} color="white" />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.detailText}>
                  Tapşırığın tamamlanma müddəti:
                  {taskData.taskDuration
                    ? formatDuration(taskData.taskDuration)
                    : 'Qeyd olunmayıb'}
                </Text>
              </View>
            </View>
          )} */}

          {true && <View style={styles.verticalLine} />}

          {true && (
            <View style={styles.timelineItem}>
              <View style={styles.iconWrapper}>
                <SvgImage
                  source={require('assets/icons/svg/check-fill.svg')}
                  color="white"
                />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.detailText}>
                  Müddət :
                  {taskData.totalProcessDuration
                    ? formatDuration(taskData.totalProcessDuration)
                    : 'Qeyd olunmayıb'}
                </Text>
              </View>
            </View>
          )}
        </View>

        <CustomModal
          visible={confirmVisible}
          title="Tapşırığa başlamaq istəyirsiniz?"
          description="Tapşırığa başladıqdan sonra onu yalnız tamamladıqda bitirə bilərsiniz."
          confirmText="Bəli"
          cancelText="İmtina"
          onConfirm={handleStartTask}
          onCancel={() => setConfirmVisible(false)}
        />

        <CustomModal
          visible={customModalVisible}
          title="Xəta!"
          description="Hazırda yerinə yetirilən başqa bir tapşırıq mövcuddur. Başqa bir tapşırığa başlaya bilməzsiniz"
          confirmText="Bağla"
          onConfirm={() => setCustomModalVisible(false)}
        />

        {taskData.status === 0 ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setConfirmVisible(true)}>
            <Text style={styles.startButtonText}>Marşruta başla</Text>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.startButton,
              {backgroundColor: '#eee', borderColor: '#F5F5F5', borderWidth: 1},
            ]}>
            <Text style={[styles.startButtonText, {color: '#999999'}]}>
              {getStatusText(taskData.status)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TerminalDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
    width: '100%',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 5,
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
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  terminalInfo: {
    padding: 20,
  },
  terminalName: {
    width: '100%',
    gap: 3,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  terminalCode: {color: '#063A66', fontFamily: 'DMSans-Bold', fontSize: 16},
  location: {
    color: '#99A7B6',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  distance: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  image: {
    width: '90%',
    height: 180,
    alignSelf: 'center',
    borderRadius: 10,
    marginVertical: 10,
  },
  details: {
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 7,
  },
  iconWrapper: {
    backgroundColor: '#1976D2',
    width: 28,
    height: 28,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  textWrapper: {
    marginLeft: 5,
    flex: 1,
  },
  verticalLine: {
    height: 26,
    width: 2,
    backgroundColor: '#99A7B6',
    marginLeft: 20, // aligns with center of the icon
    zIndex: 1,
  },
  detailTitle: {
    color: '#063A66',
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    lineHeight: 19.2,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#212121',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    lineHeight: 18,
    marginLeft: 10,
  },
  startButton: {
    backgroundColor: '#ECF5FD',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 15,
    left: 20,
    width: '91%',
    alignSelf: 'center',
  },
  startButtonText: {
    color: '#2D64AF', // var(--Button-primary, #2D64AF)
    textAlign: 'center',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 14,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
