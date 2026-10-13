import axios from 'axios';

// Giữ nguyên port backend của bạn (7010)
const BASE_URL = 'https://localhost:7010/api'; 

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm Interceptor: Tự động đính kèm Token vào Header trước khi gửi API
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('bookparadise_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;