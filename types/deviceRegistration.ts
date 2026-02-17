export interface RegisterDeviceRequest {
  deviceId: string;
  fcmToken: string;
  platform: number;
}

export interface DeactivateDeviceRequest {
  deviceId: string;
}

export interface RegisterDeviceResponse {
  success: boolean;
  message?: string;
}
