import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Invoice } from "@/lib/types"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface RecentInvoicesProps {
  invoices: Invoice[]
}

const statusMap = {
  draft: { label: "草稿", variant: "secondary" as const },
  pending_approval: { label: "待审批", variant: "default" as const },
  approved: { label: "已批准", variant: "default" as const },
  rejected: { label: "已拒绝", variant: "destructive" as const },
  submitted_to_customer: { label: "已提交客户", variant: "default" as const },
  completed: { label: "已完成", variant: "default" as const },
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
