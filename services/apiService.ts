import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://emanat-api.siesco.studio';

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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
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
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
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
   get : async (endpoint: string): Promise<any> => {
    const token = await getToken();
    if (!token) throw new Error('Token tapılmadı.');
  
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
  
    const res = await fetch(`${BASE_URL}${endpoint}`, {
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
  delete: (endpoint: string) => request(endpoint, 'DELETE'),
  postMultipart: (endpoint: string, formData: FormData) =>
    request(endpoint, 'POST', formData, true),
};
