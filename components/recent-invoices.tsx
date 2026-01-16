import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Invoice } from "@/lib/types"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface RecentInvoicesProps {
  invoices: Invoice[]
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  draft: { label: "草稿", variant: "secondary" },
  pending_dept_leader_approval: { label: "待部门审批", variant: "secondary" },
  pending_finance_approval: { label: "待财务审批", variant: "secondary" },
  approved: { label: "已批准", variant: "default" },
  rejected: { label: "已拒绝", variant: "destructive" },
  pending_upload: { label: "待上传", variant: "secondary" },
  submitted_to_customer: { label: "已提交客户", variant: "default" },
  pending_customer_confirmation: { label: "待确认", variant: "secondary" },
  completed: { label: "已完成", variant: "default" },
  settled: { label: "已办结", variant: "default" },
  group_billing_pending: { label: "集团开票待审核", variant: "secondary" },
  group_billing_reviewed: { label: "集团开票已审核", variant: "default" },
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近发票</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">暂无发票记录</p>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <p className="font-medium">{invoice.projectName}</p>
                  <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(invoice.createdAt), "yyyy-MM-dd", { locale: zhCN })}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="font-semibold">¥{invoice.amount.toLocaleString()}</p>
                  <Badge variant={statusMap[invoice.status].variant}>{statusMap[invoice.status].label}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
