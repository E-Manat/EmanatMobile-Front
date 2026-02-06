import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import {API_ENDPOINTS} from './api_endpoint';

let navigationRef: any = null;

export const setNavigation = (nav: any) => {
  navigationRef = nav;
};

const checkTokenExpiry = async (): Promise<boolean> => {
  try {
    const expiresAt = await AsyncStorage.getItem('expiresAt');
    if (!expiresAt) {
      return true;
    }

    const now = new Date();
    const expiryDate = new Date(expiresAt);

    return now >= expiryDate;
  } catch (error) {
    console.error('Token expiry yoxlanarkən xəta:', error);
    return true;
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      await logout();
      return null;
    }
    const response = await fetch(
      `${Config.API_URL}${API_ENDPOINTS.auth.refreshToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({token: refreshToken}),
      },
    );

    if (!response.ok) {
      await logout();
      return null;
    }

    const data = await response.json();

    if (data.accessToken) {
      await AsyncStorage.multiSet([
        ['userToken', data.accessToken],
        ['expiresAt', data.expires || ''],
      ]);

      if (data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }

      return data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('Token yeniləmə xətası:', error);
    await logout();
    return null;
  }
};

const logout = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (refreshToken) {
      try {
        await fetch(`${Config.API_URL}${API_ENDPOINTS.auth.logout}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({token: refreshToken}),
        });
      } catch (error) {
        console.error('Logout API xətası:', error);
      }
    }
  } catch (error) {
    console.error('Logout prosesində xəta:', error);
  } finally {
    await AsyncStorage.multiRemove([
      'userToken',
      'refreshToken',
      'isLoggedIn',
      'expiresAt',
      'userId',
      'roleName',
    ]);
    navigationRef?.current?.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  }
};

const getToken = async (): Promise<string> => {
  let token = await AsyncStorage.getItem('userToken');

  if (!token) {
    await logout();
    throw new Error('Token yoxdur');
  }

  const isExpired = await checkTokenExpiry();

  if (isExpired) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      throw new Error('Token yenilənmədi');
    }
    token = newToken;
  }

  return token;
};

const request = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  body?: any,
  isMultipart = false,
  requiresAuth = true,
) => {
  const headers: Record<string, string> = {};

  if (requiresAuth) {
    const token = await getToken();
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  let res = await fetch(`${Config.API_URL}${endpoint}`, {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && requiresAuth) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${Config.API_URL}${endpoint}`, {
        method,
        headers,
        body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
      });

      if (res.status === 401) {
        await logout();
        throw new Error('Session expired');
      }
    } else {
      await logout();
      throw new Error('Session expired');
    }
  }

  const contentType = res.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
};

export const validateTokenWithBackend = async (): Promise<boolean> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const accessToken = await AsyncStorage.getItem('userToken');

    if (!refreshToken || !accessToken) {
      await logout();
      return false;
    }

    const isExpired = await checkTokenExpiry();

    if (isExpired) {
      const newToken = await refreshAccessToken();
      return newToken !== null;
    }

    const response = await fetch(
      `${Config.API_URL}${API_ENDPOINTS.auth.refreshToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({token: refreshToken}),
      },
    );

    if (!response.ok) {
      await logout();
      return false;
    }

    const data = await response.json();

    if (data.accessToken) {
      await AsyncStorage.multiSet([
        ['userToken', data.accessToken],
        ['expiresAt', data.expires || ''],
      ]);

      if (data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
      }
    }

    return true;
  } catch (error) {
    console.error('Token validation xətası:', error);
    await logout();
    return false;
  }
};

export const apiService = {
  get: (endpoint: string) => request(endpoint, 'GET'),
  post: (endpoint: string, body: any) => request(endpoint, 'POST', body),
  put: (endpoint: string, body: any) => request(endpoint, 'PUT', body),
  patch: (endpoint: string, body: any) => request(endpoint, 'PATCH', body),
  delete: (endpoint: string) => request(endpoint, 'DELETE'),
  postMultipart: (endpoint: string, formData: FormData) =>
    request(endpoint, 'POST', formData, true),
  postWithoutAuth: (endpoint: string, body: any) =>
    request(endpoint, 'POST', body, false, false),
  getWithoutAuth: (endpoint: string) =>
    request(endpoint, 'GET', undefined, false, false),
};
