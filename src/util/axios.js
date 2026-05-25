import axios from 'axios'
import Cookie from 'js-cookie'

const serverUrl = 'https://server.cnppromo.com/api/v1'
const localUrl = 'http://localhost:4000/api/v1'
export const socketUrl = "https://server.cnppromo.com"
// axios configuration
export const api = axios.create({
    baseURL: serverUrl,
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



