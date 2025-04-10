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
      navigation.navigate('TaskProcess', {
        taskData,
        startTime: new Date().getTime(), // Pass start time when task starts
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
        return 'İnkassiya prosesi gedir';
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Terminal</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.terminalInfo}>
        <Text style={styles.terminalName}>
          <Icon name="location-dot" size={20} color="#1976D2" /> Terminal :
          {taskData?.terminal?.code}
        </Text>
        <View style={styles.statusContainer}>
          <Text style={styles.location}>{taskData.terminal?.address}</Text>
        </View>
      </View>

      <Image source={require('../assets/img/araz.png')} style={styles.image} />

      <View style={styles.details}>
        <Text style={styles.detailTitle}>{taskData.routeName}</Text>

        <View style={styles.detailRow}>
          <Icon name="location-dot" size={20} color="#1976D2" />
          <Text style={styles.detailText}>{taskData.terminal?.address}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon1 name="watch-later" size={20} color="#1976D2" />
          <Text style={styles.detailText}>
            {taskData.terminal.workingHours || 'Qeyd olunmayib'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="phone" size={20} color="#1976D2" />
          <Text style={styles.detailText}>
            {taskData.terminal.phone || 'Qeyd olunmayib'}
          </Text>
        </View>
      </View>

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Tapşırığa başlamaq istəyirsiniz?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: '#1976D2'}]}
                onPress={handleStartTask}
                disabled={loading}>
                <Text style={styles.modalButtonText}>Bəli</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, {backgroundColor: '#ccc'}]}
                onPress={() => setConfirmVisible(false)}>
                <Text style={[styles.modalButtonText, {color: '#000'}]}>
                  İmtina
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {taskData.status === 0 ? (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setConfirmVisible(true)}>
          <Text style={styles.startButtonText}>Tapşırığa başla</Text>
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
    fontSize: 18,
    gap: 6,
    fontWeight: 'bold',
  },
  location: {
    color: '#666',
    fontSize: 16,
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
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2D64AF',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#001D45',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#BFDDF2',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: 'bold',
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
