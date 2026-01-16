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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TodoItem, UserRole, Invoice, Payment } from "@/lib/types"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CheckCircle, XCircle, MoreVertical, Eye, FileText, History, UserPlus, Send, ChevronDown, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TodoListProps {
  todos: TodoItem[]
  onApproveInvoice: (invoiceId: string) => void
  onRejectInvoice: (invoiceId: string, notes: string) => void
  onConfirmPayment: (paymentId: string) => void
  onConfirmInvoice: (invoiceId: string, applyGroupBilling: boolean) => void
  userRole: UserRole
}

const priorityConfig = {
  high: { label: "高", color: "bg-red-50 text-red-700 border-red-200" },
  medium: { label: "中", color: "bg-orange-50 text-orange-700 border-orange-200" },
  low: { label: "低", color: "bg-blue-50 text-blue-700 border-blue-200" },
}

const statusConfig = {
  pending: { label: "待处理", color: "bg-orange-50 text-orange-700 border-orange-200" },
  in_progress: { label: "处理中", color: "bg-blue-50 text-blue-700 border-blue-200" },
  approved: { label: "已通过", color: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "已驳回", color: "bg-red-50 text-red-700 border-red-200" },
  delegated: { label: "已委托", color: "bg-purple-50 text-purple-700 border-purple-200" },
}

export function TodoList({ todos, onApproveInvoice, onRejectInvoice, onConfirmPayment, onConfirmInvoice, userRole }: TodoListProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [delegateDialogOpen, setDelegateDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [groupBillingDialogOpen, setGroupBillingDialogOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null)
  const [approveNotes, setApproveNotes] = useState("")
  const [rejectNotes, setRejectNotes] = useState("")
  const [nextApprover, setNextApprover] = useState("")
  const [rejectTo, setRejectTo] = useState("")
  const [notifyInApp, setNotifyInApp] = useState(true)
  const [notifyWeChat, setNotifyWeChat] = useState(true)
  const [notifySMS, setNotifySMS] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(false)

  const handleApprove = () => {
    if (selectedTodo) {
      if (selectedTodo.type === "invoice_approval") {
        onApproveInvoice(selectedTodo.relatedId)
      } else {
        onConfirmPayment(selectedTodo.relatedId)
      }
      setApproveDialogOpen(false)
      setApproveNotes("")
      setNextApprover("")
      setSelectedTodo(null)
    }
  }

  const handleReject = () => {
    if (selectedTodo) {
      onRejectInvoice(selectedTodo.relatedId, rejectNotes)
      setRejectDialogOpen(false)
      setRejectNotes("")
      setRejectTo("")
      setSelectedTodo(null)
    }
  }

  const openApproveDialog = (todo: TodoItem) => {
    setSelectedTodo(todo)
    setApproveDialogOpen(true)
  }

  const openRejectDialog = (todo: TodoItem) => {
    setSelectedTodo(todo)
    setRejectDialogOpen(true)
  }

  const openDetailDialog = (todo: TodoItem) => {
    // 如果是上传发票待办，跳转到发票管理页面
    if (todo.type === "invoice_upload") {
      window.location.href = "/invoices"
      return
    }

    setSelectedTodo(todo)
    setDetailDialogOpen(true)
  }

  const openDelegateDialog = (todo: TodoItem) => {
    setSelectedTodo(todo)
    setDelegateDialogOpen(true)
  }

  const openHistoryDialog = (todo: TodoItem) => {
    setSelectedTodo(todo)
    setHistoryDialogOpen(true)
  }

  if (todos.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-16 text-center">
        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-muted-foreground">暂无待办事项</p>
        <p className="text-sm text-muted-foreground mt-1">所有任务都已完成</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
              <TableHead className="w-12 text-gray-700 font-medium">序号</TableHead>
              <TableHead className="text-gray-700 font-medium">任务名称</TableHead>
              <TableHead className="text-gray-700 font-medium">所属流程</TableHead>
              <TableHead className="text-gray-700 font-medium">委托代办人</TableHead>
              <TableHead className="text-gray-700 font-medium">流程发起人</TableHead>
              <TableHead className="text-gray-700 font-medium">优先级</TableHead>
              <TableHead className="text-gray-700 font-medium">状态</TableHead>
              <TableHead className="text-gray-700 font-medium">创建时间</TableHead>
              <TableHead className="text-right w-[400px] text-gray-700 font-medium">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todos.map((todo, index) => {
              const invoice = todo.relatedData as Invoice
              const payment = todo.relatedData as Payment
              const isUploadTodo = todo.type === "invoice_upload"
              const isFinanceApprovalTodo = todo.type === "invoice_approval" && userRole === "finance" && invoice?.status === "pending_finance_approval"
              const isDeptLeaderApprovalTodo = todo.type === "invoice_approval" && userRole === "department_leader" && invoice?.status === "pending_dept_leader_approval"
              const canApprove =
                (todo.type === "invoice_approval" && (
                  (userRole === "finance" && invoice?.status === "pending_finance_approval") ||
                  (userRole === "department_leader" && invoice?.status === "pending_dept_leader_approval")
                )) ||
                (todo.type === "payment_confirmation" && userRole === "finance" && payment?.status === "pending")

              return (
                <TableRow key={todo.id} className="hover:bg-blue-50/50 border-b border-gray-100">
                  <TableCell className="text-gray-600">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{todo.title}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {todo.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-300 text-gray-700">{todo.processName}</Badge>
                  </TableCell>
                  <TableCell>
                    {todo.delegatedByName ? (
                      <div>
                        <div className="font-medium text-gray-900">{todo.assigneeName}</div>
                        <div className="text-xs text-gray-500">
                          由 {todo.delegatedByName} 委托
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700">{todo.initiatorName || "未知"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", priorityConfig[todo.priority].color)}>
                      {priorityConfig[todo.priority].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", statusConfig[todo.status].color)}>
                      {statusConfig[todo.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(todo.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* 申请详情 / 去上传 */}
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => openDetailDialog(todo)}
                        className="h-8 text-[#1890ff] hover:text-[#1890ff]/80 px-2"
                      >
                        {isUploadTodo ? "去上传" : "申请详情"}
                      </Button>

                      {/* 通过 - 部门领导审批待办和财务审批待办 */}
                      {canApprove && (isDeptLeaderApprovalTodo || isFinanceApprovalTodo) && (
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => openApproveDialog(todo)}
                          className="h-8 text-[#1890ff] hover:text-[#1890ff]/80 px-2"
                        >
                          通过
                        </Button>
                      )}

                      {/* 确认 - 客户经理确认发票待办 */}
                      {todo.type === "invoice_approval" && 
                       todo.processName === "发票确认流程" && 
                       userRole === "customer_manager" && (
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => setGroupBillingDialogOpen(true)}
                          className="h-8 text-[#1890ff] hover:text-[#1890ff]/80 px-2"
                        >
                          确认
                        </Button>
                      )}

                      {/* 上传集团发票 - 商务支撑中心 */}
                      {todo.type === "invoice_upload" && 
                       todo.processName === "集团开票流程" && 
                       userRole === "business_support" && (
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => {
                            // 跳转到发票管理页面
                            window.location.href = `/invoices`
                          }}
                          className="h-8 text-[#1890ff] hover:text-[#1890ff]/80 px-2"
                        >
                          <Upload className="mr-1 h-3 w-3" />
                          上传集团发票
                        </Button>
                      )}

                      {/* 驳回 - 部门领导审批待办和财务审批待办 */}
                      {canApprove && todo.type === "invoice_approval" && (isDeptLeaderApprovalTodo || isFinanceApprovalTodo) && (
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => openRejectDialog(todo)}
                          className="h-8 text-[#1890ff] hover:text-[#1890ff]/80 px-2"
                        >
                          驳回
                        </Button>
                      )}

                      {/* 委托 */}
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => openDelegateDialog(todo)}
                        className="h-8 text-[#1890ff] hover:text-[#1890ff]/80 px-2"
                      >
                        委托
                      </Button>

                      {/* 历史 */}
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => openHistoryDialog(todo)}
                        className="h-8 text-[#1890ff] hover:text-[#1890ff]/80 px-2"
                      >
                        历史
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* 审批通过对话框 */}
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
                    id="notify-in-app"
                    checked={notifyInApp}
                    onCheckedChange={(checked) => setNotifyInApp(checked as boolean)}
                  />
                  <Label htmlFor="notify-in-app" className="text-sm font-normal cursor-pointer">
                    站内消息通知
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify-wechat"
                    checked={notifyWeChat}
                    onCheckedChange={(checked) => setNotifyWeChat(checked as boolean)}
                  />
                  <Label htmlFor="notify-wechat" className="text-sm font-normal cursor-pointer">
                    企业微信
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify-sms"
                    checked={notifySMS}
                    onCheckedChange={(checked) => setNotifySMS(checked as boolean)}
                  />
                  <Label htmlFor="notify-sms" className="text-sm font-normal cursor-pointer">
                    短信通知
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify-email"
                    checked={notifyEmail}
                    onCheckedChange={(checked) => setNotifyEmail(checked as boolean)}
                  />
                  <Label htmlFor="notify-email" className="text-sm font-normal cursor-pointer">
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

      {/* 驳回对话框 */}
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

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTodo?.type === "invoice_approval" ? "发票申请详情" : "回款详情"}</DialogTitle>
            <DialogDescription>查看完整的申请信息</DialogDescription>
          </DialogHeader>
          {selectedTodo && (
            <div className="space-y-6">

              {/* 发票详细信息 */}
              {selectedTodo.type === "invoice_approval" && selectedTodo.relatedData && (
                <div className="space-y-4">
                  {(() => {
                    const invoice = selectedTodo.relatedData as Invoice
                    return (
                      <>
                        {/* 基本信息 - 与表单一致 */}
                        <div className="rounded-lg border border-border p-4">
                          <h3 className="font-semibold mb-3 text-base">基本信息</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">申请人 *</label>
                              <p className="mt-1">{invoice.applicant || invoice.submittedByName || "未知"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">申请类型 *</label>
                              <p className="mt-1">
                                {invoice.applicationType === "normal" && "正常开票"}
                                {invoice.applicationType === "urgent" && <Badge variant="outline" className="bg-red-50 text-red-700">紧急开票</Badge>}
                                {invoice.applicationType === "reissue" && "重新开票"}
                                {!invoice.applicationType && "-"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">合同编码 *</label>
                              <p className="mt-1 font-mono text-sm">{invoice.contractCode || "-"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">合同名称 *</label>
                              <p className="mt-1">{invoice.contractName || "-"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">项目编码</label>
                              <p className="mt-1 font-mono text-sm">{invoice.projectCode || "-"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">项目名称 *</label>
                              <p className="mt-1">{invoice.projectName || "-"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">合同收入（含税）*</label>
                              <p className="mt-1 font-semibold">
                                {invoice.contractRevenue ? `¥${invoice.contractRevenue.toLocaleString()}` : "-"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">已申请开票金额</label>
                              <p className="mt-1 font-semibold">
                                {invoice.appliedInvoiceAmount ? `¥${invoice.appliedInvoiceAmount.toLocaleString()}` : "¥0"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">主营收入（含税）</label>
                              <p className="mt-1 font-semibold">
                                {invoice.mainRevenue ? `¥${invoice.mainRevenue.toLocaleString()}` : "-"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">客户名称 *</label>
                              <p className="mt-1">{invoice.customerName || "-"}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">政企行业</label>
                              <p className="mt-1">
                                {invoice.industryType === "government" && "政府"}
                                {invoice.industryType === "finance" && "金融"}
                                {invoice.industryType === "education" && "教育"}
                                {invoice.industryType === "healthcare" && "医疗"}
                                {invoice.industryType === "manufacturing" && "制造业"}
                                {invoice.industryType === "other" && "其他"}
                                {!invoice.industryType && "-"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">纳税人识别号 *</label>
                              <p className="mt-1 font-mono text-sm">{invoice.taxpayerIdNumber || "-"}</p>
                            </div>
                            <div className="col-span-2">
                              <label className="text-sm font-medium">是否已列收 *</label>
                              <p className="mt-1">
                                {invoice.isRevenueListed === true && <Badge variant="outline" className="bg-green-50 text-green-700">是</Badge>}
                                {invoice.isRevenueListed === false && <Badge variant="outline" className="bg-gray-50 text-gray-700">否</Badge>}
                                {invoice.isRevenueListed === undefined && "-"}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <label className="text-sm font-medium">发票备注</label>
                              <p className="mt-1 p-3 bg-muted/50 rounded-md min-h-[60px]">
                                {invoice.invoiceNotes || "无"}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <label className="text-sm font-medium">附件上传</label>
                              {invoice.attachments && invoice.attachments.length > 0 ? (
                                <div className="mt-1 space-y-1">
                                  {invoice.attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-blue-600">
                                      <FileText className="h-4 w-4" />
                                      <span>{file}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-1 text-sm text-muted-foreground">无附件</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 发票信息 - 与表单一致 */}
                        <div className="rounded-lg border border-border p-4">
                          <h3 className="font-semibold mb-3 text-base">发票信息</h3>
                          {invoice.invoiceItems && invoice.invoiceItems.length > 0 ? (
                            <div className="space-y-4">
                              {invoice.invoiceItems.map((item, idx) => (
                                <div key={item.id} className="rounded-lg border border-border p-4 bg-muted/20">
                                  <h4 className="text-sm font-semibold mb-3">发票项 {idx + 1}</h4>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">发票申请类型 *</label>
                                      <p className="mt-1">
                                        {item.invoiceType === "service" && "服务费"}
                                        {item.invoiceType === "product" && "产品销售"}
                                        {item.invoiceType === "maintenance" && "维护费"}
                                        {item.invoiceType === "consulting" && "咨询费"}
                                        {!["service", "product", "maintenance", "consulting"].includes(item.invoiceType) && (item.invoiceType || "-")}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">服务设备类型</label>
                                      <p className="mt-1">
                                        {item.serviceEquipmentType === "hardware" && "硬件设备"}
                                        {item.serviceEquipmentType === "software" && "软件系统"}
                                        {item.serviceEquipmentType === "cloud" && "云服务"}
                                        {item.serviceEquipmentType === "integration" && "集成服务"}
                                        {!["hardware", "software", "cloud", "integration"].includes(item.serviceEquipmentType) && (item.serviceEquipmentType || "-")}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">税率（%）*</label>
                                      <p className="mt-1">{item.taxRate}%</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">金额（含税）*</label>
                                      <p className="mt-1 font-semibold">¥{item.amount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">税额</label>
                                      <p className="mt-1 text-muted-foreground">¥{item.taxAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">不含税金额</label>
                                      <p className="mt-1 text-muted-foreground">¥{item.amountWithoutTax.toFixed(2)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <div className="flex justify-end pt-4 border-t">
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">总金额（含税）</p>
                                  <p className="text-2xl font-bold text-primary">
                                    ¥{invoice.invoiceItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">暂无发票明细</p>
                          )}
                        </div>

                      </>
                    )
                  })()}
                </div>
              )}

              {/* 回款详细信息 - 与表单一致 */}
              {selectedTodo.type === "payment_confirmation" && selectedTodo.relatedData && (
                <div className="rounded-lg border border-border p-4 bg-card">
                  <h3 className="font-semibold mb-4 text-base">回款信息</h3>
                  {(() => {
                    const payment = selectedTodo.relatedData as Payment
                    return (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">关联发票</label>
                          <p className="text-sm">{payment.invoiceNumber || payment.invoiceId}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">回款金额（元）</label>
                          <p className="text-sm">¥{payment.amount.toLocaleString()}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">回款日期</label>
                          <p className="text-sm">{payment.paymentDate}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">银行流水号</label>
                          <p className="text-sm font-mono">{payment.bankReference || "-"}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">备注</label>
                          <p className="text-sm p-3 bg-muted rounded-md min-h-[60px]">
                            {payment.notes || "无"}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 委托对话框 */}
      <Dialog open={delegateDialogOpen} onOpenChange={setDelegateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>委托任务</DialogTitle>
            <DialogDescription>选择要委托的人员处理此任务</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">委托功能开发中...</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelegateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setDelegateDialogOpen(false)}>确认委托</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 历史对话框 */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>流程历史</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">暂无历史记录</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setHistoryDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 集团开票询问对话框 */}
      <Dialog open={groupBillingDialogOpen} onOpenChange={setGroupBillingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>办结确认</DialogTitle>
            <DialogDescription>发票已确认，请选择下一步操作</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                发票已确认办结，是否继续申请集团向客户开票？
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedTodo && onConfirmInvoice) {
                      onConfirmInvoice(selectedTodo.relatedId, false)
                    }
                    setGroupBillingDialogOpen(false)
                    setSelectedTodo(null)
                  }}
                  className="w-full"
                >
                  否，办结
                </Button>
                <Button
                  onClick={() => {
                    if (selectedTodo && onConfirmInvoice) {
                      onConfirmInvoice(selectedTodo.relatedId, true)
                    }
                    setGroupBillingDialogOpen(false)
                    setSelectedTodo(null)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  是，继续申请集团开票
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupBillingDialogOpen(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
