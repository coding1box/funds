import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Payment } from "@/lib/types"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface RecentPaymentsProps {
  payments: Payment[]
}

const statusMap = {
  pending: { label: "待确认", variant: "secondary" as const },
  confirmed: { label: "已确认", variant: "default" as const },
  reconciled: { label: "已对账", variant: "default" as const },
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近回款</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">暂无回款记录</p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <p className="font-medium">{payment.invoiceNumber || "未关联发票"}</p>
                  <p className="text-sm text-muted-foreground">{payment.bankReference || "无银行流水号"}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(payment.paymentDate), "yyyy-MM-dd", { locale: zhCN })}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="font-semibold text-green-600">+¥{payment.amount.toLocaleString()}</p>
                  <Badge variant={statusMap[payment.status].variant}>{statusMap[payment.status].label}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
