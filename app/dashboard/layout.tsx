"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/redux/hook"
import { getMyProfile } from "@/redux/actions/userActions"
import { getAllVehicles } from "@/redux/actions/vehicleActions"
import { getAllDrivers } from "@/redux/actions/driverActions"
import { getAllCompanies } from "@/redux/actions/companyActions"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(getMyProfile())
    dispatch(getAllVehicles())
    dispatch(getAllDrivers())
    dispatch(getAllCompanies())
  }, [dispatch])

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