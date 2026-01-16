"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { loadInvoices } from "@/lib/mock-data"
import type { Payment } from "@/lib/types"

interface PaymentFormProps {
  onSubmit: (data: Partial<Payment>) => void
  onCancel: () => void
}

export function PaymentForm({ onSubmit, onCancel }: PaymentFormProps) {
  const invoices = loadInvoices().filter((inv) => inv.status === "submitted_to_customer")
  const [formData, setFormData] = useState({
    invoiceId: "",
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    bankReference: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>登记回款</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice">关联发票</Label>
            <Select
              value={formData.invoiceId}
              onValueChange={(value) => {
                const invoice = invoices.find((inv) => inv.id === value)
                setFormData({
                  ...formData,
                  invoiceId: value,
                  amount: invoice?.amount || 0,
                })
              }}
              required
            >
              <SelectTrigger id="invoice">
                <SelectValue placeholder="选择发票" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - {invoice.projectName} (¥{invoice.amount.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">回款金额（元）</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount || ""}
              onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">回款日期</Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankReference">银行流水号</Label>
            <Input
              id="bankReference"
              value={formData.bankReference}
              onChange={(e) => setFormData({ ...formData, bankReference: e.target.value })}
              placeholder="输入银行流水号..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="添加备注信息..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">提交回款</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
