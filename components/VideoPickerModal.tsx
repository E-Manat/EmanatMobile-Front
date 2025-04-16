import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {FolderIcon, ImageIcon, VideoIcon} from '../assets/icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPickGallery: () => void;
  onPickFile?: () => void;
  onRecordVideo: () => void;
}

const VideoPickerModal = ({
  visible,
  onClose,
  onPickGallery,
  onPickFile,
  onRecordVideo,
}: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Video seçimi</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={22} color="#000" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.option} onPress={onPickGallery}>
            <ImageIcon color="#1269B5" />
            <Text style={styles.optionText}>Qalereyadan seç</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.option} onPress={onPickFile}>
            <FolderIcon color="#1269B5" />
            <Text style={styles.optionText}>Fayl menecerdən seç</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.option} onPress={onRecordVideo}>
            <VideoIcon color="#1269B5" />
            <Text style={styles.optionText}>Kamera ilə çək</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default VideoPickerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#212121',
    textAlign: 'center',
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  optionText: {
    color: '#212121',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
