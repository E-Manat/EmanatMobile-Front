import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../App';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import TopHeader from '../components/TopHeader';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Hesabatlar'>;

const TaskProcessScreen = ({route}: any) => {
  const navigation = useNavigation<NavigationProp>();
  const {taskData, startTime: initialStartTime} = route?.params || {}; // Receive startTime

  const [step, setStep] = useState(1); // Track current step: 1 - "Start Task", 2 - "Start Collection", 3 - "Complete Task"
  const [taskTimer, setTaskTimer] = useState(0); // Track the time for task in seconds
  const [collectionTimer, setCollectionTimer] = useState(0); // Track the collection time in seconds
  const [timerActive, setTimerActive] = useState(false); // Flag to control the timer
  const [loading, setLoading] = useState(false); // For loading state during API requests

  const startTime = initialStartTime || new Date().getTime(); // Initialize startTime (if not passed, use current time)

  useEffect(() => {
    let taskInterval: any;
    let collectionInterval: any;

    // If task timer is active, update the task timer every second
    if (timerActive) {
      taskInterval = setInterval(() => {
        setTaskTimer(prevTimer => prevTimer + 1); // Increment the task timer every second
      }, 1000);
    }

    // If collection is active, update the collection timer every second
    if (step === 2) {
      collectionInterval = setInterval(() => {
        setCollectionTimer(prevTimer => prevTimer + 1); // Increment the collection timer every second
      }, 1000);
    }

    return () => {
      clearInterval(taskInterval);
      clearInterval(collectionInterval);
    };
  }, [timerActive, step]);

  // Start collection
  const startCollection = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    const url = `https://emanat-api.siesco.studio/mobile/CollectorTask/StartCollection?taskId=${taskData.id}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }

      setStep(2); // Move to "İnkassasiyaya başla" step
      setTimerActive(true); // Start the task timer for "İnkassiya başla" phase
      setLoading(false);
    } catch (error) {
      console.error('Error starting collection:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to start collection.');
    }
  };

  const completeTask = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    const url = `https://emanat-api.siesco.studio/mobile/CollectorTask/CompleteTask?taskId=${taskData.id}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }

      setStep(3); // Move to "Task Completed" step
      setTimerActive(false); // Stop the task and collection timers
      Alert.alert('Success', 'Task completed successfully');
    } catch (error) {
      console.error('Error completing task:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to complete the task.');
    } finally {
      setLoading(false);
    }
  };

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <TopHeader title="Tapşırıq" />

        <View style={styles.mapSection}>
          <TouchableOpacity style={styles.mapBtn}>
            <View style={styles.mapBtnContent}>
              <Image
                source={require('../assets/img/waze.png')}
                style={styles.profileImage}
              />
              <Text style={styles.mapBtnText}>Xəritəyə bax</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.terminalTitle}>Terminal 2435</Text>
          <Text style={styles.terminalSubtitle}>
            Bravo Koroğlu m/s <Text style={styles.distance}>2.7 km</Text>
          </Text>

          <View style={styles.timeline}>
            <View style={styles.step}>
              <View style={step >= 1 ? styles.circleActive : styles.circle}>
                <Text style={styles.stepNum}>01</Text>
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={step >= 1 ? styles.stepTitleActive : styles.stepTitle}>
                  Tapşırığa başla
                </Text>
                <Text style={styles.stepTime}>{formatTime(taskTimer)}</Text>
              </View>
            </View>

            <View style={styles.verticalLine} />

            <View style={styles.step}>
              <View style={step >= 2 ? styles.circleActive : styles.circle}>
                <Text style={styles.stepNum}>02</Text>
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={step >= 2 ? styles.stepTitleActive : styles.stepTitle}>
                  İnkassasiyaya başla
                </Text>
                <Text style={styles.stepTime}>
                  {formatTime(collectionTimer)}
                </Text>
              </View>
            </View>

            <View style={styles.verticalLine} />

            <View style={styles.step}>
              <View style={step === 3 ? styles.circleActive : styles.circle}>
                <Text style={styles.stepNum}>03</Text>
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={
                    step === 3 ? styles.stepTitleActive : styles.stepTitle
                  }>
                  Tapşırığı sonlandır
                </Text>
                <Text style={styles.stepTime}>00:00</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomButtons}>
          {step === 1 ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={startCollection}
              disabled={loading}>
              <Text style={styles.primaryButtonText}>İnkassasiyaya başla</Text>
            </TouchableOpacity>
          ) : step === 2 ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={completeTask}>
              <Text style={styles.primaryButtonText}>Tapşırığı sonlandir</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} disabled>
              <Text style={styles.primaryButtonText}>Tapşırıq tamamlanıb</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Hesabat yarat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const CIRCLE_SIZE = 28;
export default TaskProcessScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    backgroundColor: '#2D64AF',
    height: 80,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {fontSize: 18, fontWeight: 'bold', color: '#fff'},
  card: {borderRadius: 16, padding: 16, marginHorizontal: 20},
  terminalTitle: {fontWeight: '700', fontSize: 16, color: '#063A66'},
  terminalSubtitle: {fontSize: 13, color: '#9E9E9E'},
  distance: {color: '#1269B5', fontWeight: '600'},
  timeline: {marginTop: 20},

  mapSection: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 7,
    padding: 16,
  },
  mapBtn: {
    borderRadius: 8, // var(--s, 8px)
    backgroundColor: '#1269B5', // var(--Primary-primary-500, #1269B5)
    shadowColor: 'rgba(45, 100, 175, 0.10)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 5, // Android üçün kölgə effekti
    paddingVertical: 10,
    paddingHorizontal: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  mapBtnText: {
    color: '#FFF',
    fontFamily: 'DM Sans',
    fontSize: 12,
    fontWeight: '500',
  },

  profileImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },

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
    fontWeight: 'bold',
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
    color: '#465668',
  },
  stepTitleActive: {
    fontSize: 14,
    color: '#1269B5',
    fontWeight: 'bold',
  },
  stepTime: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
  },

  verticalLine: {
    height: 20,
    borderLeftWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    marginLeft: CIRCLE_SIZE / 2,
    alignSelf: 'flex-start',
  },
  bottomButtons: {paddingHorizontal: 20, marginTop: 'auto', marginBottom: 30},
  primaryButton: {
    backgroundColor: '#1269B5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#1269B5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {color: '#1269B5', fontWeight: 'bold', fontSize: 16},
});
