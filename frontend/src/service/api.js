import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {

            const isLoginRequest = error.config.url.includes('/auth/login');

            if (!isLoginRequest) {
                console.warn("Sessão expirada. Redirecionando para login...");

                localStorage.removeItem('token');
                localStorage.removeItem('user');

                if (!window.location.pathname.includes('/login')) {

                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;