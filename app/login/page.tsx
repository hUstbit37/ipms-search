import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <main className="container mx-auto px-4 py-16 min-w-screen min-h-screen flex flex-col gap-8 justify-center items-center">
        <div className="text-2xl font-semibold">Mời bạn điền tên đăng nhập và  mật khẩu để đăng nhập</div>
        <LoginForm />
      </main>
    </div>
  );
}
