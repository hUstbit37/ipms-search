import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
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
    </div>
  );
}
