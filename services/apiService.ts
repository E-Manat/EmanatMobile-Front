import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

console.log(Config.API_URL, 'API_URL');

let navigationRef: any = null;

export const setNavigation = (nav: any) => {
  navigationRef = nav;
};

const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (error) {
    console.error('Token alınarkən xəta:', error);
    return null;
  }
};

const request = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  body?: any,
  isMultipart: boolean = false,
): Promise<any> => {
  const token = await getToken();
  if (!token) throw new Error('Token tapılmadı.');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  const options: RequestInit = {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
  };

  try {
    const res = await fetch(`${Config.API_URL}${endpoint}`, options);
    console.log(res, 'geden sorgu');

    if (res.status === 401) {
      await AsyncStorage.multiRemove(['userToken', 'isLoggedIn']);
      if (navigationRef) {
        navigationRef?.current?.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }
      throw new Error('Sessiya bitib, yenidən daxil olun.');
    }

    const contentType = res.headers.get('Content-Type');
    const result = contentType?.includes('application/json')
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      console.error('API xəta:', result);
      throw new Error(result?.message || 'Server xətası');
    }

    return result;
  } catch (error) {
    console.error('API sorğusunda xəta:', error);
    throw error;
  }
};

export const apiService = {
  get: async (endpoint: string): Promise<any> => {
    const token = await getToken();
    if (!token) throw new Error('Token tapılmadı.');

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(`${Config.API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    const contentType = res.headers.get('Content-Type');
    const result = contentType?.includes('application/json')
      ? await res.json()
      : await res.text();

    return result;
  },
  post: (endpoint: string, body: any) => request(endpoint, 'POST', body),
  put: (endpoint: string, body: any) => request(endpoint, 'PUT', body),
  patch: (endpoint: string, body: any) => request(endpoint, 'PATCH', body),
  delete: (endpoint: string) => request(endpoint, 'DELETE'),
  postMultipart: (endpoint: string, formData: FormData) =>
    request(endpoint, 'POST', formData, true),
};
