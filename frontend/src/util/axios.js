import axios from 'axios';
import Cookie from 'js-cookie';

const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// Must match PORT in backend/.env. Override per-machine with VITE_API_PORT.
const localPort = import.meta.env.VITE_API_PORT || 4400;

export const serverUrl = 'https://server.cnppromo.com/api/v1';
export const localUrl = `http://localhost:${localPort}/api/v1`;
export const socketUrl = isLocal ? `http://localhost:${localPort}` : "https://server.cnppromo.com";

// axios configuration
export const api = axios.create({
    baseURL: isLocal ? localUrl : serverUrl,
});

// Add request interceptor
api.interceptors.request.use((config) => {
    const token = Cookie.get('token-you');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Remove invalid token and redirect to login
            Cookie.remove('token-you');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
