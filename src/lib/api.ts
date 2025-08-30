import axios from 'axios';

const baseURL = `${(import.meta.env.VITE_API_URL ?? 'http://localhost:10000').replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 60000,
});

type Method = 'get' | 'post' | 'put' | 'delete';

export const request = <T = unknown>(
  method: Method,
  url: string,
  data?: any
) => {
  const useParams = method === 'get' || method === 'delete';
  return api.request<T>({ method, url, ...(useParams ? { params: data } : { data }) });
};

export default api;
