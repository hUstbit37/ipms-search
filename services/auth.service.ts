import apiClient from '@/lib/api-client';
import apiServerInstance from "@/lib/api/apiServerInstance";

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
    return await apiServerInstance.post<LoginResponse>("/auth/login", body, { signal });
  },

  logout: async (signal?: AbortSignal) => {
    return await apiServerInstance.post("/auth/logout", { signal });
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
