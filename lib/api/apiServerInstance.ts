"use client"

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

const apiServerInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to handle blob requests properly
apiServerInstance.interceptors.request.use((config) => {
  // For blob responses, set proper Accept header and remove Content-Type
  if (config.responseType === 'blob') {
    delete config.headers['Content-Type'];
    // Set Accept header if not already set
    if (!config.headers['Accept']) {
      config.headers['Accept'] = 'application/octet-stream, application/pdf, */*';
    }
  }
  return config;
});

export default apiServerInstance;
