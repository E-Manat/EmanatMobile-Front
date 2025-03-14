import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon1 from 'react-native-vector-icons/MaterialIcons';

const TerminalDetailsScreen = ({route, navigation}: any) => {
  const {taskData} = route.params;

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'İcra olunub':
        return '#00C0EF';
      case 'İcra olunur':
        return '#FFC107';
      case 'İcra olunmamış':
        return '#F44336';
      default:
        return '#CCC';
    }
  };

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
          <Icon name="location-dot" size={20} color="#1976D2" />
          Terminal 2436
        </Text>
        <Text style={styles.location}>Araz Azadlıq Minimarket</Text>
        <Text style={styles.distance}>2.9 km</Text>
      </View>

      <Image source={require('../assets/img/araz.png')} style={styles.image} />

      <View style={styles.details}>
        <Text style={styles.detailTitle}>Araz Azadlıq Minimarket</Text>
        <View style={styles.detailRow}>
          <Icon name="location-dot" size={20} color="#1976D2" />
          <Text style={styles.detailText}>
            Azadlıq avenu 15a/4 Baku AZ, Bakı
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Icon1 name="watch-later" size={20} color="#1976D2" />
          <Text style={styles.detailText}>08:00 - 23:00</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="phone" size={20} color="#1976D2" />
          <Text style={styles.detailText}>055-515-85-01</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>Tapşırığa başla</Text>
      </TouchableOpacity>
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
  terminalInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  terminalName: {
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
});
