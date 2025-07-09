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
  
  const allNavItems = [
    {
      title: "Raporlar",
      url: "/raporlar",
      icon: IconReport,
      roles: ["admin", "superadmin"], // Only admin and superadmin can see reports
    },
    {
      title: "Çekici Yönetimi",
      url: "/",
      icon: IconTruckDelivery,
      roles: ["user", "admin", "superadmin"], // All roles can access
    },
    {
      title: "Masraf Yönetimi",
      url: "/masraflar",
      icon: IconReceipt,
      roles: ["admin", "superadmin"], // Only admin and superadmin can manage expenses
    },
    {
      title: "Araç Yönetimi",
      url: "/vehicles",
      icon: IconTruck,
      roles: ["user", "admin", "superadmin"], // All roles can access
    },
    {
      title: "Şoför Yönetimi",
      url: "/drivers",
      icon: IconUsers,
      roles: ["user", "admin", "superadmin"], // All roles can access
    },
    {
      title: "Firma Yönetimi",
      url: "/companies",
      icon: IconBuilding,
      roles: ["user", "admin", "superadmin"], // All roles can access
    },
    {
      title: "Kullanıcılar",
      url: "/users",
      icon: IconUserPlus,
      roles: ["admin", "superadmin"], // Only admin and superadmin can manage users
    },
  ];

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => 
    item.roles.includes(user?.role || "user")
  );

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
