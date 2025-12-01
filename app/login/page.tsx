"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OverlayLoading } from "@/components/loading/OverlayLoading";
import { useGlobalLoading } from "@/providers/loading/LoadingProvider";

export default function LoginPage() {

  const {
    isGlobalLoading
  } = useGlobalLoading()

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <h1 className="text-3xl font-bold">IPMS</h1>
              <p className="text-xs text-muted-foreground mt-1">Tra cứu Sở hữu Trí tuệ</p>
            </div>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>Nhập thông tin tài khoản của bạn để tiếp tục</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
      <OverlayLoading show={isGlobalLoading} />
    </div>
  );
}
