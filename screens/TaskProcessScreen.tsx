import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Linking,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import TopHeader from '../components/TopHeader';
import CustomModal from '../components/Modal';
import Config from 'react-native-config';
import Geolocation from '@react-native-community/geolocation';
type NavigationProp = StackNavigationProp<RootStackParamList, 'Hesabatlar'>;

const TaskProcessScreen = ({route}: any) => {
  const navigation = useNavigation<NavigationProp>();
  const {taskData} = route?.params || {};

  const [step, setStep] = useState(0);
  const [taskTimer, setTaskTimer] = useState(0);
  const [collectionTimer, setCollectionTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [completeTaskLoading, setCompleteTaskLoading] = useState(false);

  useEffect(() => {
    const restoreTimers = async () => {
      const routeStart = await AsyncStorage.getItem('routeStartTime');
      const collectionStart = await AsyncStorage.getItem('collectionStartTime');

      if (collectionStart) {
        setStep(1);
        setTimerActive(true);
        const diff = Math.floor(
          (new Date().getTime() - parseInt(collectionStart, 10)) / 1000,
        );
        setCollectionTimer(diff);
      } else if (routeStart) {
        setStep(0);
        setTimerActive(true);
        const diff = Math.floor(
          (new Date().getTime() - parseInt(routeStart, 10)) / 1000,
        );
        setTaskTimer(diff);
      }
    };

    restoreTimers();
  }, []);

  useEffect(() => {
    let routeInterval: any;

    const loadRouteStartTime = async () => {
      if (step === 0 && timerActive) {
        const storedTime = await AsyncStorage.getItem('routeStartTime');
        const start = storedTime
          ? parseInt(storedTime, 10)
          : new Date().getTime();

        if (!storedTime) {
          await AsyncStorage.setItem('routeStartTime', start.toString());
        }

        routeInterval = setInterval(() => {
          const now = new Date().getTime();
          setTaskTimer(Math.floor((now - start) / 1000));
        }, 1000);
      }
    };

    loadRouteStartTime();

    return () => {
      clearInterval(routeInterval);
    };
  }, [step, timerActive]);

  useEffect(() => {
    let collectionInterval: any;

    const loadCollectionStartTime = async () => {
      if (step === 1 && timerActive) {
        const storedTime = await AsyncStorage.getItem('collectionStartTime');
        const start = storedTime
          ? parseInt(storedTime, 10)
          : new Date().getTime();

        if (!storedTime) {
          await AsyncStorage.setItem('collectionStartTime', start.toString());
        }

        collectionInterval = setInterval(() => {
          const now = new Date().getTime();
          setCollectionTimer(Math.floor((now - start) / 1000));
        }, 1000);
      }
    };

    loadCollectionStartTime();

    return () => {
      clearInterval(collectionInterval);
    };
  }, [step, timerActive]);

  const getLocation = async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    return new Promise(async resolve => {
      const success = (position: any) => {
        const {latitude, longitude} = position.coords;
        console.log('📍 Uğurla koordinat tapıldı:', latitude, longitude);
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

  const completeTask = async () => {
    setCompleteTaskLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const location = await getLocation();

      if (!location) {
        console.warn('Koordinatlar tapılmadı, 0 olaraq göndərilir');
      }

      const latitude = location?.latitude ?? 0;
      const longitude = location?.longitude ?? 0;

      const url = `${Config.API_URL}/mobile/CollectorTask/CompleteTask?taskId=${taskData.id}&latitude=${latitude}&longitude=${longitude}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response, 'complete task');

      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }

      setStep(2);
      setTimerActive(false);

      await AsyncStorage.multiRemove([
        'currentTask',
        'routeStartTime',
        'collectionStartTime',
      ]);

      setSuccessModalVisible(true);
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setCompleteTaskLoading(false);
    }
  };

  const handleConfirmComplete = async () => {
    setModalVisible(false);
    await completeTask();
  };

  const startCollection = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    const url = `${Config.API_URL}/mobile/CollectorTask/StartCollection?taskId=${taskData.id}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response);

      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }

      setTimerActive(false);
      setStep(1);
      await AsyncStorage.setItem(
        'collectionStartTime',
        new Date().getTime().toString(),
      );
      setTimerActive(true);
    } catch (error) {
      console.error('Error starting collection:', error);
    } finally {
      setLoading(false);
    }
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
    console.log(address, 'adresimiz');

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
      return (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={startCollection}
          disabled={loading}>
          <Text style={styles.primaryButtonText}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              'İnkassasiyaya başla'
            )}
          </Text>
        </TouchableOpacity>
      );
    }

    if (step === 1) {
      return (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setModalVisible(true)}
          disabled={loading || completeTaskLoading}>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <TopHeader title="Tapşırıq" />

        <View style={styles.card}>
          <View style={{flexDirection: 'row', gap: 10}}>
            <Image
              source={require('../assets/img/img2.png')}
              style={styles.image}
            />
            <View>
              <Text style={styles.terminalTitle}>
                {taskData?.terminal.code}
              </Text>
              <Text style={styles.terminalSubtitle}>
                {taskData?.terminal?.address}
                {/* <Text style={styles.distance}>2.7 km</Text> */}
              </Text>
            </View>
          </View>

          <View style={styles.timeline}>
            <View style={styles.step}>
              <View style={step >= 0 ? styles.circleActive : styles.circle}>
                <Text style={styles.stepNum}>01</Text>
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={step >= 0 ? styles.stepTitleActive : styles.stepTitle}>
                  Marşrut
                </Text>
                <Text style={styles.stepTime}>{formatTime(taskTimer)}</Text>
              </View>
            </View>

            <View style={styles.verticalLine} />

            <View style={styles.step}>
              <View style={step >= 1 ? styles.circleActive : styles.circle}>
                <Text style={styles.stepNum}>02</Text>
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={step >= 1 ? styles.stepTitleActive : styles.stepTitle}>
                  İnkassasiya
                </Text>
                <Text style={styles.stepTime}>
                  {formatTime(collectionTimer)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomButtons}>
          {' '}
          <TouchableOpacity style={styles.secondaryButton} onPress={openInWaze}>
            {' '}
            <Image
              source={require('../assets/img/waze.png')}
              style={styles.profileImage}
            />
            <Text style={styles.secondaryButtonText}>Xəritəyə bax</Text>
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
          confirmText="Bağla"
          onConfirm={() => {
            setSuccessModalVisible(false);
            navigation.navigate('YeniHesabat', {
              terminalId: taskData?.terminal?.id,
            });
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const CIRCLE_SIZE = 28;
export default TaskProcessScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  card: {borderRadius: 16, padding: 16, marginHorizontal: 20, paddingTop: 40},
  terminalTitle: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    color: '#063A66',
  },
  terminalSubtitle: {
    fontSize: 13,
    color: '#9E9E9E',
    fontFamily: 'DMSans-SemiBold',
    marginTop: 5,
  },
  distance: {color: '#1269B5', fontFamily: 'DMSans-SemiBold', marginLeft: 5},
  timeline: {marginTop: 20},
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  circleActive: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#1269B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 10,
    fontFamily: 'DMSans-SemiBold',
    color: '#fff',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    justifyContent: 'space-between',
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontFamily: 'DMSans-SemiBold',
    color: '#465668',
  },
  stepTitleActive: {
    fontSize: 14,
    color: '#1269B5',
    fontFamily: 'DMSans-SemiBold',
  },
  stepTime: {
    fontSize: 13,
    color: '#767676',
    marginLeft: 8,
    fontFamily: 'DMSans-SemiBold',
  },
  verticalLine: {
    height: 20,
    borderLeftWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    marginLeft: CIRCLE_SIZE / 2,
    alignSelf: 'flex-start',
  },
  bottomButtons: {
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 30,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#1269B5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#1269B5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryButtonText: {
    color: '#1269B5',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
  },
  image: {
    width: 40,
    height: 40,
  },
  profileImage: {width: 25, height: 25, resizeMode: 'contain'},
});
