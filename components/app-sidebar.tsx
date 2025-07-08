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
  IconReceipt,
  IconReport,
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
  useSidebar,
} from "@/components/ui/sidebar"
import { useAppSelector } from "@/redux/hook"
import { useIsMobile } from "@/hooks/use-mobile"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  
  const userData = {
    name: user?.name || "Kullanıcı",
    email: user?.email || "",
    avatar: user?.picture || "/avatars/admin.jpg",
  };
  
  const navItems = [
    {
      title: "Raporlar",
      url: "/raporlar",
      icon: IconReport,
    },
    {
      title: "Çekici Yönetimi",
      url: "/",
      icon: IconTruckDelivery,
    },
    {
      title: "Masraf Yönetimi",
      url: "/masraflar",
      icon: IconReceipt,
    },
    {
      title: "Araç Yönetimi",
      url: "/vehicles",
      icon: IconTruck,
    },
    {
      title: "Şoför Yönetimi",
      url: "/drivers",
      icon: IconUsers,
    },
    {
      title: "Firma Yönetimi",
      url: "/companies",
      icon: IconBuilding,
    },
    {
      title: "Kullanıcılar",
      url: "/users",
      icon: IconUserPlus,
    },
  ];

  const handleNavItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              onClick={handleNavItemClick}
            >
              <Link href="/">
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
                onClick={handleNavItemClick}
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
