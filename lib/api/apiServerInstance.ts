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

export default apiServerInstance;
