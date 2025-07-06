"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ReduxProvider from "@/components/redux-provider";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DataProvider } from "@/components/data-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Separate client component that uses Redux hooks
function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <>
      {isLoginPage ? (
        children
      ) : (
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
              <div className="@container/main flex flex-1 flex-col gap-2 px-4">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {children}
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      )}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <DataProvider>
              <LayoutContent>{children}</LayoutContent>
            </DataProvider>
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
