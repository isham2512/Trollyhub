import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("trollyhub_auth");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.token) config.headers.Authorization = `Bearer ${parsed.token}`;
    } catch { localStorage.removeItem("trollyhub_auth"); }
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) localStorage.removeItem("trollyhub_auth");
    return Promise.reject(err);
  }
);

export default api;
