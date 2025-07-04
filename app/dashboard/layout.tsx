"use client"

import { useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getMyProfile } from "@/redux/actions/userActions"
import { useRouter } from "next/navigation"
import { safeLocalStorage } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.user)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      await dispatch(getMyProfile())
    }
    
    loadUser()
  }, [dispatch])

  useEffect(() => {
    if (!safeLocalStorage.getItem("accessToken")) {
      router.push("/login")
    }
  }, [router])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 