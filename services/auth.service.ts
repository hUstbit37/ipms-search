import apiClient from '@/lib/api-client';



export interface LoginBody {
  username: string;
  password: string;
}

export interface ChangePasswordBody {
  new_password: string;
  old_password: string;
}

export interface RefreshBody {
  refresh_token: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export const authService = {
  login: async (body: LoginBody, signal?: AbortSignal) => {
    return await apiClient<LoginResponse>(
      {
        // baseURL: process.env?.NEXT_PUBLIC_API_AUTH_BASE_URL ?? "/api",
        url: "/v1/auth/login",
        method: "POST",
        data: body,
        headers: { "Content-Type": "application/json" },
        signal
      }
    );
  },

  logout: async (signal?: AbortSignal) => {
    return await apiClient(
      {
        baseURL: process.env?.NEXT_PUBLIC_API_AUTH_BASE_URL ?? "/api",
        url: "/v1/auth/logout",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal
      }
    );
  },

  changePassword: async (body: ChangePasswordBody, signal?: AbortSignal) => {
    return await apiClient(
      {
        url: "/v1/auth/change-password",
        method: "POST",
        data: body,
        headers: { "Content-Type": "application/json" },
        signal
      }
    );
  },
};
