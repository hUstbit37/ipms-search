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
import { useAuth } from "@/providers/auth/AuthProvider";
import { meService } from "@/services/me.service";
import { sleep } from "@/utils/common-utils";
import { useMe } from "@/providers/auth/MeProvider";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();

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
      if (data?.data?.access_token) {
        setAuthContext(true)
        setAccessToken(data.data.access_token)
        setRefreshToken(data.data?.refresh_token ?? "")
        await queryClient.invalidateQueries({
          queryKey: ["me"]
        })

        await sleep(300);

        await meRefetch().then((res) => {
          if (res?.data) {
            setMe(res.data)
            router.push("/search/trademarks")
          } else {
            resetMe()
            toast.error("Đã có lỗi xảy ra")
          }
        })
      } else {
        resetAuth()
        resetMe()
        toast.error("Thông tin tài khoản hoặc mật khẩu không chính xác")
      }
    },
    onError: async () => {
      resetAuth()
      resetMe()
      toast.error("Thông tin tài khoản hoặc mật khẩu không chính xác")
    }
  });

  const onSubmit = (data: LoginFormData) => {
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
        <Input {...register("password")} id="password" type="password" autoComplete="off" className={`min-w-96 ${errors?.password?.message ? "border-red-500" : ""}`} placeholder="Mật khẩu"  />
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