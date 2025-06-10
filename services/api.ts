import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuração da URL base dependendo do ambiente
const getBaseUrl = () => {
  // URL do backend na Vercel
  return 'https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app';
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem('@FunnyAuth:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginData {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
}

export interface AuthResponse {
  token?: string;
  id?: number;
  nome?: string;
  email?: string;
  erro?: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      if (response.data.token) {
        await AsyncStorage.setItem('@FunnyAuth:token', response.data.token);
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error;
      }
      throw new Error('Erro ao fazer login');
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error;
      }
      throw new Error('Erro ao fazer cadastro');
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('@FunnyAuth:token');
  }
};

export default api; 