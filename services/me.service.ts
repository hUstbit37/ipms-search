import { User } from "@/types/user";
import apiServerInstance from "@/lib/api/apiServerInstance";

export const meService = {
  me: async (signal?: AbortSignal) => {
    return await apiServerInstance.get<User>("/auth/me", { signal });
  },
};
