"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TodoList } from "@/components/todo-list"
import { loadInvoices, loadPayments, saveInvoices, savePayments, loadApprovals, saveApprovals } from "@/lib/mock-data"
import type { TodoItem, Invoice, Payment, InvoiceApproval, InvoiceStatus } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function TodosPage() {
  const { user, isLoading } = useAuth()
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadTodos()
  }, [user])

  const loadTodos = () => {
    if (!user) return

    const allInvoices = loadInvoices()
    const allPayments = loadPayments()
    setInvoices(allInvoices)
    setPayments(allPayments)

    const todoItems: TodoItem[] = []

    // 部门领导角色：待审批的发票 + 集团开票审核
    if (user.role === "department_leader") {
      const pendingInvoices = allInvoices.filter((inv) => inv.status === "pending_dept_leader_approval")
      pendingInvoices.forEach((invoice) => {
        todoItems.push({
          id: `invoice-${invoice.id}`,
          type: "invoice_approval",
          title: `${invoice.invoiceNumber || invoice.id}`,
          description: `项目：${invoice.projectName}，客户：${invoice.customerName}，金额：¥${invoice.amount.toLocaleString()}`,
          relatedId: invoice.id,
          relatedData: invoice,
          priority: invoice.amount > 500000 ? "high" : "medium",
          status: "pending",
          processName: "发票审批流程-部门领导审批",
          initiator: invoice.submittedBy,
          initiatorName: invoice.submittedByName,
          assignee: user.id,
          assigneeName: user.name,
          createdAt: invoice.createdAt,
        })
      })

      // 集团开票审核
      const groupPendingInvoices = allInvoices.filter((inv) => inv.status === "group_billing_pending")
      groupPendingInvoices.forEach((invoice) => {
        todoItems.push({
          id: `group-billing-${invoice.id}`,
          type: "invoice_approval",
          title: `集团开票审核 - ${invoice.invoiceNumber || invoice.id}`,
          description: `项目：${invoice.projectName}，客户：${invoice.customerName}，金额：¥${invoice.amount.toLocaleString()}`,
          relatedId: invoice.id,
          relatedData: invoice,
          priority: "high",
          status: "pending",
          processName: "集团开票审批流程",
          initiator: invoice.submittedBy,
          initiatorName: invoice.submittedByName,
          assignee: user.id,
          assigneeName: user.name,
          createdAt: invoice.createdAt,
        })
      })
    }


    // 财务角色：待审批和待上传的发票
    if (user.role === "finance") {
      // 待财务审批的发票
      const pendingFinanceInvoices = allInvoices.filter((inv) => inv.status === "pending_finance_approval")
      pendingFinanceInvoices.forEach((invoice) => {
        todoItems.push({
          id: `invoice-finance-approval-${invoice.id}`,
          type: "invoice_approval",
          title: `${invoice.invoiceNumber || invoice.id}`,
          description: `项目：${invoice.projectName}，客户：${invoice.customerName}，金额：¥${invoice.amount.toLocaleString()}`,
          relatedId: invoice.id,
          relatedData: invoice,
          priority: invoice.amount > 500000 ? "high" : "medium",
          status: "pending",
          processName: "发票审批流程-财务审批",
          initiator: invoice.submittedBy,
          initiatorName: invoice.submittedByName,
          assignee: user.id,
          assigneeName: user.name,
          createdAt: invoice.updatedAt,
        })
      })

      // 待上传的发票
      const uploadInvoices = allInvoices.filter((inv) => inv.status === "approved")
      uploadInvoices.forEach((invoice) => {
        todoItems.push({
          id: `invoice-upload-${invoice.id}`,
          type: "invoice_upload",
          title: `${invoice.invoiceNumber || invoice.id}`,
          description: `项目：${invoice.projectName}，客户：${invoice.customerName}，金额：¥${invoice.amount.toLocaleString()}`,
          relatedId: invoice.id,
          relatedData: invoice,
          priority: invoice.amount > 500000 ? "high" : "medium",
          status: "pending",
          processName: "发票上传流程",
          initiator: invoice.submittedBy,
          initiatorName: invoice.submittedByName,
          assignee: user.id,
          assigneeName: user.name,
          createdAt: invoice.updatedAt,
        })
      })

      // 待确认的回款
      const pendingPayments = allPayments.filter((pay) => pay.status === "pending")
      pendingPayments.forEach((payment) => {
        const relatedInvoice = allInvoices.find((inv) => inv.id === payment.invoiceId)
        todoItems.push({
          id: `payment-${payment.id}`,
          type: "payment_confirmation",
          title: `${payment.invoiceNumber || payment.id}`,
          description: `金额：¥${payment.amount.toLocaleString()}，银行流水：${payment.bankReference || "无"}`,
          relatedId: payment.id,
          relatedData: payment,
          priority: "medium",
          status: "pending",
          processName: "回款确认流程",
          initiator: relatedInvoice?.submittedBy || "unknown",
          initiatorName: relatedInvoice?.submittedByName || "未知",
          assignee: user.id,
          assigneeName: user.name,
          createdAt: payment.createdAt,
        })
      })
    }

    // 客户经理：被拒绝的发票需要重新处理 + 待确认的发票
    if (user.role === "customer_manager") {
      const rejectedInvoices = allInvoices.filter(
        (inv) => inv.status === "rejected" && inv.submittedBy === user.id
      )
      rejectedInvoices.forEach((invoice) => {
        todoItems.push({
          id: `invoice-${invoice.id}`,
          type: "invoice_approval",
          title: `${invoice.invoiceNumber || invoice.id}`,
          description: `项目：${invoice.projectName}，需要修改后重新提交`,
          relatedId: invoice.id,
          relatedData: invoice,
          priority: "high",
          status: "rejected",
          processName: "发票审批流程",
          initiator: invoice.submittedBy,
          initiatorName: invoice.submittedByName,
          assignee: user.id,
          assigneeName: user.name,
          createdAt: invoice.updatedAt,
        })
      })

      // 待确认的发票（财务或商务支撑上传后）
      const confirmInvoices = allInvoices.filter(
        (inv) => inv.status === "pending_customer_confirmation" && inv.submittedBy === user.id
      )
      confirmInvoices.forEach((invoice) => {
        todoItems.push({
          id: `invoice-confirm-${invoice.id}`,
          type: "invoice_approval",
          title: `发票确认 - ${invoice.invoiceNumber || invoice.id}`,
          description: `项目：${invoice.projectName}，发票号：${invoice.uploadedInvoiceNumber}，请确认发票信息`,
          relatedId: invoice.id,
          relatedData: invoice,
          priority: "high",
          status: "pending",
          processName: "发票确认流程",
          initiator: invoice.uploadedBy || invoice.submittedBy,
          initiatorName: invoice.uploadedByName || invoice.submittedByName,
          assignee: user.id,
          assigneeName: user.name,
          createdAt: invoice.uploadedAt || invoice.updatedAt,
        })
      })
    }

    // 商务支撑中心：集团开票已审核，需要上传集团发票
    if (user.role === "business_support") {
      const groupBillingInvoices = allInvoices.filter(
        (inv) => inv.status === "group_billing_reviewed"
      )
      groupBillingInvoices.forEach((invoice) => {
        todoItems.push({
          id: `group-billing-upload-${invoice.id}`,
          type: "invoice_upload",
          title: `集团发票上传 - ${invoice.invoiceNumber || invoice.id}`,
          description: `项目：${invoice.projectName}，客户：${invoice.customerName}，开票金额：¥${invoice.groupBillingData?.billingAmount?.toLocaleString() || invoice.amount.toLocaleString()}`,
          relatedId: invoice.id,
          relatedData: invoice,
          priority: "high",
          status: "pending",
          processName: "集团开票流程",
          initiator: invoice.submittedBy,
          initiatorName: invoice.submittedByName,
          assignee: user.id,
          assigneeName: user.name,
          createdAt: invoice.updatedAt,
        })
      })
    }

    // 按优先级和时间排序
    todoItems.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setTodos(todoItems)
  }

    const handleApproveInvoice = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId)
    if (!invoice || !user) return

    let newStatus: InvoiceStatus
    let description: string

    // 部门领导审批通过 -> 流转到财务
    if (user.role === "department_leader" && invoice.status === "pending_dept_leader_approval") {
      newStatus = "pending_finance_approval"
      description = `发票 ${invoice.invoiceNumber || invoice.id} 已通过部门领导审批，转财务部审核`
    }
    // 财务审批通过 -> 待上传
    else if (user.role === "finance" && invoice.status === "pending_finance_approval") {
      newStatus = "approved"
      description = `发票 ${invoice.invoiceNumber || invoice.id} 已通过财务审批，请上传已开发票信息`
    }
    else {
      return
    }

    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: newStatus, updatedAt: new Date().toISOString() } : inv
    )
    saveInvoices(updatedInvoices)

    const approvals = loadApprovals()
    const newApproval: InvoiceApproval = {
      id: `approval-${Date.now()}`,
      invoiceId,
      approverId: user.id,
      approverName: user.name,
      action: "approved",
      createdAt: new Date().toISOString(),
    }
    saveApprovals([...approvals, newApproval])

    toast({
      title: "审批成功",
      description,
    })

    loadTodos()
  }

  const handleRejectInvoice = (invoiceId: string, notes: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId)
    if (!invoice || !user) return

    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoiceId
        ? { ...inv, status: "rejected" as const, notes, updatedAt: new Date().toISOString() }
        : inv
    )
    saveInvoices(updatedInvoices)

    const approvals = loadApprovals()
    const newApproval: InvoiceApproval = {
      id: `approval-${Date.now()}`,
      invoiceId,
      approverId: user.id,
      approverName: user.name,
      action: "rejected",
      notes,
      createdAt: new Date().toISOString(),
    }
    saveApprovals([...approvals, newApproval])

    toast({
      title: "已拒绝",
      description: `发票 ${invoice.invoiceNumber} 已被拒绝`,
      variant: "destructive",
    })

    loadTodos()
  }

  const handleConfirmPayment = (paymentId: string) => {
    const payment = payments.find((pay) => pay.id === paymentId)
    if (!payment || !user) return

    const updatedPayments = payments.map((pay) =>
      pay.id === paymentId
        ? { ...pay, status: "confirmed" as const, confirmedBy: user.id }
        : pay
    )
    savePayments(updatedPayments)

    toast({
      title: "确认成功",
      description: `回款 ¥${payment.amount.toLocaleString()} 已确认`,
    })

    loadTodos()
  }

  const handleConfirmInvoice = (invoiceId: string, applyGroupBilling: boolean) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId)
    if (!invoice || !user) return

    let newStatus: InvoiceStatus
    let description: string

    if (applyGroupBilling) {
      // 继续申请集团开票
      newStatus = "group_billing_pending"
      description = `发票 ${invoice.invoiceNumber} 已确认，将启动集团开票流程`
    } else {
      // 办结
      newStatus = "settled"
      description = `发票 ${invoice.invoiceNumber} 已确认，流程办结`
    }

    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: newStatus, updatedAt: new Date().toISOString() } : inv
    )
    saveInvoices(updatedInvoices)

    toast({
      title: "发票确认成功",
      description,
    })

    loadTodos()
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const invoiceApprovals = todos.filter((t) => t.type === "invoice_approval")
  const paymentConfirmations = todos.filter((t) => t.type === "payment_confirmation")

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* 主内容区 */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">我的待办</h2>
            <p className="text-sm text-gray-600 mt-1">
              共 {todos.length} 项待办事项
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-white border border-gray-200 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#1890ff] data-[state=active]:text-white">
                全部
                {todos.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                    {todos.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="invoice" className="data-[state=active]:bg-[#1890ff] data-[state=active]:text-white">
                发票审批
                {invoiceApprovals.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                    {invoiceApprovals.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="payment" className="data-[state=active]:bg-[#1890ff] data-[state=active]:text-white">
                回款确认
                {paymentConfirmations.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                    {paymentConfirmations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <TodoList
                todos={todos}
                onApproveInvoice={handleApproveInvoice}
                onRejectInvoice={handleRejectInvoice}
                onConfirmPayment={handleConfirmPayment}
                onConfirmInvoice={handleConfirmInvoice}
                userRole={user.role}
              />
            </TabsContent>

            <TabsContent value="invoice" className="mt-6">
              <TodoList
                todos={invoiceApprovals}
                onApproveInvoice={handleApproveInvoice}
                onRejectInvoice={handleRejectInvoice}
                onConfirmPayment={handleConfirmPayment}
                onConfirmInvoice={handleConfirmInvoice}
                userRole={user.role}
              />
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <TodoList
                todos={paymentConfirmations}
                onApproveInvoice={handleApproveInvoice}
                onRejectInvoice={handleRejectInvoice}
                onConfirmPayment={handleConfirmPayment}
                onConfirmInvoice={handleConfirmInvoice}
                userRole={user.role}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
}
