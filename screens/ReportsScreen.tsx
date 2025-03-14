import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconDoc from 'react-native-vector-icons/Ionicons';
const DATA = [
  {
    id: '1',
    title: 'Terminal ID',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
  {
    id: '2',
    title: 'Terminal ID',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
  {
    id: '3',
    title: 'Terminal ID',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
  {
    id: '4',
    title: 'Terminal ID',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
  {
    id: '2',
    title: 'Terminal ID',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
  {
    id: '3',
    title: 'Terminal ID',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
  {
    id: '4',
    title: 'Terminal ID',
    date: '07/08/2024',
    time: '15:30-17:00',
    status: 'Tamamlandı',
  },
];

const ReportsScreen = () => {
  const navigation = useNavigation();
  const renderItem = ({item}: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('HesabatEtrafli', {report: item})}>
      {' '}
      <View style={styles.card}>
        <IconDoc
          name="document-outline"
          size={24}
          color="#2D64AF"
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <View style={styles.statusContainer}>
          {' '}
          <Text style={styles.time}>{item.time}</Text>
          <Text style={styles.status}>{item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Hesabatlar</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={18}
          color="#2D64AF"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Axtar..."
          placeholderTextColor="#2D64AF"
          style={styles.input}
        />
      </View>

      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ReportsScreen;

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 15,
  },
  input: {
    fontSize: 14,
    color: '#2D64AF',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: 90,
  },
  icon: {
    marginRight: 10,
    marginTop: 5,
  },
  textContainer: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#2D64AF',
  },
  date: {
    fontSize: 12,
    color: '#A8A8A8',
  },
  time: {
    fontSize: 12,
    color: '#A8A8A8',
    fontWeight: 400,
    textAlign: 'right',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#29C0B9',
  },
  statusContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 5,
    height: '100%',
  },
});
