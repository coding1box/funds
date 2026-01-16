"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Payment, UserRole } from "@/lib/types"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CheckCircle, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentListProps {
  payments: Payment[]
  userRole: UserRole
  onConfirm: (paymentId: string) => void
  onReconcile: (paymentId: string) => void
}

const statusMap = {
  pending: { label: "待确认", color: "bg-orange-50 text-orange-700 border-orange-200" },
  confirmed: { label: "已确认", color: "bg-blue-50 text-blue-700 border-blue-200" },
  reconciled: { label: "已对账", color: "bg-green-50 text-green-700 border-green-200" },
}

export function PaymentList({ payments, userRole, onConfirm, onReconcile }: PaymentListProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12">序号</TableHead>
            <TableHead>发票号码</TableHead>
            <TableHead>银行流水号</TableHead>
            <TableHead className="text-right">回款金额</TableHead>
            <TableHead>回款日期</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>登记时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                暂无回款记录
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment, index) => (
              <TableRow key={payment.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-mono text-sm">{payment.invoiceNumber || "未关联"}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {payment.bankReference || "无"}
                </TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  ¥{payment.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(payment.paymentDate), "yyyy-MM-dd", { locale: zhCN })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("border", statusMap[payment.status].color)}>
                    {statusMap[payment.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(payment.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {userRole === "business_support" && payment.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => onConfirm(payment.id)}
                        className="h-7 text-xs bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        确认回款
                      </Button>
                    )}
                    {userRole === "finance" && payment.status === "confirmed" && (
                      <Button size="sm" onClick={() => onReconcile(payment.id)} className="h-7 text-xs">
                        <FileCheck className="mr-1 h-3 w-3" />
                        完成对账
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
  )
}
