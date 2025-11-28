"use client";

import { Header } from "@/components/layout/header";
import { Navbar } from "@/components/layout/navbar";

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950">
      <Header />
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
