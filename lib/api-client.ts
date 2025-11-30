import axios, { AxiosRequestConfig } from 'axios';
import apiInstance from "@/lib/api/apiInstance";
import { getDefaultStore, RESET } from "@/lib/jotai";
import { authContextAtom } from "@/providers/auth/AuthProvider";
import { isNullish } from "@/utils/common-utils";

const store = getDefaultStore();

export const apiClient = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();

  apiInstance.interceptors.request.use(
    (config) => {
      const token = store.get(authContextAtom);
      if (token && token.token) {
        config.headers.Authorization = `Bearer ${ token.token }`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const authContextType = store.get(authContextAtom);
        if (!isNullish(authContextType?.refreshToken) && !isNullish(authContextType?.token)) {
          apiInstance.post<{access_token: string, refresh_token: string}>("/v1/auth/refresh", {
            refresh_token: authContextType.refreshToken,
          })
            .then((res) => {
              if (!isNullish(res.data?.access_token) && !isNullish(res.data?.refresh_token)) {
                store.set(authContextAtom, {
                  refreshToken: res.data.refresh_token,
                  token: res.data.access_token,
                  isAuthenticated: true,
                });
              } else {
                store.set(authContextAtom, RESET);
              }
            })
            .catch((err) => {
              console.error(err);
              store.set(authContextAtom, RESET);
            });
        } else {
          store.set(authContextAtom, RESET);
        }
      }
      return Promise.reject(error);
    },
  );
  const promise = apiInstance({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error promise has cancel
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export default apiClient;
