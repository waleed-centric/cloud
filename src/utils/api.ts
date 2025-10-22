import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: attach auth token if available
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: centralized error logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API error:', error?.response?.status, error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Convenience helpers
export const get = async <T = any>(url: string, config?: AxiosRequestConfig) => {
  const res = await apiClient.get<T>(url, config);
  return res.data;
};

export const post = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
};

export const put = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
  const res = await apiClient.put<T>(url, data, config);
  return res.data;
};

export const del = async <T = any>(url: string, config?: AxiosRequestConfig) => {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
};

export const upload = async <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig) => {
  const res = await apiClient.post<T>(url, formData, {
    ...config,
    headers: { ...(config?.headers || {}), 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export default apiClient;