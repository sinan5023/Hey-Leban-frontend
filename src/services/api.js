

import axios from "axios";
import { useAuthStore } from "../store/authStore";




const API_BASE_URL = import.meta.env.VITE_API_URL;


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});


const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});


api.interceptors.request.use((config) => {
  if (window.accessToken) {
    config.headers.Authorization = `Bearer ${window.accessToken}`;
  }
  return config;
});


let isRefreshing = false;
let failedQueue = [];


const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });


  failedQueue = [];
};


// ── Sales-session guard interceptor ──────────────────────────────────────────
// The backend middleware returns 409 when a session-gated action (create order,
// KOT, payment) is attempted without an open session. We intercept that here
// and redirect to /open-sales so every page doesn't have to handle it.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || "";
    const method = error?.config?.method?.toLowerCase();

    if (
      status === 409 &&
      message.toLowerCase().includes("sales session is not opened")
    ) {
      // Only redirect for mutations (take order, checkout, etc), NOT for GET requests
      if (method !== "get" && window.location.pathname !== "/open-sales") {
        window.location.href = "/open-sales";
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;


    const status = error?.response?.status;
    const message = error?.response?.data?.message || "";
    
    const isTokenExpired = 
      status === 401 || 
      message.toLowerCase().includes("jwt expired") ||
      message.toLowerCase().includes("token expired");

    if (!isTokenExpired || originalRequest?._retry) {
      return Promise.reject(error);
    }


    if (originalRequest?.url?.includes("/api/auth/refresh")) {
      window.accessToken = null;
      return Promise.reject(error);
    }


    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }


    originalRequest._retry = true;
    isRefreshing = true;


    try {
      const refreshResponse = await refreshClient.post("/api/auth/refresh", {});


      const newAccessToken = refreshResponse.data.data.accessToken;
      window.accessToken = newAccessToken;


      processQueue(null, newAccessToken);


      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      window.accessToken = null;
      useAuthStore.getState().clearAuth();


      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }


      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);


export default api;