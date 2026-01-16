"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { InvoiceList } from "@/components/invoice-list"
import { InvoiceFormDialog } from "@/components/invoice-form-dialog"
import { InvoiceUploadDialog } from "@/components/invoice-upload-dialog"
import { loadInvoices, saveInvoices, loadApprovals, saveApprovals, mockProjects } from "@/lib/mock-data"
import type { Invoice, InvoiceApproval } from "@/lib/types"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GroupBillingFormDialog } from "@/components/group-billing-form-dialog"

export default function InvoicesPage() {
  const { user, isLoading } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [groupBillingDialogOpen, setGroupBillingDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [uploadingInvoice, setUploadingInvoice] = useState<Invoice | null>(null)
  const [groupBillingInvoice, setGroupBillingInvoice] = useState<Invoice | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setInvoices(loadInvoices())
  }, [])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const handleDialogOpenChange = (open: boolean) => {
    console.log('Dialog open changed to:', open, 'Current dialogOpen state:', dialogOpen)
    setDialogOpen(open)
  }

  const handleCreateInvoice = (data: Partial<Invoice>) => {
    console.log('Creating invoice:', data)
    const newInvoice: Invoice = {
      id: `inv${Date.now()}`,
      projectId: data.projectId!,
      projectName: mockProjects.find((p) => p.id === data.projectId)?.name,
      customerName: data.customerName,
      amount: data.amount!,
      status: "pending_dept_leader_approval",
      submittedBy: user.id,
      submittedByName: user.name,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      applicant: data.applicant,
      applicationType: data.applicationType,
      contractCode: data.contractCode,
      contractName: data.contractName,
      projectCode: data.projectCode,
      contractRevenue: data.contractRevenue,
      appliedInvoiceAmount: data.appliedInvoiceAmount,
      mainRevenue: data.mainRevenue,
      industryType: data.industryType,
      taxpayerIdNumber: data.taxpayerIdNumber,
      isRevenueListed: data.isRevenueListed,
      invoiceNotes: data.invoiceNotes,
      attachments: data.attachments,
      invoiceItems: data.invoiceItems,
    }

    const updated = [...invoices, newInvoice]
    setInvoices(updated)
    saveInvoices(updated)

    toast({
      title: "发票已提交",
      description: "发票已提交审批，等待财务部审核",
    })
  }

  const handleUpdateInvoice = (invoiceId: string, updates: Partial<Invoice>) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv,
    )
    setInvoices(updated)
    saveInvoices(updated)
    setEditingInvoice(null)
  }

  const handleApprove = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId)
    if (!invoice) return

    const approval: InvoiceApproval = {
      id: `app${Date.now()}`,
      invoiceId,
      approverId: user.id,
      approverName: user.name,
      action: "approved",
      createdAt: new Date().toISOString(),
    }

    const approvals = loadApprovals()
    saveApprovals([...approvals, approval])

    // 如果是部门领导审批通过，则进入待上传状态
    if (user.role === "department_leader" && invoice.status === "pending_dept_leader_approval") {
      handleUpdateInvoice(invoiceId, { status: "approved" })
      toast({
        title: "发票已批准",
        description: "请上传已开发票信息",
      })
    }
  }

  const handleReject = (invoiceId: string, notes: string) => {
    const approval: InvoiceApproval = {
      id: `app${Date.now()}`,
      invoiceId,
      approverId: user.id,
      approverName: user.name,
      action: "rejected",
      notes,
      createdAt: new Date().toISOString(),
    }

    const approvals = loadApprovals()
    saveApprovals([...approvals, approval])

    handleUpdateInvoice(invoiceId, { status: "rejected" })

    toast({
      title: "发票已拒绝",
      description: notes || "发票审批被拒绝",
      variant: "destructive",
    })
  }

  const handleUploadInvoice = (
    invoiceId: string,
    data: {
      uploadedInvoiceNumber: string
      uploadedInvoiceDate: string
      uploadedInvoiceFileUrl?: string
      uploadNotes?: string
    }
  ) => {
    handleUpdateInvoice(invoiceId, {
      ...data,
      status: "pending_customer_confirmation",
      uploadedBy: user.id,
      uploadedByName: user.name,
      uploadedAt: new Date().toISOString(),
    })

    toast({
      title: "发票上传成功",
      description: `发票号：${data.uploadedInvoiceNumber}，已自动生成待办给客户经理`,
    })

    setUploadingInvoice(null)
  }

  const handleSubmitToCustomer = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId)
    if (invoice) {
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`
      handleUpdateInvoice(invoiceId, {
        status: "submitted_to_customer",
        invoiceNumber,
      })

      toast({
        title: "发票已提交客户",
        description: `发票号：${invoiceNumber}`,
      })
    }
  }

  const handleApplyGroupBilling = (invoice: Invoice) => {
    setGroupBillingInvoice(invoice)
    setGroupBillingDialogOpen(true)
  }

  const handleGroupBillingSubmit = (data: {
    projectName: string
    billingAmount: number
    customerName: string
    address: string
    taxpayerIdNumber: string
    phone: string
    bankName: string
    accountNumber: string
    invoiceType: "vat_special" | "vat_normal"
    notes?: string
    invoiceItems: any[]
  }) => {
    if (!groupBillingInvoice || !user) return

    handleUpdateInvoice(groupBillingInvoice.id, {
      groupBillingData: data,
      status: "group_billing_reviewed",
      updatedAt: new Date().toISOString(),
    })

    toast({
      title: "集团开票申请已提交",
      description: `已提交给商务支撑中心审核，金额：¥${data.billingAmount.toLocaleString()}`,
    })

    setGroupBillingDialogOpen(false)
    setGroupBillingInvoice(null)
  }

  const filteredInvoices =
    user.role === "customer_manager" ? invoices.filter((inv) => inv.submittedBy === user.id) : invoices

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* 主内容区 */}
        <div className="flex-1 p-6 overflow-auto">

          <InvoiceFormDialog open={dialogOpen} onOpenChange={handleDialogOpenChange} onSubmit={handleCreateInvoice} />

          {editingInvoice && (
            <InvoiceFormDialog
              open={!!editingInvoice}
              onOpenChange={(open) => !open && setEditingInvoice(null)}
              invoice={editingInvoice}
              onSubmit={(data) => handleUpdateInvoice(editingInvoice.id, data)}
            />
          )}

          <InvoiceUploadDialog
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            onSubmit={(data) => {
              if (uploadingInvoice) {
                handleUploadInvoice(uploadingInvoice.id, data)
              }
            }}
          />

          <GroupBillingFormDialog
            open={groupBillingDialogOpen}
            onOpenChange={setGroupBillingDialogOpen}
            onSubmit={handleGroupBillingSubmit}
            defaultValues={groupBillingInvoice ? {
              projectName: groupBillingInvoice.projectName,
              customerName: groupBillingInvoice.customerName,
              taxpayerIdNumber: groupBillingInvoice.taxpayerIdNumber,
              billingAmount: groupBillingInvoice.amount,
            } : undefined}
          />

          <InvoiceList
            invoices={filteredInvoices}
            userRole={user.role}
            onApprove={handleApprove}
            onReject={handleReject}
            onSubmitToCustomer={handleSubmitToCustomer}
            onEdit={setEditingInvoice}
            onUpload={(invoice) => {
              setUploadingInvoice(invoice)
              setUploadDialogOpen(true)
            }}
            onApplyGroupBilling={handleApplyGroupBilling}
            onCreate={() => {
              console.log('新增申请按钮被点击')
              setDialogOpen(true)
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
