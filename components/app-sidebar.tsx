"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconTruck,
  IconTruckDelivery,
  IconUsers,
  IconBuilding,
  IconUserPlus,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAppSelector } from "@/redux/hook"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  
  const userData = {
    name: user?.name || "Kullanıcı",
    email: user?.email || "",
    avatar: user?.picture || "/avatars/admin.jpg",
  };
  
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Çekici Yönetimi",
      url: "/dashboard/tow-trucks",
      icon: IconTruckDelivery,
    },
    {
      title: "Araç Yönetimi",
      url: "/dashboard/vehicles",
      icon: IconTruck,
    },
    {
      title: "Şoför Yönetimi",
      url: "/dashboard/drivers",
      icon: IconUsers,
    },
    {
      title: "Firma Yönetimi",
      url: "/dashboard/companies",
      icon: IconBuilding,
    },
    {
      title: "Kullanıcılar",
      url: "/dashboard/users",
      icon: IconUserPlus,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Çekici Yönetimi</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                active={pathname === item.url}
              >
                <Link href={item.url}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
