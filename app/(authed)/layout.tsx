"use client";

import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell, User, Key, LogOut } from "lucide-react";
import { useMe } from "@/providers/auth/MeProvider";
import { useAuth } from "@/providers/auth/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@/lib/react-query";
import { authService } from "@/services/auth.service";
import { toast } from "react-toastify";
import { getInitialsName } from "@/utils/common-utils";
import { OverlayLoading } from "@/components/loading/OverlayLoading";

const breadcrumbMap: Record<string, string> = {
  search: "Tra cứu",
  patents: "Sáng chế",
  trademarks: "Nhãn hiệu",
  "industrial-designs": "Kiểu dáng công nghiệp",
};

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { me, resetMe } = useMe();
  const { authContext, resetAuth } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Wait for client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Client-side authentication check
  useEffect(() => {
    if (!isMounted) return;

    if (!authContext?.isAuthenticated || !authContext?.token) {
      router.push("/login");
    } else {
      setIsCheckingAuth(false);
    }
  }, [authContext, router, isMounted]);

  const segments = pathname.split("/").filter((seg) => seg && seg.length > 0);

  const format = (str: string) =>
    breadcrumbMap[str] ||
    str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const generateHref = (index: number) =>
    "/" + segments.slice(0, index + 1).join("/");

  const [notifications] = useState([
    { id: 1, title: "Hệ thống đã cập nhật dữ liệu mới" },
  ]);

  const logoutMutation = useMutation({
    mutationFn: async () => await authService.logout(),
    onSuccess: () => {
      router.push("/login");
      resetMe();
      resetAuth();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return <OverlayLoading show={true} />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-white dark:bg-zinc-900">
          {/* LEFT SIDE: SidebarTrigger + Breadcrumb */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />

            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/search/trademarks">Trang chủ</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {segments.map((segment, index) => {
                  const isLast = index === segments.length - 1;

                  if (!segment || segment === "search") return null;

                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbSeparator />

                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{format(segment)}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={generateHref(index)}>
                            {format(segment)}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative cursor-pointer">
              <Bell className="h-6 w-6 text-gray-600" />

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                  {notifications.length}
                </span>
              )}
            </div>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button suppressHydrationWarning className="cursor-pointer flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitialsName(me?.fullname)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{me?.fullname}</span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{me?.fullname}</p>
                  <p className="text-xs text-muted-foreground">{me?.email}</p>
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" /> Thông tin tài khoản
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Key className="h-4 w-4 mr-2" /> Đổi mật khẩu
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="p-4 bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
