"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { LayoutDashboard, FileText, DollarSign, Menu, X, CheckSquare } from "lucide-react"
import { useState } from "react"
import { RoleSwitcher } from "@/components/role-switcher"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: "仪表板", href: "/dashboard", icon: LayoutDashboard },
    { name: "我的申请", href: "/applications", icon: CheckSquare },
    { name: "我的待办", href: "/todos", icon: CheckSquare },
    { name: "发票管理", href: "/invoices", icon: FileText },
    { name: "回款管理", href: "/payments", icon: DollarSign },
  ]

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* 顶部导航栏 - 蓝色背景 */}
      <header className="bg-[#1890ff] text-white h-14 flex items-center justify-between px-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold">政企资金管理</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">欢迎您，{user?.name}</span>
          <RoleSwitcher />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧菜单 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-4 top-20 z-50 rounded-md bg-white p-2 shadow-sm border lg:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <aside
          className={cn(
            "fixed inset-y-0 left-0 top-14 z-40 w-52 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:top-0",
            "bg-white border-r border-gray-200",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-12 items-center px-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-medium text-gray-700">采购管理</h2>
            </div>

            <nav className="flex-1 py-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                      "hover:bg-blue-50",
                      isActive
                        ? "bg-blue-50 text-[#1890ff] border-r-2 border-[#1890ff] font-medium"
                        : "text-gray-700",
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="text-xs text-gray-500">
                <p className="mb-1">当前角色</p>
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === "customer_manager" && "客户经理"}
                  {user?.role === "finance" && "财务部"}
                  {user?.role === "business_support" && "商务支持中心"}
                  {user?.role === "admin" && "管理员"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto bg-[#f0f5ff]">
          {children}
        </main>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </div>
  )
}
