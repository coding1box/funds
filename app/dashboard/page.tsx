"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { RecentInvoices } from "@/components/recent-invoices"
import { RecentPayments } from "@/components/recent-payments"
import { loadInvoices, loadPayments } from "@/lib/mock-data"
import { FileText, Clock, CheckCircle, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  useEffect(() => {
    setInvoices(loadInvoices())
    setPayments(loadPayments())
  }, [])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // 根据角色计算统计数据
  const stats = {
    totalInvoices: invoices.length,
    pendingApproval: invoices.filter((i) => i.status === "pending_approval").length,
    approved: invoices.filter((i) => i.status === "approved" || i.status === "submitted_to_customer").length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paidAmount: payments
      .filter((p) => p.status === "confirmed" || p.status === "reconciled")
      .reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments.filter((p) => p.status === "pending").length,
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* 标签页导航 */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center gap-6 px-6 h-12">
            <button className="text-sm text-[#1890ff] pb-3 border-b-2 border-[#1890ff] font-medium">
              首页
            </button>
            <button className="text-sm text-gray-600 hover:text-[#1890ff] pb-3 border-b-2 border-transparent hover:border-[#1890ff]">
              发票管理
            </button>
            <button className="text-sm text-gray-600 hover:text-[#1890ff] pb-3 border-b-2 border-transparent hover:border-[#1890ff]">
              我的待办
            </button>
            <button className="text-sm text-gray-600 hover:text-[#1890ff] pb-3 border-b-2 border-transparent hover:border-[#1890ff]">
              制约情况
            </button>
            <button className="text-sm text-gray-600 hover:text-[#1890ff] pb-3 border-b-2 border-transparent hover:border-[#1890ff]">
              用户管理
            </button>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">数据概览</h2>
            <p className="text-sm text-gray-600 mt-1">欢迎回来，{user.name}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard title="总发票数" value={stats.totalInvoices.toString()} icon={FileText} trend="+2 本月" />
            <StatsCard
              title="待审批"
              value={stats.pendingApproval.toString()}
              icon={Clock}
              trend="需要处理"
              variant="warning"
            />
            <StatsCard title="已批准" value={stats.approved.toString()} icon={CheckCircle} variant="success" />
            <StatsCard
              title="回款金额"
              value={`¥${(stats.paidAmount / 10000).toFixed(1)}万`}
              icon={DollarSign}
              trend={`待确认: ${stats.pendingPayments}`}
              variant="default"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentInvoices invoices={invoices.slice(0, 5)} />
            <RecentPayments payments={payments.slice(0, 5)} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
