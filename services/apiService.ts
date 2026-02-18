import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import {API_ENDPOINTS} from './api_endpoint';
import {getDeviceId} from '../utils/deviceId';
import {navigationRef} from '@utils/navigationUtils';
import {Routes} from '@navigation/routes';

export const setNavigation = (_nav: any) => {};

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
      await logoutFn();
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
      await logoutFn();
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
    await logoutFn();
    return null;
  }
};

const logoutFn = async () => {
  if (__DEV__) {
    console.log('[Logout] Starting logout flow');
  }

  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const accessToken = await AsyncStorage.getItem('userToken');

    if (refreshToken) {
      if (__DEV__) {
        console.log('[Logout] Refresh token:', refreshToken);
        console.log('[Logout] Calling logout API');
      }
      try {
        const logoutHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (accessToken) {
          logoutHeaders.Authorization = `Bearer ${accessToken}`;
        }
        const logoutRes = await fetch(`${Config.API_URL}/auth/Auth/Logout`, {
          method: 'POST',
          headers: logoutHeaders,
          body: JSON.stringify({token: refreshToken}),
        });
        if (__DEV__) {
          console.log('[Logout] Logout API response:', logoutRes.status);
        }
      } catch (error) {
        console.error('[Logout] Logout API xətası:', error);
      }
    } else {
      if (__DEV__) {
        console.log('[Logout] No refresh token, skipping logout API');
      }
    }

    try {
      const deviceId = await getDeviceId();
      const accessToken = await AsyncStorage.getItem('userToken');
      if (__DEV__) {
        console.log('[Logout] Deactivating device (FCM)');
      }
      const deactivateHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        deactivateHeaders.Authorization = `Bearer ${accessToken}`;
      }
      const deactivateRes = await fetch(
        `${Config.API_URL}${API_ENDPOINTS.device.deactivate}`,
        {
          method: 'POST',
          headers: deactivateHeaders,
          body: JSON.stringify({deviceId}),
        },
      );
      if (__DEV__) {
        console.log(
          '[Logout] Device deactivation response:',
          deactivateRes.status,
        );
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('[Logout] Device deactivation failed:', err);
      }
    }
  } catch (error) {
    console.error('[Logout] Logout prosesində xəta:', error);
  } finally {
    if (__DEV__) {
      console.log('[Logout] Clearing storage and navigating to Auth');
    }
    await AsyncStorage.multiRemove([
      'userToken',
      'refreshToken',
      'isLoggedIn',
      'expiresAt',
      'userId',
      'roleName',
      'userPin',
    ]);
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{name: Routes.auth}],
      });
    }
    if (__DEV__) {
      console.log('[Logout] Logout complete');
    }
  }
};

const getToken = async (): Promise<string> => {
  let token = await AsyncStorage.getItem('userToken');

  if (!token) {
    await logoutFn();
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
        await logoutFn();
        throw new Error('Session expired');
      }
    } else {
      await logoutFn();
      throw new Error('Session expired');
    }
  }

  const contentType = res.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const err = new Error(
      typeof data === 'object'
        ? data?.message || 'Request failed'
        : String(data || 'Request failed'),
    ) as Error & {status?: number; responseData?: unknown};
    err.status = res.status;
    err.responseData = data;
    throw err;
  }

  return data;
};

export const validateTokenWithBackend = async (): Promise<boolean> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const accessToken = await AsyncStorage.getItem('userToken');

    if (!refreshToken || !accessToken) {
      await logoutFn();
      return false;
    }

    const isExpired = await checkTokenExpiry();

    if (!isExpired) {
      return true;
    }

    const newToken = await refreshAccessToken();
    return newToken !== null;
  } catch (error) {
    console.error('Token validation xətası:', error);
    await logoutFn();
    return false;
  }
};

export const logout = logoutFn;

export const apiService = {
  get: (endpoint: string) => request(endpoint, 'GET'),
  post: (endpoint: string, body: any) => request(endpoint, 'POST', body),
  put: (endpoint: string, body: any) => request(endpoint, 'PUT', body),
  patch: (endpoint: string, body: any) => request(endpoint, 'PATCH', body),
  delete: (endpoint: string, body?: any) => request(endpoint, 'DELETE', body),
  postMultipart: (endpoint: string, formData: FormData) =>
    request(endpoint, 'POST', formData, true),
  postWithoutAuth: (endpoint: string, body: any) =>
    request(endpoint, 'POST', body, false, false),
  getWithoutAuth: (endpoint: string) =>
    request(endpoint, 'GET', undefined, false, false),
};
