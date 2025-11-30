"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useMe } from "@/providers/auth/MeProvider";
import { getInitialsName } from "@/utils/common-utils";
import { useMutation } from "@/lib/react-query";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/providers/auth/AuthProvider";

export function Header() {
  const router = useRouter();

  const {
    me,
    resetMe,
  } = useMe()

  const {
    resetAuth
  } = useAuth()

  const logoutMutation = useMutation({
    mutationFn: async () => await authService.logout(),
    onSuccess: () => {
      router.push("/login")
      resetMe()
      resetAuth()
    },
    onError: err => {
      toast.error(err.message)
    }
  })

  const logout = () => {
    logoutMutation.mutate()
  }

  return (
    <header className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className="container mx-auto px-2 py-1">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */ }
          <Link href="/search/trademarks" className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              I
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              IPMS Search
            </span>
          </Link>

          {/* User Avatar & Menu */ }
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                  { getInitialsName(me?.fullname) }
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{ me?.fullname }</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground">{ me?.fullname }</p>
                <p className="text-xs text-muted-foreground">{ me?.email }</p>
              </div>
              <DropdownMenuSeparator/>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4"/>
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4"/>
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator/>
              <DropdownMenuItem onClick={ logout }>
                <LogOut className="mr-2 h-4 w-4"/>
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
