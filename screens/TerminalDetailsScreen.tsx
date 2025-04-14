import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {useNavigation} from '@react-navigation/native';
import TopHeader from '../components/TopHeader';
import CustomModal from '../components/Modal';

const TerminalDetailsScreen = ({route}: any) => {
  const {taskData} = route.params;
  console.log(taskData, 'Task Data');
  console.log(route);

  type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartTask = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const url = `https://emanat-api.siesco.studio/mobile/CollectorTask/StartTask?taskId=${taskData.id}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resText: any = await response.text();
      console.log('Response:', resText);

      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }

      setConfirmVisible(false);
      await AsyncStorage.setItem('currentTask', JSON.stringify(taskData));
      await AsyncStorage.setItem(
        'routeStartTime',
        new Date().getTime().toString(),
      );

      navigation.navigate('TaskProcess', {
        taskData,
        startTime: new Date().getTime(), 
      });
    } catch (error) {
      console.error('Task start error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return 'Tapşırığa başla';
      case 1:
        return 'Tapşırıq icra olunur (Yoldadır)';
      case 2:
        return 'İnkassator terminala çatıb';
      case 3:
        return 'İnkassasiya prosesi gedir';
      case 4:
        return 'Tapşırıq tamamlanıb';
      case 5:
        return 'Tapşırıq ləğv olunub';
      default:
        return 'Naməlum status';
    }
  };

  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <TopHeader title="Terminal detalları" />

      <View style={styles.terminalInfo}>
        <Text style={styles.terminalName}>
          <Icon name="location-dot" size={20} color="#1976D2" />
          <Text> {taskData?.terminal?.code}</Text>
        </Text>
        <View style={styles.statusContainer}>
          <Text style={styles.location}>
            {' '}
            {taskData.terminal?.address
              ? taskData.terminal.address.charAt(0).toUpperCase() +
                taskData.terminal.address.slice(1)
              : ''}
          </Text>
        </View>
      </View>

      <Image source={require('../assets/img/araz.png')} style={styles.image} />

      <View style={styles.details}>
        <Text style={styles.detailTitle}>
          {taskData.terminal?.address
            ? taskData.terminal.address.charAt(0).toUpperCase() +
              taskData.terminal.address.slice(1)
            : ''}
        </Text>

        <View style={styles.timelineItem}>
          <View style={styles.iconWrapper}>
            <Icon name="location-dot" size={15} color="white" />
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
            <Icon1 name="watch-later" size={15} color="white" />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.detailText}>
              {taskData.terminal?.workingHours
                ? taskData.terminal.workingHours.charAt(0).toUpperCase() +
                  taskData.terminal.workingHours.slice(1)
                : ''}
            </Text>
          </View>
        </View>

        <View style={styles.verticalLine} />

        <View style={styles.timelineItem}>
          <View style={styles.iconWrapper}>
            <Icon name="phone" size={15} color="white" />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.detailText}>
              {taskData.terminal.phone || 'Qeyd olunmayib'}
            </Text>
          </View>
        </View>
      </View>

      <CustomModal
        visible={confirmVisible}
        title="Tapşırığa başlamaq istəyirsiniz?"
        description="Tapşırığa başladıqdan sonra onu yalnız tamamladıqdan sonra bitirə bilərsiniz."
        confirmText="Bəli"
        cancelText="İmtina"
        onConfirm={handleStartTask}
        onCancel={() => setConfirmVisible(false)}
      />

      {taskData.status === 0 ? (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setConfirmVisible(true)}>
          <Text style={styles.startButtonText}>Marşruta başla </Text>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            styles.startButton,
            {backgroundColor: '#eee', borderColor: '#ccc', borderWidth: 1},
          ]}>
          <Text style={[styles.startButtonText, {color: '#999'}]}>
            {getStatusText(taskData.status)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default TerminalDetailsScreen;

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
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  terminalInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  terminalName: {
    width: '100%',
    color: '#063A66', 
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    lineHeight: 24,
    gap: 10,
  },
  location: {
    color: '#99A7B6',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    lineHeight: 21,
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
    height: 20,
    width: 2,
    backgroundColor: '#99A7B6',
    marginLeft: 13, // aligns with center of the icon
    zIndex: 1,
  },
  detailTitle: {
    color: '#063A66', 
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    lineHeight: 19.2,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#212121',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
  },
  startButton: {
    backgroundColor: '#ECF5FD',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: 'center',
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
