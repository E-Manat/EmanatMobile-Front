import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Dot from 'react-native-vector-icons/Octicons';

interface Task {
  id: string;
  date: string;
  status: 'İcra olunub' | 'İcra olunur' | 'İcra olunmamış';
  route: string;
  terminal: number;
  distance: string;
  address?: string;
  hours?: string;
  phone?: string;
}

const tasksData: Task[] = [
  {
    id: '1',
    date: 'Bu gün',
    status: 'İcra olunmamış',
    route: 'Narimanov',
    terminal: 150,
    distance: '2 km',
  },
  {
    id: '2',
    date: 'Dünən',
    status: 'İcra olunub',
    route: 'Narimanov',
    terminal: 150,
    distance: '1 km',
  },
  {
    id: '3',
    date: '01.02.2024',
    status: 'İcra olunur',
    route: 'Narimanov',
    terminal: 150,
    distance: '1 km',
  },
  {
    id: '4',
    date: '10.02.2024',
    status: 'İcra olunub',
    route: 'Narimanov',
    terminal: 150,
    distance: '1 km',
  },
  {
    id: '5',
    date: 'Bu gün',
    status: 'İcra olunmamış',
    route: 'Narimanov',
    terminal: 150,
    distance: '2 km',
  },
  {
    id: '6',
    date: 'Dünən',
    status: 'İcra olunub',
    route: 'Narimanov',
    terminal: 150,
    distance: '1 km',
    address: 'fdsfs',
    phone: 'fggf',
  },
  {
    id: '7',
    date: '01.02.2024',
    status: 'İcra olunur',
    route: 'Narimanov',
    terminal: 150,
    distance: '1 km',
  },
];

const filterOptions = [
  'Hamısı',
  'İcra olunub',
  'İcra olunur',
  'İcra olunmamış',
];

const TasksScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Hamısı');

  const filteredTasks =
    selectedFilter === 'Hamısı'
      ? tasksData
      : tasksData.filter(task => task.status === selectedFilter);

  const getStatusColor = (status: string) => {
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

  const renderTask = ({item}: {item: Task}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TerminalEtrafli', {taskData: item})}>
      <View
        style={[
          styles.taskCard,
          {borderLeftWidth: 3, borderLeftColor: getStatusColor(item.status)},
        ]}>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>Terminal ID</Text>
          <Text style={styles.taskText}>Rota: {item.route}</Text>
          <Text style={styles.taskText}>Terminal: {item.terminal}</Text>
        </View>
        <Text style={styles.taskDistance}>{item.distance}</Text>
      </View>
    </TouchableOpacity>
  );

  const passedCount = tasksData.filter(
    task => task.status === 'İcra olunmamış',
  ).length;
  const completedCount = tasksData.filter(
    task => task.status === 'İcra olunub',
  ).length;
  const remainingCount = tasksData.filter(
    task => task.status === 'İcra olunur',
  ).length;

  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Tapşırıqlar</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>{passedCount}</Text>
          <Text style={styles.statusLabel}>Vaxtı keçmiş</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>{completedCount}</Text>
          <Text style={styles.statusLabel}>İcra olunmuş</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusText}>{remainingCount}</Text>
          <Text style={styles.statusLabel}>Qalan</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContentContainer}>
          {filterOptions.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilter,
              ]}
              onPress={() => setSelectedFilter(filter)}>
              <Dot
                name="dot-fill"
                size={16}
                color={getStatusColor(filter)}
                style={{marginRight: 6}}
              />
              <Text style={styles.filterText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.mainContainer}>
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={renderTask}
          ListFooterComponent={<View style={{height: 20}} />}
        />
      </ScrollView>
    </View>
  );
};

export default TasksScreen;

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 20,
    margin: 'auto',
    transform: [{translateY: -30}],
    width: '80%',
    zIndex: 3,
    backgroundColor: '#fff',
    elevation: 1, // Android için yeterli
    borderRadius: 10,
  },
  statusItem: {
    alignItems: 'center',
    width: '31%',
    justifyContent: 'space-between',
  },
  statusText: {fontSize: 20, fontWeight: 'bold', color: '#001D45'},
  statusLabel: {fontSize: 12, color: '#A8A8A8'},
  filterContainer: {
    paddingHorizontal: 15,
  },
  filterContentContainer: {
    flexDirection: 'row',
  },
  activeFilter: {
    borderWidth: 1,
    borderColor: '#2D64AF',
    borderStyle: 'solid',
  },
  mainContainer: {
    marginTop: 25,
    paddingHorizontal: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 7,
    marginRight: 5,
  },
  filterText: {
    fontWeight: '500',
    fontSize: 12,
    color: '#001D45',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 9,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#001D45',
  },
  taskText: {
    fontSize: 12,
    color: '#A8A8A8',
  },
  taskDistance: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A8A8A8',
  },
});
