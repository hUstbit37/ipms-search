"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  FileText,
  Package,
  Lightbulb,
  ArrowRightLeft,
  Settings,
  Workflow,
  Home,
  Building,
  TrendingUp,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Menu data for ipms-search
const data = {
  navMain: [
    {
      title: "Dashboard",
      items: [
        { title: "Tổng quan", url: "/dashboard", icon: Home },
        { title: "Thống kê theo đơn vị", url: "/dashboard/company-analysis", icon: Building },
        { title: "Phân tích tăng trưởng", url: "/dashboard/growth-analysis", icon: TrendingUp },
        { title: "Phân bổ quốc gia", url: "/dashboard/geo-distribution", icon: Globe },
        { title: "Cơ cấu ngành hàng", url: "/dashboard/sector-analysis", icon: Package },
      ],

    },
    {
      title: "Tra cứu",
      items: [
        { title: "Sáng chế", url: "/search/patents", icon: Lightbulb },
        { title: "Nhãn hiệu", url: "/search/trademarks", icon: FileText },
        { title: "Kiểu dáng công nghiệp", url: "/search/industrial-designs", icon: Package },
      ],
    },
    {
      title: "Quản lý IP",
      items: [
        { title: "Sáng chế", url: "/ip/patents", icon: Lightbulb },
        { title: "Nhãn hiệu", url: "/ip/trademarks", icon: FileText },
        { title: "Kiểu dáng công nghiệp", url: "/ip/industrial-designs", icon: Package },
      ],
    },
    {
      title: "Li-xăng/Chuyển nhượng",
      items: [
      { title: "Li-xăng", url: "/contracts/licenses", icon: FileText },
      { title: "Chuyển nhượng", url: "/contracts/transfers", icon: ArrowRightLeft },
      ],
    },

    {
      title: "Quản lý tài liệu",
      items: [
      { title: "Tài liệu nội bộ", url: "/document", icon: FileText },
      ],
    },
    {
      title: "Workflow",
      items: [
      { title: "Cấu hình", url: "/workflows/configs", icon: Settings },
      { title: "Các quy trình", url: "/workflows/processes", icon: Workflow },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <h2 className="text-center mx-auto font-bold text-2xl">IPMS</h2>
        {/* <p className="text-center text-xs text-muted-foreground mt-1">Tra cứu SHTT</p> */}
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url;
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "hover:bg-blue-100 hover:text-blue-700",
                          isActive && "bg-blue-100 text-blue-700 font-semibold"
                        )}
                      >
                        <Link
                          href={item.url}
                          className="w-full flex items-center gap-2 px-2 py-4 rounded"
                        >
                          {Icon && <Icon className="h-4 w-4 shrink-0" />}
                          <span className="whitespace-normal break-words">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
