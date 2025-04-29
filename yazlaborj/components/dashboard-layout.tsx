"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-hooks"
import { LayoutDashboard, FileText, Users, Settings, LogOut, Menu, X, Bell, User } from "lucide-react"

type DashboardLayoutProps = {
  children: React.ReactNode
}

// getNavItems fonksiyonunu bileşenin dışına taşıyın
function getNavItems(user: any) {
  if (!user) return []

  const baseItems = [
    {
      name: "Dashboard",
      href: `/dashboard/${user.role}`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
  ]

  switch (user?.role) {
    case "candidate":
      return [
        ...baseItems,
        {
          name: "İlanlar",
          href: "/dashboard/candidate/listings",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          name: "Başvurularım",
          href: "/dashboard/candidate/applications",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          name: "Profil",
          href: "/dashboard/candidate/profile",
          icon: <User className="h-5 w-5" />,
        },
      ]
    case "admin":
      return [
        ...baseItems,
        {
          name: "İlan Yönetimi",
          href: "/dashboard/admin/listings",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          name: "Ayarlar",
          href: "/dashboard/admin/settings",
          icon: <Settings className="h-5 w-5" />,
        },
      ]
    case "manager":
      return [
        ...baseItems,
        {
          name: "İlan Kriterleri",
          href: "/dashboard/manager/criteria",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          name: "Jüri Yönetimi",
          href: "/dashboard/manager/jury",
          icon: <Users className="h-5 w-5" />,
        },
        {
          name: "Başvuru Değerlendirme",
          href: "/dashboard/manager/evaluations",
          icon: <FileText className="h-5 w-5" />,
        },
      ]
    case "jury":
      return [
        ...baseItems,
        {
          name: "Değerlendirmelerim",
          href: "/dashboard/jury/evaluations",
          icon: <FileText className="h-5 w-5" />,
        },
      ]
    default:
      return baseItems
  }
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [currentPath, setCurrentPath] = useState("")

  // Client-side rendering kontrolü
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname)
    }
  }, [])

  useEffect(() => {
    // Only redirect if component is mounted and not loading
    if (isClient && !isLoading && !user) {
      router.push("/login")
    }
  }, [user, router, isLoading, isClient])

  // Yükleme durumu için placeholder
  if (!isClient || (!user && !isLoading)) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-32 h-32 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    )
  }

  const navItems = getNavItems(user)

  function handleLogout() {
    logout()
    router.push("/")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="fixed left-4 top-4 z-50 block md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-full bg-white"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b px-4">
            <h1 className="text-xl font-bold text-blue-900">Akademik Sistem</h1>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    currentPath === item.href ? "bg-blue-100 text-blue-900" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t p-4">
            <Button variant="outline" className="flex w-full items-center justify-center" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">
              {user?.role === "candidate" && "Aday Paneli"}
              {user?.role === "admin" && "Admin Paneli"}
              {user?.role === "manager" && "Yönetici Paneli"}
              {user?.role === "jury" && "Jüri Paneli"}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
