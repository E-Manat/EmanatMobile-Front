import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const TaskProcessScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          {/* <Ionicons name="chevron-back" size={24} color="#fff" /> */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İnkassasiya prosesinə başla</Text>
      </View>

      <Text style={styles.timer}>00:10</Text>

      <View style={styles.locationBox}>
        <View style={styles.row}>
          {/* <Ionicons name="location-sharp" size={16} color="#1B5EBE" /> */}
          <Text style={styles.terminalText}>Terminal 2436</Text>
          <View style={styles.dot} />
        </View>
        <Text style={styles.marketName}>Araz Azadlıq Minimarket</Text>
        <Text style={styles.kmText}>2.9 km</Text>
      </View>

      <TouchableOpacity style={styles.coordButton}>
        <Text style={styles.coordButtonText}>
          Cari koordinatlarınızı paylaşın
        </Text>
        {/* <Ionicons name="location-outline" size={16} color="#1B5EBE" /> */}
      </TouchableOpacity>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.endJobButton}>
          <Text style={styles.endJobText}>İşi sonlandır</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createReportButton}>
          <Text style={styles.createReportText}>Hesabat yarat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TaskProcessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: '#1B5EBE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '600',
  },
  timer: {
    fontSize: 30,
    color: '#1B5EBE',
    textAlign: 'center',
    marginVertical: 20,
  },
  locationBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  terminalText: {
    fontSize: 16,
    marginLeft: 6,
    color: '#000',
    fontWeight: '600',
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: 'red',
    borderRadius: 4,
    marginLeft: 'auto',
  },
  marketName: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
  kmText: {
    position: 'absolute',
    right: 0,
    top: 24,
    color: '#1B5EBE',
    fontWeight: '500',
  },
  coordButton: {
    backgroundColor: '#EAF2FF',
    padding: 14,
    borderRadius: 8,
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  coordButtonText: {
    color: '#1B5EBE',
    fontWeight: '600',
    marginRight: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 30,
  },
  endJobButton: {
    backgroundColor: '#1B5EBE',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  endJobText: {
    color: '#fff',
    fontWeight: '600',
  },
  createReportButton: {
    borderColor: '#1B5EBE',
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createReportText: {
    color: '#1B5EBE',
    fontWeight: '600',
  },
});
