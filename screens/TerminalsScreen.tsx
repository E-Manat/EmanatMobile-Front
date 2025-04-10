import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import TopHeader from '../components/TopHeader';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  AvatarIcon,
  LocationIcon,
  MapIcon,
  RoadIcon,
  TabletIcon,
  UserIcon,
} from '../assets/icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiService} from '../services/apiService';
const terminals = Array(8).fill({
  id: '67',
  fullness: '10% dolu',
  passengerCount: 1500,
  amount: '1500 AZN',
});

const TerminallarScreen = () => {
  const [selectedTerminal, setSelectedTerminal] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [terminals, setTerminals] = useState<any[]>([]);
  const openModal = (terminal: any) => {
    setSelectedTerminal(terminal);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTerminal(null);
  };

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await apiService.get('/Terminal/GetAll');
        console.log(response, 'response');
        setTerminals(response);
      } catch (error) {
        console.error('Reportlar alınarkən xəta:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const TerminalCard = ({terminal}: any) => (
    <TouchableOpacity onPress={() => openModal(terminal)}>
      <View style={styles.card}>
        <View style={styles.left}>
          <View style={styles.pgCircle}>
            <Text style={styles.pgText}>PG</Text>
            <View style={styles.dot} />
          </View>
          <View>
            <Text
              // style={styles.terminalId}
              style={{fontFamily: 'DMSans-Regular'}}>
              Terminal ID – {terminal.id}
            </Text>
            <Text style={styles.infoText}>
              Əsginas sayı: {terminal.passengerCount}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <View style={styles.fullnessBox}>
            <Text style={styles.fullnessText}>{terminal.fullness}</Text>
          </View>
          <Text style={styles.infoText}>Məbləğ: {terminal.amount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Terminallar" />

      <FlatList
        data={terminals}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item}) => <TerminalCard terminal={item} />}
        contentContainerStyle={{paddingBottom: 20}}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.title}>Digər məlumatlar</Text>
              <TouchableOpacity onPress={closeModal}>
                <Icon name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: 'https://via.placeholder.com/100x100.png?text=photoname.jpg',
                  }}
                  style={styles.image}
                />
                <Text style={styles.imageText}>photoname.jpg</Text>
                <Text style={styles.imageSize}>22.5 KB</Text>
              </View>
              <InfoItem
                icon={<TabletIcon color="#1269B5" />}
                label="Terminal ID"
                value={selectedTerminal?.id}
              />
              <InfoItem icon={<AvatarIcon />} label="Şirkət" value="E-manat" />
              <InfoItem
                icon={<MapIcon color="#1269B5" />}
                label="Bölgə"
                value="Bakı"
              />
              <InfoItem
                icon={<RoadIcon color="#1269B5" />}
                label="Ərazi"
                value="Nərimanov rayonu"
              />
              <InfoItem
                icon={<LocationIcon color="#1269B5" />}
                label="Ünvan"
                value="Əhməd Rəcəbli 183"
              />
              <InfoItem
                icon={<UserIcon color="#1269B5" />}
                label="Məsul şəxs"
                value="055 563 23 20"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const InfoItem = ({icon, label, value}: any) => (
  <View style={styles.infoItem}>
    {icon && <View style={styles.infoIcon}>{icon}</View>}
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
    paddingTop: StatusBar.currentHeight || 0,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pgCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  pgText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  terminalId: {
    color: '#1269B5',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    color: '#616161',
    fontSize: 12,
  },
  right: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  fullnessBox: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  fullnessText: {
    color: '#43A047',
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1, // Adds the bottom border
    borderBottomColor: '#ddd', // Sets the color of the border
    paddingVertical: 10,
  },
  title: {
    color: '#063A66', // Default color if --Primary-primary-800 is not defined
    fontFamily: 'DM Sans',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 24, // 150% of 16px
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  imageText: {
    fontWeight: '500',
  },
  imageSize: {
    fontSize: 12,
    color: '#777',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  infoLabel: {
    color: '#063A66', // Default color if --Primary-primary-800 is not defined
    fontFamily: 'DM Sans',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 24, // 150% of 16px (16 * 1.5)
  },
  infoValue: {
    color: '#616161', // Default color if --Neutral-700 is not defined
    fontFamily: 'DM Sans',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 21, // 150% of 14px (14 * 1.5)
  },
});

export default TerminallarScreen;
