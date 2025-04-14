import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkTokenExpiry = async (): Promise<boolean> => {
  try {
    const expiresAt = await AsyncStorage.getItem('expiresAt');
    if (!expiresAt) return true;

    const now = new Date();
    const expiryDate = new Date(expiresAt);

    return now > expiryDate; 
  } catch (error) {
    console.error('Token expiry yoxlanarkən xəta:', error);
    return true;
  }
};
