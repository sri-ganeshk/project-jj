import axios from 'axios';

// Connect to NestJS backend
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://backend.sriganeshk.in/api/v1',
});

export default api;
