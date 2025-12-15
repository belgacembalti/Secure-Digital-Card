import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy handles this in Vite
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already refreshing
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post('/api/auth/login/refresh/', {
                        refresh: refreshToken // SimpleJWT expects 'refresh' key
                    });

                    if (response.status === 200) {
                        localStorage.setItem('access_token', response.data.access);
                        // Some backends rotate refresh tokens too
                        if (response.data.refresh) {
                            localStorage.setItem('refresh_token', response.data.refresh);
                        }

                        api.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.access;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed", refreshError);
                    // Clear tokens and redirect to login
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            } else {
                // No refresh token, force logout
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
