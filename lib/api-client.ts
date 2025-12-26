import axios, { AxiosRequestConfig } from 'axios';
import { getDefaultStore, RESET } from "@/lib/jotai";
import { authContextAtom } from "@/providers/auth/AuthProvider";
import { isNullish } from "@/utils/common-utils";
import apiServerInstance from "@/lib/api/apiServerInstance";

const store = getDefaultStore();

// Đăng ký interceptor một lần duy nhất khi module được load
let interceptorsInitialized = false;

if (!interceptorsInitialized && typeof window !== 'undefined') {
  // Request interceptor: thêm token vào header
  apiServerInstance.interceptors.request.use(
    (config) => {
      const token = store.get(authContextAtom);
      if (token && token.token) {
        config.headers.Authorization = `Bearer ${ token.token }`;
        config.headers['x-token'] = token.token; // Gửi cả x-token để đảm bảo
      } else {
        console.warn('[apiClient] No token available for request:', config.url);
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor: xử lý refresh token khi 401
  apiServerInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const authContextType = store.get(authContextAtom);
        const requestUrl = error.config?.url || '';
        
        // Không refresh token cho các request auth (login, refresh, logout)
        const isAuthRequest = requestUrl.includes('/v1/auth/login') || 
                             requestUrl.includes('/v1/auth/refresh') || 
                             requestUrl.includes('/v1/auth/logout');
        
        // Chỉ refresh token nếu:
        // 1. Có refreshToken và token trong store
        // 2. Request có Authorization header (tức là đã có token nhưng hết hạn)
        // 3. Không phải là request auth
        const hasAuthHeader = error.config?.headers?.Authorization || error.config?.headers?.authorization;
        
        if (!isAuthRequest && hasAuthHeader && !isNullish(authContextType?.refreshToken) && !isNullish(authContextType?.token)) {
          console.log('[apiClient] Token expired, attempting refresh...');
          apiServerInstance.post<{access_token: string, refresh_token: string}>("/v1/auth/refresh", {
            refresh_token: authContextType.refreshToken,
          })
            .then((res) => {
              if (!isNullish(res?.data?.access_token) && !isNullish(res?.data?.refresh_token)) {
                console.log('[apiClient] Token refreshed successfully');
                store.set(authContextAtom, {
                  refreshToken: res?.data.refresh_token,
                  token: res?.data?.access_token,
                  isAuthenticated: true,
                });
              } else {
                console.error('[apiClient] Invalid refresh response');
                store.set(authContextAtom, RESET);
              }
            })
            .catch((err) => {
              console.error('[apiClient] Refresh token failed:', err);
              store.set(authContextAtom, RESET);
            });
        } else if (!isAuthRequest && !hasAuthHeader) {
          // Request không có token - không phải lỗi hết hạn, chỉ là chưa đăng nhập
          console.log('[apiClient] 401 without auth header - not refreshing');
        } else if (isAuthRequest) {
          // Request auth trả về 401 - không refresh
          console.log('[apiClient] 401 on auth request - not refreshing');
        } else {
          // Không có refreshToken hoặc token - reset auth
          console.log('[apiClient] 401 but no refresh token available');
          store.set(authContextAtom, RESET);
        }
      }
      return Promise.reject(error);
    },
  );
  
  interceptorsInitialized = true;
}

export const apiClient = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = apiServerInstance({
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
