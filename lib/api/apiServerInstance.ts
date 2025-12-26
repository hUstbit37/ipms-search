"use client"

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_SERVER_BASE_URL || '/api';

const apiServerInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to remove Content-Type for blob requests
apiServerInstance.interceptors.request.use((config) => {
  // Don't set Content-Type for blob responses
  if (config.responseType === 'blob') {
    delete config.headers['Content-Type'];
  }
  return config;
});

export default apiServerInstance;
