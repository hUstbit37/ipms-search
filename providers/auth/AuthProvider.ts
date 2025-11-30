import { useCallback } from "react";
import { atomWithStorage, useAtom } from "@/lib/jotai";

export interface AuthContextType {
  isAuthenticated: boolean;
  token?: string;
  refreshToken?: string;
}

const initialAuthContext: AuthContextType = {
  isAuthenticated: false,
};

export const authContextAtom = atomWithStorage("authContext", initialAuthContext);

export function useAuth() {
  const [authContext, setAuthContext] = useAtom(authContextAtom);

  const updateAuthContext = useCallback(
    (isAuthenticated: boolean) => {
      setAuthContext((prevState) => ({
        ...prevState,
        isAuthenticated,
      }));
    },
    [setAuthContext],
  );

  const updateAccessToken = useCallback(
    (token: string | undefined) => {
      setAuthContext((prev) => ({
        ...prev,
        token,
      }));
    },
    [setAuthContext],
  );

  const updateRefreshToken = useCallback(
    (refreshToken: string | undefined) => {
      setAuthContext((prev) => ({
        ...prev,
        refreshToken,
      }));
    },
    [setAuthContext],
  );

  const resetAuthContext = useCallback(() => {
    setAuthContext(initialAuthContext);
  }, [setAuthContext]);

  return {
    authContext,
    setAuthContext: updateAuthContext,
    setAccessToken: updateAccessToken,
    setRefreshToken: updateRefreshToken,
    resetAuth: resetAuthContext,
  };
}
