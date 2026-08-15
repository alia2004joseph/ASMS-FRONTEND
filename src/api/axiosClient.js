import axios from "axios";
import { ENDPOINTS } from "./endpoints.js";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../utils/authStorage.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the access token to every outgoing request when present.
axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Queue used so simultaneous 401s only trigger a single refresh call.
let isRefreshing = false;
let pendingQueue = [];

function resolvePendingQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${BASE_URL}${ENDPOINTS.auth.refresh}`, {
        refresh: refreshToken,
      });
      setTokens({ access: data.access, refresh: data.refresh ?? refreshToken });
      resolvePendingQueue(null, data.access);
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      resolvePendingQueue(refreshError, null);
      clearTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
