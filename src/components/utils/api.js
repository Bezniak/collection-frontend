import axios from 'axios';
import Cookies from 'js-cookie';

// Создаем новый экземпляр axios
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

// Добавляем интерсептор для отправки токена авторизации в каждом запросе
api.interceptors.request.use(
    (config) => {
        const jwt = Cookies.get('JWT');
        if (jwt) {
            config.headers.Authorization = `Bearer ${jwt}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Добавляем интерсептор для обработки ошибок ответа
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
