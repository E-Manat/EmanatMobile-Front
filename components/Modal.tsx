import React from 'react';
import {Modal, StyleSheet, Text, View, TouchableOpacity} from 'react-native';

interface CustomModalProps {
  visible: boolean;
  description: string;
  title: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  closeable?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  description,
  title,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  closeable = false,
}) => {
  const handleOverlayPress = () => {
    if (closeable && onCancel) {
      onCancel();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleOverlayPress}>
        <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.buttonContainer}>
              {cancelText && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}>
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
              {confirmText && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={onConfirm}>
                  <Text style={styles.confirmText}>{confirmText}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 5,
    gap: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  title: {
    color: '#063A66',
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    textAlign: 'left',
  },
  description: {
    color: '#616161',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1269B5',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '48%',
  },
  cancelText: {
    color: '#1269B5',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    lineHeight: 21,
  },
  confirmButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#1269B5',
    width: '48%',
  },
  confirmText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    lineHeight: 21,
  },
});
