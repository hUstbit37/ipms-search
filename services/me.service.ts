import apiClient from '@/lib/api-client';
import { User } from "@/types/user";

export const meService = {
  me: async (signal?: AbortSignal) => {
    return await apiClient<User>(
      {
        url: "/v1/auth/me",
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
      }
    );
  },
};
