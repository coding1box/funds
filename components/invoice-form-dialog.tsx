"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockProjects, mockContracts } from "@/lib/mock-data"
import type { Invoice, InvoiceItem } from "@/lib/types"
import { Plus, Trash2, Upload } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface InvoiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice
  onSubmit: (data: Partial<Invoice>) => void
}

export function InvoiceFormDialog({ open, onOpenChange, invoice, onSubmit }: InvoiceFormDialogProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    applicant: invoice?.applicant || user?.name || "",
    applicationType: invoice?.applicationType || "",
    contractCode: invoice?.contractCode || "",
    contractName: invoice?.contractName || "",
    projectCode: invoice?.projectCode || "",
    projectName: invoice?.projectName || "",
    projectId: invoice?.projectId || "",
    contractRevenue: invoice?.contractRevenue || 0,
    appliedInvoiceAmount: invoice?.appliedInvoiceAmount || 0,
    mainRevenue: invoice?.mainRevenue || 0,
    customerName: invoice?.customerName || "",
    industryType: invoice?.industryType || "",
    taxpayerIdNumber: invoice?.taxpayerIdNumber || "",
    isRevenueListed: invoice?.isRevenueListed !== undefined ? invoice.isRevenueListed : false,
    invoiceNotes: invoice?.invoiceNotes || "",
    attachments: invoice?.attachments || [],
  })

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(
    invoice?.invoiceItems || [
      {
        id: `item-${Date.now()}`,
        invoiceType: "",
        serviceEquipmentType: "",
        taxRate: 0,
        amount: 0,
        taxAmount: 0,
        amountWithoutTax: 0,
      },
    ],
  )

  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: `item-${Date.now()}`,
        invoiceType: "",
        serviceEquipmentType: "",
        taxRate: 0,
        amount: 0,
        taxAmount: 0,
        amountWithoutTax: 0,
      },
    ])
  }

  const handleRemoveItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((item) => item.id !== id))
    }
  }

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(
      invoiceItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }

          // Auto-calculate amounts when tax rate or amount changes
          if (field === "amount" || field === "taxRate") {
            const amount = field === "amount" ? Number(value) : item.amount
            const taxRate = field === "taxRate" ? Number(value) : item.taxRate

            updated.amountWithoutTax = amount / (1 + taxRate / 100)
            updated.taxAmount = amount - updated.amountWithoutTax
          }

          return updated
        }
        return item
      }),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0)

    onSubmit({
      ...formData,
      amount: totalAmount,
      invoiceItems,
    })

    onOpenChange(false)
  }

  const handleProjectChange = (projectId: string) => {
    const project = mockProjects.find((p) => p.id === projectId)
    if (project) {
      setFormData({
        ...formData,
        projectId,
        customerName: project.customerName,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? "编辑发票" : "新增发票"}</DialogTitle>
          <DialogDescription>填写完整的发票申请信息，包括合同信息和发票明细</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicant">申请人 *</Label>
                <Input
                  id="applicant"
                  value={formData.applicant}
                  disabled
                  className="bg-muted"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationType">申请类型 *</Label>
                <Select
                  value={formData.applicationType}
                  onValueChange={(value) => setFormData({ ...formData, applicationType: value })}
                  required
                >
                  <SelectTrigger id="applicationType">
                    <SelectValue placeholder="请选择申请类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">未回款申请</SelectItem>
                    <SelectItem value="paid">已回款申请</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractCode">合同编码 *</Label>
                <Input
                  id="contractCode"
                  value={formData.contractCode}
                  onChange={(e) => {
                    const code = e.target.value
                    const contract = mockContracts.find((c) => c.code === code)
                    if (contract) {
                      setFormData({
                        ...formData,
                        contractCode: code,
                        contractName: contract.name,
                      projectCode: contract.projectCode,
                      projectId: contract.projectId,
                      projectName: contract.projectName,
                      customerName: contract.customerName,
                      contractRevenue: contract.contractRevenue,
                      mainRevenue: contract.mainRevenue,
                      appliedInvoiceAmount: contract.appliedInvoiceAmount,
                    })
                    } else {
                      setFormData({ ...formData, contractCode: code })
                    }
                  }}
                  placeholder="请输入合同编码"
                  list="contracts"
                  required
                />
                <datalist id="contracts">
                  {mockContracts.map((contract) => (
                    <option key={contract.id} value={contract.code}>
                      {contract.name}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractName">合同名称 *</Label>
                <Select
                  value={formData.contractName}
                  onValueChange={(value) => {
                    const contract = mockContracts.find((c) => c.name === value)
                    if (contract) {
                      setFormData({
                        ...formData,
                        contractName: value,
                        contractCode: contract.code,
                      projectCode: contract.projectCode,
                      projectId: contract.projectId,
                      projectName: contract.projectName,
                      customerName: contract.customerName,
                      contractRevenue: contract.contractRevenue,
                      mainRevenue: contract.mainRevenue,
                      appliedInvoiceAmount: contract.appliedInvoiceAmount,
                    })
                    }
                  }}
                  required
                >
                  <SelectTrigger id="contractName">
                    <SelectValue placeholder="请选择合同名称" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockContracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.name}>
                        {contract.name} ({contract.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectCode">项目编码</Label>
                <Input
                  id="projectCode"
                  value={formData.projectCode}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractRevenue">合同收入（含税）*</Label>
                <Input
                  id="contractRevenue"
                  type="number"
                  step="0.01"
                  value={formData.contractRevenue || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appliedInvoiceAmount">已申请开票金额</Label>
                <Input
                  id="appliedInvoiceAmount"
                  type="number"
                  step="0.01"
                  value={formData.appliedInvoiceAmount || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainRevenue">主营收入（含税）</Label>
                <Input
                  id="mainRevenue"
                  type="number"
                  step="0.01"
                  value={formData.mainRevenue || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">客户名称 *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="realPartyName">真实甲方 *</Label>
                <Input
                  id="realPartyName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="请输入真实甲方名称"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industryType">政企行业</Label>
                <Input
                  id="industryType"
                  value={formData.industryType}
                  onChange={(e) => setFormData({ ...formData, industryType: e.target.value })}
                  placeholder="请输入政企行业"
                />
              </div>


              <div className="space-y-2 col-span-2">
                <Label>是否已列收 *</Label>
                <RadioGroup
                  value={formData.isRevenueListed ? "yes" : "no"}
                  onValueChange={(value) => setFormData({ ...formData, isRevenueListed: value === "yes" })}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes" className="font-normal cursor-pointer">
                        是
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no" className="font-normal cursor-pointer">
                        否
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="invoiceNotes">发票备注</Label>
                <Textarea
                  id="invoiceNotes"
                  value={formData.invoiceNotes}
                  onChange={(e) => setFormData({ ...formData, invoiceNotes: e.target.value })}
                  placeholder="请输入发票备注信息"
                  rows={3}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="attachments">附件上传</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    选择文件
                  </Button>
                  <span className="text-sm text-muted-foreground">支持 PDF、Word、Excel、图片格式，最大 10MB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">发票信息</CardTitle>
              <Button type="button" size="sm" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                添加发票项
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoiceItems.map((item, index) => (
                <Card key={item.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">发票项 {index + 1}</CardTitle>
                      {invoiceItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>发票申请类型 *</Label>
                      <Select
                        value={item.invoiceType}
                        onValueChange={(value) => handleItemChange(item.id, "invoiceType", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">服务费</SelectItem>
                          <SelectItem value="product">产品销售</SelectItem>
                          <SelectItem value="maintenance">维护费</SelectItem>
                          <SelectItem value="consulting">咨询费</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>服务设备类型</Label>
                      <Select
                        value={item.serviceEquipmentType}
                        onValueChange={(value) => handleItemChange(item.id, "serviceEquipmentType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hardware">硬件设备</SelectItem>
                          <SelectItem value="software">软件系统</SelectItem>
                          <SelectItem value="cloud">云服务</SelectItem>
                          <SelectItem value="integration">集成服务</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>税率（%）*</Label>
                      <Select
                        value={item.taxRate.toString()}
                        onValueChange={(value) => handleItemChange(item.id, "taxRate", Number.parseFloat(value))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="3">3%</SelectItem>
                          <SelectItem value="6">6%</SelectItem>
                          <SelectItem value="9">9%</SelectItem>
                          <SelectItem value="13">13%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>金额（含税）*</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.amount || ""}
                        onChange={(e) => handleItemChange(item.id, "amount", Number.parseFloat(e.target.value))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>税额</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.taxAmount.toFixed(2)}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>不含税金额</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.amountWithoutTax.toFixed(2)}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">总金额（含税）</p>
                  <p className="text-2xl font-bold text-primary">
                    ¥{invoiceItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{invoice ? "更新发票" : "提交审批"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
