"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "SÁNG CHẾ", href: "/search/inventions" },
    { label: "KIỂU DÁNG", href: "/search/designs" },
    { label: "NHÃN HIỆU", href: "/search/trademarks" },
    { label: "GEOGRAPHICAL INDICATIONS", href: "/search/indications" },
  ];

  return (
    <nav className="border-b bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "py-4 text-sm font-medium transition-colors border-b-2",
                pathname === item.href
                  ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
