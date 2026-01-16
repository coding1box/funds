"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { loadInvoices, saveInvoices, loadApprovals, saveApprovals, mockProjects } from "@/lib/mock-data"
import type { Invoice, InvoiceApproval, InvoiceStatus } from "@/lib/types"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function ApplicationsPage() {
  const { user, isLoading } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [approvals, setApprovals] = useState<InvoiceApproval[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      const allInvoices = loadInvoices()
      const userInvoices = allInvoices.filter((inv) => inv.submittedBy === user.id)
      setInvoices(userInvoices)
      setApprovals(loadApprovals())
    }
  }, [user])

  const getStatusInfo = (invoice: Invoice) => {
    const latestApproval = approvals
      .filter((app) => app.invoiceId === invoice.id)
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime()
        const bTime = new Date(b.createdAt).getTime()
        return bTime - aTime
      })[0]

    const status: InvoiceStatus = invoice.status
    const currentStep: string = (() => {
      switch (status) {
        case "draft":
          return "未提交"
        case "pending_dept_leader_approval":
          return "待部门领导审批"
        case "pending_finance_approval":
          return "待财务审批"
        case "approved":
          return "待上传发票"
        case "submitted_to_customer":
          return "已提交客户"
        case "completed":
          return "已完成"
        case "rejected":
          return "已驳回"
        default:
          return "未知"
      }
    })()

    const result: "approved" | "rejected" | "pending" = (() => {
      switch (status) {
        case "draft":
          return "pending"
        case "pending_dept_leader_approval":
          return "pending"
        case "pending_finance_approval":
          return "pending"
        case "approved":
          return "approved"
        case "submitted_to_customer":
          return "approved"
        case "completed":
          return "approved"
        case "rejected":
          return "rejected"
        default:
          return "pending"
      }
    })()

    return {
      currentStep,
      status,
      result,
      resultTime: latestApproval?.createdAt,
    }
  }

  const getStatusBadge = (invoice: Invoice) => {
    const info = getStatusInfo(invoice)
    let color = "bg-gray-100 text-gray-700 border-gray-200"

    switch (info.currentStep) {
      case "待部门领导审批":
        color = "bg-orange-50 text-orange-700 border-orange-200"
        break
      case "待财务审批":
        color = "bg-blue-50 text-blue-700 border-blue-200"
        break
      case "待上传发票":
        color = "bg-yellow-50 text-yellow-700 border-yellow-200"
        break
      case "已提交客户":
        color = "bg-purple-50 text-purple-700 border-purple-200"
        break
      case "已完成":
        color = "bg-green-50 text-green-700 border-green-200"
        break
      case "已驳回":
        color = "bg-red-50 text-red-700 border-red-200"
        break
    }

    return (
      <Badge variant="outline" className={color}>
        {info.currentStep}
      </Badge>
    )
  }

  const getResultBadge = (invoice: Invoice) => {
    const info = getStatusInfo(invoice)
    if (!info.result || info.result === "pending") return null

    let color = "bg-gray-100 text-gray-700 border-gray-200"
    if (info.result === "rejected") {
      color = "bg-red-50 text-red-700 border-red-200"
    } else if (info.result === "approved") {
      color = "bg-green-50 text-green-700 border-green-200"
    } else {
      color = "bg-blue-50 text-blue-700 border-blue-200"
    }

    return (
      <Badge variant="outline" className={color}>
        {info.result === "approved" ? "通过" : "驳回"}
      </Badge>
    )
  }

  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [selectedInvoiceForWithdraw, setSelectedInvoiceForWithdraw] = useState<Invoice | null>(null)
  const [withdrawReason, setWithdrawReason] = useState("")

  const handleWithdraw = (invoiceId: string, reason: string) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: "rejected" as InvoiceStatus, updatedAt: new Date().toISOString() } : inv
    )
    setInvoices(updated)
    saveInvoices(updated)

    const rejection: InvoiceApproval = {
      id: `rejection-${Date.now()}`,
      invoiceId,
      approverId: user.id,
      approverName: user.name,
      action: "rejected",
      notes: reason || "申请人主动撤回",
      createdAt: new Date().toISOString(),
    }
    const allApprovals = loadApprovals()
    saveApprovals([...allApprovals, rejection])

    toast({
      title: "已撤回",
      description: "申请已撤回",
      variant: "default",
    })
    setWithdrawDialogOpen(false)
    setWithdrawReason("")
    setSelectedInvoiceForWithdraw(null)
  }

  const openWithdrawDialog = (invoice: Invoice) => {
    setSelectedInvoiceForWithdraw(invoice)
    setWithdrawDialogOpen(true)
  }

  const handleSubmitAgain = (invoiceId: string) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status: "pending_dept_leader_approval" as InvoiceStatus, updatedAt: new Date().toISOString() } : inv
    )
    setInvoices(updated)
    saveInvoices(updated)

    toast({
      title: "重新提交",
      description: "申请已重新提交",
    })
  }

  const handleOpenDetail = (invoice: Invoice) => {
    setSelectedInvoiceForDetail(invoice)
    setDetailDialogOpen(true)
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">我的申请</h1>
            <p className="text-sm text-gray-600">
              查看您提交的发票申请的审批进度和结果
            </p>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">发票号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">所属流程</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">当前审批环节</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">结果</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">创建时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">提交申请时间</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                    暂无申请记录
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const info = getStatusInfo(invoice)
                  return (
                    <tr key={invoice.id} className="hover:bg-blue-50/50 border-b border-gray-100">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {invoice.invoiceNumber || `INV-${invoice.id.substring(0, 8)}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        发票申请流程
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {info.currentStep}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(invoice)}
                      </td>
                      <td className="px-4 py-3">
                        {getResultBadge(invoice)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(invoice.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(info.resultTime || invoice.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {info.result === "pending" && info.currentStep !== "已驳回" && (
                            <button
                              type="button"
                              onClick={() => openWithdrawDialog(invoice)}
                              className="px-3 py-1.5 text-xs bg-red-50 text-red-700 hover:bg-red-600 rounded border border-red-600 transition-colors"
                            >
                              撤回
                            </button>
                          )}
                          {info.result === "approved" && info.currentStep === "待上传发票" && (
                            <a
                              href={`/invoices?upload=${invoice.id}`}
                              className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-600 rounded border border-blue-600 transition-colors"
                            >
                              上传发票
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>发票申请详情</DialogTitle>
            <DialogDescription>查看发票申请的详细信息</DialogDescription>
          </DialogHeader>
          {selectedInvoiceForDetail && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-4 bg-card">
                <h3 className="font-semibold mb-4 text-base">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">申请人</label>
                    <p className="text-sm">{selectedInvoiceForDetail.applicant || selectedInvoiceForDetail.submittedByName || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">申请类型</label>
                    <p className="text-sm">
                      {selectedInvoiceForDetail.applicationType === "normal" && "正常开票"}
                      {selectedInvoiceForDetail.applicationType === "urgent" && <Badge variant="outline" className="bg-red-50 text-red-700">紧急开票</Badge>}
                      {selectedInvoiceForDetail.applicationType === "reissue" && "重新开票"}
                      {!selectedInvoiceForDetail.applicationType && "-"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">合同编码</label>
                    <p className="text-sm">{selectedInvoiceForDetail.contractCode || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">合同名称</label>
                    <p className="text-sm">{selectedInvoiceForDetail.contractName || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">项目编码</label>
                    <p className="text-sm">{selectedInvoiceForDetail.projectCode || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">项目名称</label>
                    <p className="text-sm">{selectedInvoiceForDetail.projectName || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">合同收入（含税）</label>
                    <p className="text-sm">{selectedInvoiceForDetail.contractRevenue ? `¥${selectedInvoiceForDetail.contractRevenue.toLocaleString()}` : "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">已申请开票金额</label>
                    <p className="text-sm">{selectedInvoiceForDetail.appliedInvoiceAmount ? `¥${selectedInvoiceForDetail.appliedInvoiceAmount.toLocaleString()}` : "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">主营收入（含税）</label>
                    <p className="text-sm">{selectedInvoiceForDetail.mainRevenue ? `¥${selectedInvoiceForDetail.mainRevenue.toLocaleString()}` : "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">客户名称</label>
                    <p className="text-sm">{selectedInvoiceForDetail.customerName || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">政企行业</label>
                    <p className="text-sm">
                      {selectedInvoiceForDetail.industryType === "government" && "政府"}
                      {selectedInvoiceForDetail.industryType === "finance" && "金融"}
                      {selectedInvoiceForDetail.industryType === "education" && "教育"}
                      {selectedInvoiceForDetail.industryType === "healthcare" && "医疗"}
                      {selectedInvoiceForDetail.industryType === "manufacturing" && "制造业"}
                      {selectedInvoiceForDetail.industryType === "other" && "其他"}
                      {!selectedInvoiceForDetail.industryType && "-"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">是否已列收</label>
                    <p className="text-sm">
                      {selectedInvoiceForDetail.isRevenueListed === true && "是"}
                      {selectedInvoiceForDetail.isRevenueListed === false && "否"}
                      {selectedInvoiceForDetail.isRevenueListed === undefined && "-"}
                    </p>
                  </div>
                  {selectedInvoiceForDetail.invoiceNotes && (
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">发票备注</label>
                      <p className="text-sm p-3 bg-muted rounded-md">{selectedInvoiceForDetail.invoiceNotes}</p>
                    </div>
                  )}
                  {selectedInvoiceForDetail.attachments && selectedInvoiceForDetail.attachments.length > 0 && (
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">附件上传</label>
                      <div className="space-y-1">
                        {selectedInvoiceForDetail.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-blue-600">
                            <span>{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold mb-3 text-base">发票信息</h3>
                {selectedInvoiceForDetail.invoiceItems && selectedInvoiceForDetail.invoiceItems.length > 0 ? (
                  <div className="space-y-4">
                    {selectedInvoiceForDetail.invoiceItems.map((item, idx) => (
                      <div key={item.id} className="rounded-lg border border-border p-4 bg-muted/20">
                        <h4 className="text-sm font-semibold mb-3">发票项 {idx + 1}</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">发票申请类型</label>
                            <p className="mt-1 text-sm">
                              {item.invoiceType === "service" && "服务费"}
                              {item.invoiceType === "product" && "产品销售"}
                              {item.invoiceType === "maintenance" && "维护费"}
                              {item.invoiceType === "consulting" && "咨询费"}
                              {!["service", "product", "maintenance", "consulting"].includes(item.invoiceType) && (item.invoiceType || "-")}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">服务设备类型</label>
                            <p className="mt-1 text-sm">
                              {item.serviceEquipmentType === "hardware" && "硬件设备"}
                              {item.serviceEquipmentType === "software" && "软件系统"}
                              {item.serviceEquipmentType === "cloud" && "云服务"}
                              {item.serviceEquipmentType === "integration" && "集成服务"}
                              {!["hardware", "software", "cloud", "integration"].includes(item.serviceEquipmentType) && (item.serviceEquipmentType || "-")}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">税率（%）</label>
                            <p className="mt-1 text-sm">{item.taxRate}%</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">金额（含税）</label>
                            <p className="mt-1 text-sm font-semibold">¥{item.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">税额</label>
                            <p className="mt-1 text-sm text-muted-foreground">¥{item.taxAmount.toFixed(2)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">不含税金额</label>
                            <p className="mt-1 text-sm text-muted-foreground">¥{item.amountWithoutTax.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-4 border-t">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">总金额（含税）</p>
                        <p className="text-2xl font-bold text-primary">
                          ¥{selectedInvoiceForDetail.invoiceItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无发票明细</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 撤回对话框 */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>撤回申请</DialogTitle>
            <DialogDescription>请输入撤回理由</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="withdraw-reason">撤回理由 *</Label>
                <Textarea
                  id="withdraw-reason"
                  placeholder="请输入撤回申请的原因..."
                  value={withdrawReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setWithdrawReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setWithdrawDialogOpen(false)
              setWithdrawReason("")
              setSelectedInvoiceForWithdraw(null)
            }}>
              取消
            </Button>
            <Button 
              onClick={() => selectedInvoiceForWithdraw && handleWithdraw(selectedInvoiceForWithdraw.id, withdrawReason)}
              disabled={!withdrawReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              确认撤回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
