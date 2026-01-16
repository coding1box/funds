"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { PaymentList } from "@/components/payment-list"
import { PaymentForm } from "@/components/payment-form"
import { loadPayments, savePayments, loadInvoices } from "@/lib/mock-data"
import type { Payment } from "@/lib/types"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PaymentsPage() {
  const { user, isLoading } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setPayments(loadPayments())
  }, [])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const handleCreatePayment = (data: Partial<Payment>) => {
    const invoices = loadInvoices()
    const invoice = invoices.find((inv) => inv.id === data.invoiceId)

    const newPayment: Payment = {
      id: `pay${Date.now()}`,
      invoiceId: data.invoiceId!,
      invoiceNumber: invoice?.invoiceNumber,
      amount: data.amount!,
      paymentDate: data.paymentDate!,
      status: "pending",
      bankReference: data.bankReference,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    }

    const updated = [...payments, newPayment]
    setPayments(updated)
    savePayments(updated)
    setShowForm(false)

    toast({
      title: "回款记录已添加",
      description: "回款信息已登记，等待确认",
    })
  }

  const handleConfirmPayment = (paymentId: string) => {
    const updated = payments.map((pay) =>
      pay.id === paymentId ? { ...pay, status: "confirmed" as const, confirmedBy: user.id } : pay,
    )
    setPayments(updated)
    savePayments(updated)

    toast({
      title: "回款已确认",
      description: "回款已确认到账",
    })
  }

  const handleReconcile = (paymentId: string) => {
    const updated = payments.map((pay) => (pay.id === paymentId ? { ...pay, status: "reconciled" as const } : pay))
    setPayments(updated)
    savePayments(updated)

    toast({
      title: "对账完成",
      description: "回款已完成对账",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">回款管理</h1>
            <p className="text-muted-foreground mt-2">跟踪和管理所有回款记录</p>
          </div>
          {(user.role === "customer_manager" || user.role === "business_support") && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              登记回款
            </Button>
          )}
        </div>

        {showForm && <PaymentForm onSubmit={handleCreatePayment} onCancel={() => setShowForm(false)} />}

        <PaymentList
          payments={payments}
          userRole={user.role}
          onConfirm={handleConfirmPayment}
          onReconcile={handleReconcile}
        />
      </div>
    </DashboardLayout>
  )
}
