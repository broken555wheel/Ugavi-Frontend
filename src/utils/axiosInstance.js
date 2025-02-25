import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: true, 
});

axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('access');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
  
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
  
        try {
          const refreshToken = localStorage.getItem('refresh');
          if (refreshToken) {
            const response = await axiosInstance.post('/jwt/refresh/', {
              refresh: refreshToken,
            });
  
            const { access } = response.data;
            localStorage.setItem('access', access);
  
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            originalRequest.headers['Authorization'] = `Bearer ${access}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          
        }
      }
  
      return Promise.reject(error);
    }
  );
  
export default axiosInstance;