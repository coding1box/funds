"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockProjects } from "@/lib/mock-data"
import type { Invoice } from "@/lib/types"

interface InvoiceFormProps {
  invoice?: Invoice
  onSubmit: (data: Partial<Invoice>) => void
  onCancel: () => void
}

export function InvoiceForm({ invoice, onSubmit, onCancel }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    projectId: invoice?.projectId || "",
    amount: invoice?.amount || 0,
    notes: invoice?.notes || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{invoice ? "编辑发票" : "创建新发票"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">选择项目</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => setFormData({ ...formData, projectId: value })}
              required
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="选择项目" />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} - {project.customerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">金额（元）</Label>
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
            <Button type="submit">{invoice ? "更新发票" : "提交发票"}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
