import { User } from "@/types/user";
import apiClient from "@/lib/api-client";

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
