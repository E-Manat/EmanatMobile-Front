import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopHeader from '../components/TopHeader';
import CustomModal from '../components/Modal';
import Config from 'react-native-config';
import Geolocation from '@react-native-community/geolocation';
import {HomeIcon, LocationIcon} from '../assets/icons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';
import {SvgImage} from '@components/SvgImage';
import {
  getTaskStartTime,
  setTaskStartTime,
  removeTaskStartTime,
} from '../utils/taskStorage';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const HORIZONTAL_PADDING = SCREEN_WIDTH * 0.05;
const CARD_MARGIN = SCREEN_WIDTH * 0.025;

const TaskProcessScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.taskProcess>
> = ({navigation, route}) => {
  const {taskData} = route?.params || {};
  const terminal = taskData?.terminal || taskData;
  const terminalPointId = terminal?.pointId;
  const terminalAddress = terminal?.address;

  const [step, setStep] = useState(0);
  const [taskTimer, setTaskTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [completeTaskLoading, setCompleteTaskLoading] = useState(false);
  const [failModalVisible, setFailModalVisible] = useState(false);
  const [failTaskLoading, setFailTaskLoading] = useState(false);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [confirmShareModalVisible, setConfirmShareModalVisible] =
    useState(false);
  const [successShareModalVisible, setSuccessShareModalVisible] =
    useState(false);
  const [shareLocationLoading, setShareLocationLoading] = useState(false);

  const isInProgressByStatus =
    taskData?.status === 1 || taskData?.status === 2 || taskData?.status === 3;

  useEffect(() => {
    const restore = async () => {
      const storedRoleName = await AsyncStorage.getItem('roleName');
      setRoleName(storedRoleName);

      let startTs: number | null = null;
      if (taskData?.id) {
        startTs = await getTaskStartTime(taskData.id);
      }
      if (startTs == null) {
        const legacy = await AsyncStorage.getItem('routeStartTime');
        startTs = legacy ? parseInt(legacy, 10) : null;
      }

      if (startTs) {
        setStep(0);
        setTimerActive(true);
        const diff = Math.floor((Date.now() - startTs) / 1000);
        setTaskTimer(diff);
      } else if (isInProgressByStatus && taskData?.id) {
        const now = Date.now();
        await setTaskStartTime(taskData.id, now);
        setStep(0);
        setTimerActive(true);
        setTaskTimer(0);
      }
    };
    restore();
  }, [taskData?.id, isInProgressByStatus]);

  useEffect(() => {
    let routeInterval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const loadRouteStartTime = async () => {
      if (step !== 0 || !timerActive || !taskData?.id) return;
      let start: number | null = await getTaskStartTime(taskData.id);
      if (start == null) {
        const legacy = await AsyncStorage.getItem('routeStartTime');
        start = legacy ? parseInt(legacy, 10) : Date.now();
        await setTaskStartTime(taskData.id, start);
      }
      if (cancelled) return;
      const startTs = start;
      routeInterval = setInterval(() => {
        if (cancelled) return;
        setTaskTimer(Math.floor((Date.now() - startTs) / 1000));
      }, 1000);
    };

    loadRouteStartTime();

    return () => {
      cancelled = true;
      if (routeInterval) clearInterval(routeInterval);
    };
  }, [step, timerActive, taskData?.id]);

  const startRoute = async () => {
    try {
      setLoading(true);
      const now = Date.now();
      if (taskData?.id) {
        const existing = await getTaskStartTime(taskData.id);
        if (!existing) {
          await setTaskStartTime(taskData.id, now);
        }
      } else {
        const existing = await AsyncStorage.getItem('routeStartTime');
        if (!existing) {
          await AsyncStorage.setItem('routeStartTime', now.toString());
        }
      }
      setTimerActive(true);
      setStep(0);
    } catch (e) {
      console.error('Marşruta başla xətası:', e);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async () => {
    setCompleteTaskLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const location = await getLocation();

      if (!location) {
        console.warn('Location not found, sending 0 coordinates');
      }

      const latitude = location?.latitude ?? 0;
      const longitude = location?.longitude ?? 0;

      const url =
        roleName === 'Collector'
          ? `${Config.API_URL}/mobile/CollectorTask/CompleteTask?taskId=${taskData.id}&latitude=${latitude}&longitude=${longitude}`
          : `${Config.API_URL}/mobile/TechnicianTask/CompleteTask?taskId=${taskData.id}&latitude=${latitude}&longitude=${longitude}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
      });

      const responseData = await response.text();

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseData}`);
      }

      setStep(1);
      setTimerActive(false);

      await removeTaskStartTime(taskData.id);
      const stored = await AsyncStorage.getItem('currentTask');
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed?.id === taskData.id) {
        await AsyncStorage.removeItem('currentTask');
      }

      setSuccessModalVisible(true);
    } catch (error: any) {
      console.error('Complete task error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    } finally {
      setCompleteTaskLoading(false);
    }
  };

  const handleConfirmComplete = async () => {
    setModalVisible(false);
    await completeTask();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`;
  };

  const openInWaze = async () => {
    const address = terminalAddress;
    if (!address) {
      Alert.alert('Xəta', 'Ünvan tapılmadı.');
      return;
    }

    const encodedAddress = encodeURIComponent(address);
    const wazeUrl = `waze://?q=${encodedAddress}&navigate=yes`;
    const fallbackUrl = `https://waze.com/ul?q=${encodedAddress}`;

    try {
      await Linking.openURL(wazeUrl);
    } catch (error) {
      await Linking.openURL(fallbackUrl);
    }
  };

  const getLocation = async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        const fineGranted =
          granted['android.permission.ACCESS_FINE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const coarseGranted =
          granted['android.permission.ACCESS_COARSE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED;

        if (!fineGranted && !coarseGranted) {
          Alert.alert('GPS icazəsi verilməyib');
          return null;
        }
      }

      return new Promise(resolve => {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            resolve({latitude, longitude});
          },
          error => {
            console.error('Koordinat xətası:', error.message);
            Alert.alert(
              'Konum Xətası',
              'GPS koordinatları əldə edilə bilmədi. Zəhmət olmasa GPS-in aktiv olduğundan əmin olun.',
            );
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 10000,
          },
        );
      });
    } catch (error) {
      console.error('getLocation xətası:', error);
      return null;
    }
  };

  const renderBottomButton = () => {
    if (step === 0) {
      const isStarted = timerActive || isInProgressByStatus;
      if (!isStarted) {
        return (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={startRoute}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Marşruta başla</Text>
            )}
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setModalVisible(true)}
          disabled={completeTaskLoading}>
          {completeTaskLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Tapşırığı sonlandır</Text>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.primaryButton} disabled>
        <Text style={styles.primaryButtonText}>Tapşırıq tamamlandı</Text>
      </TouchableOpacity>
    );
  };

  const failTask = async () => {
    setFailTaskLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const taskId = taskData.id;
      const url =
        roleName === 'Collector'
          ? `${Config.API_URL}/mobile/CollectorTask/SetAsFailed?taskId=${taskId}`
          : `${Config.API_URL}/mobile/TechnicianTask/SetAsFailed?taskId=${taskId}`;

      await fetch(url, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
      });

      await removeTaskStartTime(taskData.id);
      const stored = await AsyncStorage.getItem('currentTask');
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed?.id === taskData.id) {
        await AsyncStorage.removeItem('currentTask');
      }
      navigation.navigate(Routes.newReport, {
        terminalId: taskData?.terminal?.id,
      });
    } catch (err: any) {
      console.error('Error setting task as failed:', err);
    } finally {
      setFailTaskLoading(false);
    }
  };

  const sendShareLocation = async () => {
    setShareLocationLoading(true);
    setConfirmShareModalVisible(false);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const location = await getLocation();

      if (!location) {
        Alert.alert('Xəta', 'Konum məlumatı əldə edilə bilmədi.');
        return;
      }

      const {latitude, longitude} = location;
      const taskId = taskData.id;

      const url =
        roleName === 'Collector'
          ? `${Config.API_URL}/mobile/CollectorTask/ShareLocation?taskId=${taskId}&latitude=${latitude}&longitude=${longitude}`
          : `${Config.API_URL}/mobile/TechnicianTask/ShareLocation?taskId=${taskId}&latitude=${latitude}&longitude=${longitude}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      setSuccessShareModalVisible(true);
    } catch (error) {
      console.error('Konum paylaşma xətası:', error);
      Alert.alert('Xəta', 'Konum paylaşılarkən xəta baş verdi.');
    } finally {
      setShareLocationLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title="Tapşırıq"
        onRightPress={() => navigation.navigate(Routes.mainTabs)}
        rightIconComponent={<HomeIcon color="#fff" />}
      />

      <View style={styles.contentContainer}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={openInWaze}>
            <Image
              source={require('../assets/img/waze.png')}
              style={styles.actionIcon}
            />
            <Text style={styles.actionButtonText}>Xəritəyə bax</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setConfirmShareModalVisible(true)}
            disabled={shareLocationLoading}>
            {shareLocationLoading ? (
              <ActivityIndicator color="#1269B5" size="small" />
            ) : (
              <LocationIcon color="#1269B5" width={20} height={20} />
            )}
            <Text style={styles.actionButtonText}>Konumu paylaş</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Image
              source={require('../assets/img/img2.png')}
              style={styles.terminalImage}
            />
            <View style={styles.terminalInfo}>
              <Text style={styles.terminalTitle}>
                Terminal ID: {terminalPointId}
              </Text>
              <Text style={styles.terminalSubtitle}>{terminalAddress}</Text>
            </View>
          </View>

          <View style={styles.timeline}>
            <View style={styles.step}>
              <View
                style={
                  timerActive || isInProgressByStatus
                    ? styles.circleActive
                    : styles.circle
                }>
                {step === 1 ? (
                  <SvgImage
                    source={require('assets/icons/svg/check.svg')}
                    color="#fff"
                  />
                ) : timerActive || isInProgressByStatus ? (
                  <SvgImage
                    source={require('assets/icons/svg/dot.svg')}
                    color="#1269B5"
                    width={11}
                    height={11}
                  />
                ) : (
                  <Text style={styles.stepNum}>01</Text>
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitleActive}>Marşrut</Text>
                <Text style={styles.stepTime}>{formatTime(taskTimer)}</Text>
              </View>
            </View>

            <View style={styles.verticalLine} />

            <View style={styles.step}>
              <View style={step === 1 ? styles.circleActive1 : styles.circle1}>
                {step === 1 ? (
                  <SvgImage source={require('assets/icons/svg/check.svg')} />
                ) : (
                  <Text style={styles.stepNum1}>02</Text>
                )}
              </View>

              <View style={styles.stepContent}>
                <Text
                  style={step >= 1 ? styles.stepTitleActive : styles.stepTitle}>
                  Tapşırığı sonlandır
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setFailModalVisible(true)}>
          <Text style={styles.secondaryButtonText}>Uğursuz əməliyyat</Text>
        </TouchableOpacity>

        {renderBottomButton()}
      </View>

      <CustomModal
        visible={modalVisible}
        title="Təsdiqləmə"
        description="Tapşırığı sonlandırmaq istədiyinizə əminsiniz?"
        confirmText="Bəli"
        cancelText="Xeyr"
        onCancel={() => setModalVisible(false)}
        onConfirm={handleConfirmComplete}
      />

      <CustomModal
        visible={successModalVisible}
        title="Tapşırıq tamamlandı"
        description="Tapşırıq uğurla tamamlandı."
        cancelText="Bağla"
        onCancel={() => {
          setSuccessModalVisible(false);
          navigation.navigate(Routes.newReport, {
            terminalId: taskData?.terminal?.id,
          });
        }}
      />

      <CustomModal
        visible={failModalVisible}
        title="Xəbərdarlıq"
        description="Əməliyyatı uğursuz kimi işarələmək istədiyinizə əminsiniz?"
        confirmText="Bəli"
        cancelText="Xeyr"
        onCancel={() => setFailModalVisible(false)}
        onConfirm={async () => {
          setFailModalVisible(false);
          await failTask();
        }}
      />

      <CustomModal
        visible={confirmShareModalVisible}
        title="Konumu paylaş"
        description="Mövcud koordinatlar paylaşılacaq. Əminsiniz?"
        confirmText="Bəli"
        cancelText="Xeyr"
        onCancel={() => setConfirmShareModalVisible(false)}
        onConfirm={sendShareLocation}
        loading={shareLocationLoading}
      />

      <CustomModal
        visible={successShareModalVisible}
        title="Bildiriş"
        description="Konum uğurla paylaşıldı."
        cancelText="Bağla"
        onCancel={() => setSuccessShareModalVisible(false)}
      />
    </View>
  );
};

const CIRCLE_SIZE = 34;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SCREEN_HEIGHT * 0.02,
    gap: CARD_MARGIN,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1269B5',
    borderRadius: 8,
    paddingVertical: SCREEN_HEIGHT * 0.012,
    gap: 6,
  },
  actionIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  actionButtonText: {
    color: '#1269B5',
    fontFamily: 'DMSans-SemiBold',
    fontSize: SCREEN_WIDTH * 0.035,
  },
  card: {
    borderRadius: 16,
    padding: SCREEN_WIDTH * 0.04,
    paddingTop: SCREEN_WIDTH * 0.1,
    backgroundColor: '#fff',
    shadowColor: '#D2EAFF',
    elevation: 5,
    marginTop: SCREEN_HEIGHT * 0.025,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.025,
    borderColor: '#E0E0E0',
    borderBottomWidth: 1,
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },
  terminalImage: {
    width: SCREEN_WIDTH * 0.11,
    height: SCREEN_WIDTH * 0.11,
  },
  terminalInfo: {
    flex: 1,
  },
  terminalTitle: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#063A66',
  },
  terminalSubtitle: {
    fontSize: SCREEN_WIDTH * 0.033,
    color: '#9E9E9E',
    fontFamily: 'DMSans-SemiBold',
    marginTop: SCREEN_HEIGHT * 0.006,
    lineHeight: 20,
  },
  timeline: {
    width: '100%',
    marginTop: SCREEN_HEIGHT * 0.03,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#1269B5',
    backgroundColor: '#1269B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#1269B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive1: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#1269B5',
    backgroundColor: '#1269B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle1: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum1: {
    fontSize: 12,
    fontFamily: 'DMSans-SemiBold',
    color: '#242E39',
  },
  stepNum: {
    fontSize: 12,
    fontFamily: 'DMSans-SemiBold',
    color: '#fff',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.008,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SCREEN_WIDTH * 0.025,
    justifyContent: 'space-between',
    flex: 1,
  },
  stepTitle: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: 'DMSans-SemiBold',
    color: '#465668',
  },
  stepTitleActive: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#1269B5',
    fontFamily: 'DMSans-SemiBold',
  },
  stepTime: {
    fontSize: SCREEN_WIDTH * 0.033,
    color: '#767676',
    marginLeft: SCREEN_WIDTH * 0.02,
    fontFamily: 'DMSans-SemiBold',
  },
  verticalLine: {
    height: SCREEN_HEIGHT * 0.06,
    borderLeftWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'solid',
    marginLeft: CIRCLE_SIZE / 2,
  },
  bottomButtons: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: SCREEN_HEIGHT * 0.03,
    gap: SCREEN_HEIGHT * 0.015,
  },
  primaryButton: {
    backgroundColor: '#1269B5',
    borderRadius: 12,
    paddingVertical: SCREEN_HEIGHT * 0.017,
    alignItems: 'center',
    height: SCREEN_HEIGHT * 0.06,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontFamily: 'DMSans-SemiBold',
    fontSize: SCREEN_WIDTH * 0.04,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#1269B5',
    borderRadius: 12,
    paddingVertical: SCREEN_HEIGHT * 0.017,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: SCREEN_HEIGHT * 0.06,
    gap: 6,
  },
  secondaryButtonText: {
    color: '#1269B5',
    fontFamily: 'DMSans-SemiBold',
    fontSize: SCREEN_WIDTH * 0.035,
  },
});

export default TaskProcessScreen;
