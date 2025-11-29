import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiService} from '../services/apiService';
import {API_ENDPOINTS} from '../services/api_endpoint';

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  profileImage: string | null;
  roleName: string;
}

interface ProfileStore {
  profile: ProfileData | null;
  loading: boolean;
  loadProfile: () => Promise<void>;
  clearProfile: () => Promise<void>;
}

export const useProfileStore = create<ProfileStore>(set => ({
  profile: null,
  loading: false,

  loadProfile: async () => {
    try {
      set({loading: true});
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        return;
      }

      const result: any = await apiService.get(API_ENDPOINTS.auth.getProfile);

      if (result) {
        const savedRole = await AsyncStorage.getItem('roleName');
        const roleName = savedRole === 'Technician' ? 'Texnik' : 'Inkassator';

        const profileData: ProfileData = {
          id: result.id,
          firstName: result.firstName || 'Ad yoxdur',
          lastName: result.lastName || 'Soyad yoxdur',
          phone: result.phone || 'N/A',
          email: result.email || 'example@example.com',
          address: result.address || 'Ünvan daxil edilməyib',
          profileImage: result.profileImage || null,
          roleName,
        };

        set({profile: profileData});
        await AsyncStorage.setItem('profileData', JSON.stringify(profileData));
      }
    } catch (error) {
      console.error('Profile load error:', error);
    } finally {
      set({loading: false});
    }
  },

  clearProfile: async () => {
    set({profile: null});
    await AsyncStorage.removeItem('profileData');
  },
}));
