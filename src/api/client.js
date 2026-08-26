import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Point this at Member 3's Node/Express server. The AI endpoints
// (/predictions/*) are proxied by that server through to the FastAPI
// model service, so the mobile app only ever talks to one base URL.
export const BASE_URL = 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('lunara_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Centralized place to handle 401s (expired token) app-wide later.
    return Promise.reject(err);
  }
);

export default client;
