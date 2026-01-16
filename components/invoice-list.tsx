"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Invoice, UserRole } from "@/lib/types"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CheckCircle, XCircle, Send, Edit, Eye, FileText, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InvoiceListProps {
  invoices: Invoice[]
  userRole: UserRole
  onApprove: (invoiceId: string) => void
  onReject: (invoiceId: string, notes: string) => void
  onSubmitToCustomer: (invoiceId: string) => void
  onEdit: (invoice: Invoice) => void
  onUpload: (invoice: Invoice) => void
  onApplyGroupBilling?: (invoice: Invoice) => void
  onCreate?: () => void
}

const statusMap = {
  draft: { label: "草稿", color: "bg-gray-100 text-gray-700 border-gray-200" },
  pending_dept_leader_approval: { label: "待部门领导审批", color: "bg-orange-50 text-orange-700 border-orange-200" },
  pending_finance_approval: { label: "待财务审批", color: "bg-blue-50 text-blue-700 border-blue-200" },
  approved: { label: "已批准", color: "bg-blue-50 text-blue-700 border-blue-200" },
  rejected: { label: "已拒绝", color: "bg-red-50 text-red-700 border-red-200" },
  pending_upload: { label: "待上传", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  submitted_to_customer: { label: "已提交客户", color: "bg-purple-50 text-purple-700 border-purple-200" },
  pending_customer_confirmation: { label: "待客户确认", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  completed: { label: "已完成", color: "bg-green-50 text-green-700 border-green-200" },
  settled: { label: "已办结", color: "bg-teal-50 text-teal-700 border-teal-200" },
  group_billing_pending: { label: "集团开票待审核", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  group_billing_reviewed: { label: "集团开票已审核", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
}

export function InvoiceList({ invoices, userRole, onApprove, onReject, onSubmitToCustomer, onEdit, onUpload, onApplyGroupBilling, onCreate }: InvoiceListProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [approveNotes, setApproveNotes] = useState("")
  const [rejectNotes, setRejectNotes] = useState("")
  const [nextApprover, setNextApprover] = useState("")
  const [rejectTo, setRejectTo] = useState("")
  const [notifyInApp, setNotifyInApp] = useState(true)
  const [notifyWeChat, setNotifyWeChat] = useState(true)
  const [notifySMS, setNotifySMS] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(false)

  const handleApprove = () => {
    if (selectedInvoice) {
      onApprove(selectedInvoice.id)
      setApproveDialogOpen(false)
      setApproveNotes("")
      setNextApprover("")
      setSelectedInvoice(null)
    }
  }

  const handleReject = () => {
    if (selectedInvoice) {
      onReject(selectedInvoice.id, rejectNotes)
      setRejectDialogOpen(false)
      setRejectNotes("")
      setRejectTo("")
      setSelectedInvoice(null)
    }
  }

  const openApproveDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setApproveDialogOpen(true)
  }

  const openRejectDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setRejectDialogOpen(true)
  }

  const openDetailDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setDetailDialogOpen(true)
  }

  return (
    <>
      {/* 筛选条件区 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">项目编码：</label>
            <input
              type="text"
              placeholder="请输入项目编码"
              className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#1890ff]"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">合同名称：</label>
            <input
              type="text"
              placeholder="请输入合同名称"
              className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#1890ff]"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">客户名称：</label>
            <input
              type="text"
              placeholder="请输入客户名称"
              className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#1890ff]"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">发票申请类型：</label>
            <select className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#1890ff]">
              <option>请选择发票申请类型</option>
              <option>服务费</option>
              <option>产品销售</option>
              <option>维护费</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">其他关键字：</label>
            <input
              type="text"
              placeholder="发件箱搜索"
              className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#1890ff]"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">开票日期：</label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                placeholder="开始日期"
                className="flex-1 h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#1890ff]"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                placeholder="结束日期"
                className="flex-1 h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#1890ff]"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">是否已列收：</label>
            <select className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#1890ff]">
              <option>请选择</option>
              <option>是</option>
              <option>否</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="bg-[#1890ff] hover:bg-[#1890ff]/90 text-white h-9 px-6">
            查询
          </Button>
          <Button variant="outline" className="border-[#1890ff] text-[#1890ff] hover:bg-blue-50 h-9 px-6">
            重置
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 h-9 px-6">
            导出
          </Button>
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 h-9 px-6" onClick={onCreate}>
            新增申请
          </Button>
        </div>
      </div>

      {/* 表格区 */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
              <TableHead className="w-12 text-gray-700 font-medium">序号</TableHead>
              <TableHead className="text-gray-700 font-medium">发票号码</TableHead>
              <TableHead className="text-gray-700 font-medium">项目名称</TableHead>
              <TableHead className="text-gray-700 font-medium">客户名称</TableHead>
              <TableHead className="text-right text-gray-700 font-medium">金额</TableHead>
              <TableHead className="text-gray-700 font-medium">状态</TableHead>
              <TableHead className="text-gray-700 font-medium">提交人</TableHead>
              <TableHead className="text-gray-700 font-medium">创建时间</TableHead>
              <TableHead className="text-right text-gray-700 font-medium">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-gray-500">
                  暂无发票记录
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice, index) => (
                <TableRow key={invoice.id} className="hover:bg-blue-50/50 border-b border-gray-100">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm text-gray-900">{invoice.invoiceNumber || "待生成"}</TableCell>
                  <TableCell className="text-gray-900">{invoice.projectName}</TableCell>
                  <TableCell className="text-gray-600">{invoice.customerName}</TableCell>
                  <TableCell className="text-right font-medium text-gray-900">¥{invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border", statusMap[invoice.status]?.color || "bg-gray-100 text-gray-700 border-gray-200")}>
                      {statusMap[invoice.status]?.label || invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{invoice.submittedByName}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(invoice.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* Detail link - always visible */}
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => openDetailDialog(invoice)}
                        className="h-7 text-xs px-2 text-[#1890ff] hover:text-[#1890ff]/80"
                      >
                        详情
                      </Button>


                      {/* Finance upload action */}
                      {userRole === "finance" && invoice.status === "approved" && (
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => onUpload(invoice)}
                          className="h-7 text-xs px-2 text-[#1890ff] hover:text-[#1890ff]/80"
                        >
                          <Upload className="mr-1 h-3 w-3" />
                          上传发票信息
                        </Button>
                      )}

                      {/* Business support submit action */}
                      {userRole === "business_support" && invoice.status === "approved" && (
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => onSubmitToCustomer(invoice.id)}
                          className="h-7 text-xs px-2 text-[#1890ff] hover:text-[#1890ff]/80"
                        >
                          提交客户
                        </Button>
                      )}

                      {/* Customer manager edit action */}
                      {userRole === "customer_manager" && invoice.status === "draft" && (
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => onEdit(invoice)}
                          className="h-7 text-xs px-2 text-[#1890ff] hover:text-[#1890ff]/80"
                        >
                          编辑
                        </Button>
                      )}

                      {/* Customer manager group billing application */}
                      {userRole === "customer_manager" && invoice.status === "group_billing_pending" && onApplyGroupBilling && (
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => onApplyGroupBilling(invoice)}
                          className="h-7 text-xs px-2 text-[#1890ff] hover:text-[#1890ff]/80"
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          申请集团开票
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>发票详情</DialogTitle>
            <DialogDescription>查看发票申请的详细信息</DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* 基本信息 - 与表单一致 */}
              <div className="rounded-lg border border-border p-4 bg-card">
                <h3 className="font-semibold mb-4 text-base">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">申请人</label>
                    <p className="text-sm">{selectedInvoice.applicant || selectedInvoice.submittedByName || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">申请类型</label>
                    <p className="text-sm">
                      {selectedInvoice.applicationType === "normal" && "正常开票"}
                      {selectedInvoice.applicationType === "urgent" && "紧急开票"}
                      {selectedInvoice.applicationType === "reissue" && "重新开票"}
                      {!selectedInvoice.applicationType && "-"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">合同编码</label>
                    <p className="text-sm">{selectedInvoice.contractCode || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">合同名称</label>
                    <p className="text-sm">{selectedInvoice.contractName || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">项目编码</label>
                    <p className="text-sm">{selectedInvoice.projectCode || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">项目名称</label>
                    <p className="text-sm">{selectedInvoice.projectName || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">合同收入（含税）</label>
                    <p className="text-sm">{selectedInvoice.contractRevenue ? `¥${selectedInvoice.contractRevenue.toLocaleString()}` : "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">已申请开票金额</label>
                    <p className="text-sm">{selectedInvoice.appliedInvoiceAmount ? `¥${selectedInvoice.appliedInvoiceAmount.toLocaleString()}` : "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">主营收入（含税）</label>
                    <p className="text-sm">{selectedInvoice.mainRevenue ? `¥${selectedInvoice.mainRevenue.toLocaleString()}` : "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">客户名称</label>
                    <p className="text-sm">{selectedInvoice.customerName || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">政企行业</label>
                    <p className="text-sm">
                      {selectedInvoice.industryType === "government" && "政府"}
                      {selectedInvoice.industryType === "finance" && "金融"}
                      {selectedInvoice.industryType === "education" && "教育"}
                      {selectedInvoice.industryType === "healthcare" && "医疗"}
                      {selectedInvoice.industryType === "manufacturing" && "制造业"}
                      {selectedInvoice.industryType === "other" && "其他"}
                      {!selectedInvoice.industryType && "-"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">纳税人识别号</label>
                    <p className="text-sm font-mono">{selectedInvoice.taxpayerIdNumber || "-"}</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">是否已列收</label>
                    <p className="text-sm">
                      {selectedInvoice.isRevenueListed === true && "是"}
                      {selectedInvoice.isRevenueListed === false && "否"}
                      {selectedInvoice.isRevenueListed === undefined && "-"}
                    </p>
                  </div>
                  {selectedInvoice.invoiceNotes && (
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">发票备注</label>
                      <p className="text-sm p-3 bg-muted rounded-md">{selectedInvoice.invoiceNotes}</p>
                    </div>
                  )}
                  {selectedInvoice.attachments && selectedInvoice.attachments.length > 0 && (
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium">附件上传</label>
                      <div className="space-y-1">
                        {selectedInvoice.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-blue-600">
                            <FileText className="h-4 w-4" />
                            <span>{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 发票信息 - 与表单一致 */}
              <div className="rounded-lg border border-border p-4">
                <h3 className="font-semibold mb-3 text-base">发票信息</h3>
                {selectedInvoice.invoiceItems && selectedInvoice.invoiceItems.length > 0 ? (
                  <div className="space-y-4">
                    {selectedInvoice.invoiceItems.map((item, idx) => (
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
                          ¥{selectedInvoice.invoiceItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
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

      {/* Approve dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>审批通过</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* 审批意见 */}
            <div className="space-y-2">
              <Label htmlFor="approve-notes">审批意见：</Label>
              <Textarea
                id="approve-notes"
                placeholder="同意"
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* 下一审批人 */}
            <div className="space-y-2">
              <Label htmlFor="next-approver">下一审批人：</Label>
              <Select value={nextApprover} onValueChange={setNextApprover}>
                <SelectTrigger id="next-approver">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user1">张三</SelectItem>
                  <SelectItem value="user2">李四</SelectItem>
                  <SelectItem value="user3">王五</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 消息通知 */}
            <div className="space-y-3">
              <Label>消息通知：</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approve-notify-in-app"
                    checked={notifyInApp}
                    onCheckedChange={(checked) => setNotifyInApp(checked as boolean)}
                  />
                  <Label htmlFor="approve-notify-in-app" className="text-sm font-normal cursor-pointer">
                    站内消息通知
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approve-notify-wechat"
                    checked={notifyWeChat}
                    onCheckedChange={(checked) => setNotifyWeChat(checked as boolean)}
                  />
                  <Label htmlFor="approve-notify-wechat" className="text-sm font-normal cursor-pointer">
                    企业微信
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approve-notify-sms"
                    checked={notifySMS}
                    onCheckedChange={(checked) => setNotifySMS(checked as boolean)}
                  />
                  <Label htmlFor="approve-notify-sms" className="text-sm font-normal cursor-pointer">
                    短信通知
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="approve-notify-email"
                    checked={notifyEmail}
                    onCheckedChange={(checked) => setNotifyEmail(checked as boolean)}
                  />
                  <Label htmlFor="approve-notify-email" className="text-sm font-normal cursor-pointer">
                    邮件通知
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleApprove} className="bg-blue-600 hover:bg-blue-700">
              提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>审批驳回</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* 审批意见 */}
            <div className="space-y-2">
              <Label htmlFor="reject-notes">审批意见：</Label>
              <Textarea
                id="reject-notes"
                placeholder="驳回"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* 驳回至 */}
            <div className="space-y-2">
              <Label htmlFor="reject-to">驳回至：</Label>
              <Select value={rejectTo} onValueChange={setRejectTo}>
                <SelectTrigger id="reject-to">
                  <SelectValue placeholder="发起人" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initiator">发起人</SelectItem>
                  <SelectItem value="previous">上一审批人</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 消息通知 */}
            <div className="space-y-3">
              <Label>消息通知：</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reject-notify-in-app"
                    checked={notifyInApp}
                    onCheckedChange={(checked) => setNotifyInApp(checked as boolean)}
                  />
                  <Label htmlFor="reject-notify-in-app" className="text-sm font-normal cursor-pointer">
                    站内消息通知
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reject-notify-wechat"
                    checked={notifyWeChat}
                    onCheckedChange={(checked) => setNotifyWeChat(checked as boolean)}
                  />
                  <Label htmlFor="reject-notify-wechat" className="text-sm font-normal cursor-pointer">
                    企业微信
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reject-notify-sms"
                    checked={notifySMS}
                    onCheckedChange={(checked) => setNotifySMS(checked as boolean)}
                  />
                  <Label htmlFor="reject-notify-sms" className="text-sm font-normal cursor-pointer">
                    短信通知
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reject-notify-email"
                    checked={notifyEmail}
                    onCheckedChange={(checked) => setNotifyEmail(checked as boolean)}
                  />
                  <Label htmlFor="reject-notify-email" className="text-sm font-normal cursor-pointer">
                    邮件通知
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleReject} className="bg-blue-600 hover:bg-blue-700">
              提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
