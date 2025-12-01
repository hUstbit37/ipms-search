"use client"

import axios from "axios";

const apiServerInstance = axios.create({
  baseURL: `/api`,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

export default apiServerInstance;
