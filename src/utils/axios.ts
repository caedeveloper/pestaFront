import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/',
    timeout: 30000
});

api.interceptors.request.use((config) => {
    const auth = useAuthStore();
    const token = auth.accessToken;
    if (token && token !== 'demo-local' && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const auth = useAuthStore();
        if ([401, 403].includes(error.response?.status) && auth.hasRealSession) await auth.logout();
        return Promise.reject(error);
    }
);

export default api;
