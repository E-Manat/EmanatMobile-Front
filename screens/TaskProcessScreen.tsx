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
import Icon2 from 'react-native-vector-icons/Octicons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from 'types/types';
import {Routes} from '@navigation/routes';
import {SvgImage} from '@components/SvgImage';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const HORIZONTAL_PADDING = SCREEN_WIDTH * 0.05;
const CARD_MARGIN = SCREEN_WIDTH * 0.025;

const TaskProcessScreen: React.FC<
  NativeStackScreenProps<MainStackParamList, Routes.taskProcess>
> = ({navigation, route}) => {
  const {taskData} = route?.params || {};

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

  useEffect(() => {
    const restore = async () => {
      const routeStart = await AsyncStorage.getItem('routeStartTime');
      const storedRoleName = await AsyncStorage.getItem('roleName');
      setRoleName(storedRoleName);

      if (routeStart) {
        setStep(0);
        setTimerActive(true);
        const diff = Math.floor((Date.now() - parseInt(routeStart, 10)) / 1000);
        setTaskTimer(diff);
      }
    };
    restore();
  }, []);

  useEffect(() => {
    let routeInterval: any;

    const loadRouteStartTime = async () => {
      if (step === 0 && timerActive) {
        const storedTime = await AsyncStorage.getItem('routeStartTime');
        const start = storedTime ? parseInt(storedTime, 10) : Date.now();

        if (!storedTime) {
          await AsyncStorage.setItem('routeStartTime', start.toString());
        }

        routeInterval = setInterval(() => {
          const now = Date.now();
          setTaskTimer(Math.floor((now - start) / 1000));
        }, 1000);
      }
    };

    loadRouteStartTime();

    return () => {
      if (routeInterval) {
        clearInterval(routeInterval);
      }
    };
  }, [step, timerActive]);

  const getLocation = async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    return new Promise(async resolve => {
      const success = (position: any) => {
        const {latitude, longitude} = position.coords;
        resolve({latitude, longitude});
      };

      const error = (err: any) => {
        console.error('❌ Koordinat xətası:', err.message);
        resolve(null);
      };

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

          if (fineGranted || coarseGranted) {
            Geolocation.getCurrentPosition(success, error, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 1000,
            });
          } else {
            Alert.alert('❗ GPS icazəsi verilməyib');
            resolve(null);
          }
        } else {
          Geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 1000,
          });
        }
      } catch (e) {
        console.error('❌ getLocation funksiyasında xəta:', e);
        resolve(null);
      }
    });
  };

  const startRoute = async () => {
    try {
      setLoading(true);
      const existing = await AsyncStorage.getItem('routeStartTime');
      if (!existing) {
        await AsyncStorage.setItem('routeStartTime', Date.now().toString());
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

      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
      });

      const responseData = await response.text();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseData}`);
      }

      setStep(1);
      setTimerActive(false);

      await AsyncStorage.multiRemove(['currentTask', 'routeStartTime']);

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
    const address = taskData?.terminal?.address;
    if (!address) {
      Alert.alert('Xəta', 'Ünvan tapılmadı.');
      return;
    }

    const encodedAddress = encodeURIComponent(address);
    const wazeUrl = `waze://?q=${encodedAddress}&navigate=yes`;
    const fallbackUrl = `https://waze.com/ul?q=${encodedAddress}`;

    const canOpen = await Linking.canOpenURL(wazeUrl);
    if (canOpen) {
      Linking.openURL(wazeUrl);
    } else {
      Linking.openURL(fallbackUrl);
    }
  };

  const renderBottomButton = () => {
    if (step === 0) {
      if (!timerActive) {
        return (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={startRoute}
            disabled={loading}>
            <Text style={styles.primaryButtonText}>
              {loading ? <ActivityIndicator color="#fff" /> : 'Marşruta başla'}
            </Text>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setModalVisible(true)}
          disabled={completeTaskLoading}>
          <Text style={styles.primaryButtonText}>
            {completeTaskLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              'Tapşırığı sonlandır'
            )}
          </Text>
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

      await AsyncStorage.multiRemove(['currentTask', 'routeStartTime']);
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
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const location = await getLocation();

      if (!location) {
        setConfirmShareModalVisible(false);
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

      setConfirmShareModalVisible(false);
      setSuccessShareModalVisible(true);
    } catch (error) {
      console.error('Konum paylaşma xətası:', error);
      setConfirmShareModalVisible(false);
      Alert.alert('Xəta', 'Konum paylaşılarkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopHeader
        title="Tapşırıq"
        onRightPress={() => navigation.navigate(Routes.home)}
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
            onPress={() => setConfirmShareModalVisible(true)}>
            <LocationIcon color="#1269B5" width={20} height={20} />
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
                Terminal ID: {taskData?.terminal?.pointId}
              </Text>
              <Text style={styles.terminalSubtitle}>
                {taskData?.terminal?.address}
              </Text>
            </View>
          </View>

          <View style={styles.timeline}>
            <View style={styles.step}>
              <View style={timerActive ? styles.circleActive : styles.circle}>
                {step === 1 ? (
                  <SvgImage
                    source={require('assets/icons/svg/check.svg')}
                    color="#fff"
                  />
                ) : timerActive ? (
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
                  <Icon2 name="check" size={20} color="#fff" />
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
        // loading={failTaskLoading}
      />

      <CustomModal
        visible={confirmShareModalVisible}
        title="Konumu paylaş"
        description="Mövcud koordinatlar paylaşılacaq. Əminsiniz?"
        confirmText="Bəli"
        cancelText="Xeyr"
        onCancel={() => setConfirmShareModalVisible(false)}
        onConfirm={sendShareLocation}
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
    borderStyle: 'dashed',
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
