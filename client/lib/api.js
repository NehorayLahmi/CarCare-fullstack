// lib/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
const url = process.env.EXPO_PUBLIC_API_URL
const baseURL =
  Platform.OS === 'web'
    ? 'http://localhost:4000'
    : `http://${url}:4000`; // זו הכתובת של המחשב שלך ברשת הביתית
//const baseURL = 'https://e1e2-12-345-678-90.ngrok-free.app';

const api = axios.create({ baseURL });


api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
