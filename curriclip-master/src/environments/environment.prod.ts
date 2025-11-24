import { Capacitor } from '@capacitor/core';

export const environment = {
  production: true,
  apiUrl: getApiOrigin()
};


export function getApiOrigin(): string {
  // Native Android/iOS
  if (Capacitor.isNativePlatform()) {
    return 'https://10.0.2.2:7226';
  }
  // Browser (ionic serve)
  return 'https://localhost:7226';
}