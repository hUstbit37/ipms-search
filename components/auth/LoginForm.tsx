"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/message/error-message";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { LoginFormData, loginSchema } from "@/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, useQuery, useMutation } from "@/lib/react-query";
import { LoginBody, authService } from "@/services/auth.service";
import { useAuth, authContextAtom } from "@/providers/auth/AuthProvider";
import { meService } from "@/services/me.service";
import { sleep } from "@/utils/common-utils";
import { useMe } from "@/providers/auth/MeProvider";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useGlobalLoading } from "@/providers/loading/LoadingProvider";
import { InputPassword } from "@/components/ui/input-password";
import { getDefaultStore } from "@/lib/jotai";

export function LoginForm() {
  const router = useRouter();

  const {
    setIsGlobalLoading
  } = useGlobalLoading();

  const {
    setAuthContext,
    setAccessToken,
    setRefreshToken,
    authContext,
    resetAuth
  } = useAuth()

  const {
    setMe,
    resetMe
  } = useMe()

  const {
    handleSubmit,
    register,
    formState: {
      errors
    }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  const {
    refetch: meRefetch,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async() => await meService.me(),
    enabled: !!authContext?.token
  })

  const loginMutation = useMutation({
    mutationFn: async (body: LoginBody) => await authService.login(body),
    onSuccess: async (data) => {
      if (data?.access_token) {
        const store = getDefaultStore();
        
        // Set token và refresh token trước
        setAuthContext(true)
        setAccessToken(data.access_token)
        setRefreshToken(data?.refresh_token ?? "")
        
        // Đợi token được lưu vào localStorage và store
        // Kiểm tra token đã có trong store chưa (tối đa 2 giây)
        let retries = 0;
        const maxRetries = 20; // 20 * 100ms = 2 giây
        while (retries < maxRetries) {
          const currentAuth = store.get(authContextAtom);
          if (currentAuth?.token === data.access_token) {
            break;
          }
          await sleep(100);
          retries++;
        }

        // Invalidate queries để clear cache
        await queryClient.invalidateQueries({
          queryKey: ["me"]
        })

        // Đợi thêm một chút để đảm bảo token đã sẵn sàng trong interceptor
        await sleep(300);

        // Gọi API me với token đã được lưu
        try {
          const res = await meRefetch();
          if (res?.data) {
            setMe(res.data)
            // Đợi thêm một chút trước khi navigate để đảm bảo state đã được update
            await sleep(200);
            router.push("/search/trademarks")
            setIsGlobalLoading(false);
          } else {
            resetMe()
            toast.error("Đã có lỗi xảy ra khi lấy thông tin người dùng")
            setIsGlobalLoading(false);
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
          resetMe()
          toast.error("Đã có lỗi xảy ra khi lấy thông tin người dùng")
          setIsGlobalLoading(false);
        }
      } else {
        resetAuth()
        resetMe()
        toast.error("Thông tin tài khoản hoặc mật khẩu không chính xác")
        setIsGlobalLoading(false);
      }
    },
    onError: async (err) => {
      resetAuth()
      resetMe()
      toast.error("Thông tin tài khoản hoặc mật khẩu không chính xác")
      setIsGlobalLoading(false);
    }
  });

  const onSubmit = (data: LoginFormData) => {
    setIsGlobalLoading(true);
    loginMutation.mutate({
      ...data
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Tên đăng nhập</Label>
        <Input {...register("username")} id="username" type="text" className={`min-w-96 ${errors?.username?.message ? "border-red-500" : ""}`} placeholder="Tên đăng nhập" />
        {
          errors?.username?.message && (
            <ErrorMessage message={errors.username.message} />
          )
        }
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Mật khẩu</Label>
        <InputPassword {...register("password")} id="password" className={`min-w-96 ${errors?.password?.message ? "border-red-500" : ""}`} placeholder="Mật khẩu" />
        {
          errors?.password?.message && (
            <ErrorMessage message={errors.password.message} />
          )
        }
      </div>

      <Button type="submit" disabled={loginMutation.isPending} className="w-full">
        {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  )
}