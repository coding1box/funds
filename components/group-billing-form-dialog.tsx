"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InvoiceItem {
  id: string
  taxRate: number
  category: string
  productName: string
  model: string
  unit: string
  quantity: number
  amount: number
}

interface GroupBillingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    projectName: string
    billingAmount: number
    customerName: string
    address: string
    taxpayerIdNumber: string
    phone: string
    bankName: string
    accountNumber: string
    invoiceType: "vat_special" | "vat_normal"
    notes?: string
    invoiceItems: InvoiceItem[]
  }) => void
  defaultValues?: {
    projectName?: string
    customerName?: string
    taxpayerIdNumber?: string
    address?: string
    phone?: string
    bankName?: string
    accountNumber?: string
    billingAmount?: number
  }
}

export function GroupBillingFormDialog({ open, onOpenChange, onSubmit, defaultValues }: GroupBillingFormDialogProps) {
  const [formData, setFormData] = useState<{
    projectName: string
    billingAmount: number
    customerName: string
    address: string
    taxpayerIdNumber: string
    phone: string
    bankName: string
    accountNumber: string
    invoiceType: "vat_special" | "vat_normal"
    notes: string
  }>({
    projectName: defaultValues?.projectName || "",
    billingAmount: defaultValues?.billingAmount || 0,
    customerName: defaultValues?.customerName || "",
    address: defaultValues?.address || "",
    taxpayerIdNumber: defaultValues?.taxpayerIdNumber || "",
    phone: defaultValues?.phone || "",
    bankName: defaultValues?.bankName || "",
    accountNumber: defaultValues?.accountNumber || "",
    invoiceType: "vat_special",
    notes: "",
  })

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      taxRate: 6,
      category: "",
      productName: "",
      model: "",
      unit: "",
      quantity: 1,
      amount: 0,
    },
  ])

  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: String(invoiceItems.length + 1),
        taxRate: 6,
        category: "",
        productName: "",
        model: "",
        unit: "",
        quantity: 1,
        amount: 0,
      },
    ])
  }

  const handleRemoveItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id))
  }

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(invoiceItems.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        // 自动计算金额
        if (field === "amount") {
          return updated
        }
        // 税额 = 金额 / (1 + 税率) * 税率
        if (field === "taxRate" && typeof value === "number") {
          const taxAmount = (updated.amount / (1 + value / 100)) * (value / 100)
          return updated
        }
        return updated
      }
      return item
    }))
  }

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (invoiceItems.some(item => !item.category || !item.productName)) {
      alert("请填写完整的发票信息")
      return
    }

    onSubmit({
      projectName: formData.projectName,
      billingAmount: calculateTotal(),
      customerName: formData.customerName,
      address: formData.address,
      taxpayerIdNumber: formData.taxpayerIdNumber,
      phone: formData.phone,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      invoiceType: formData.invoiceType,
      notes: formData.notes,
      invoiceItems,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>申请集团向客户开票</DialogTitle>
          <DialogDescription>填写集团开票申请信息</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">项目名称：</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="请输入项目名称"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAmount">开票金额：</Label>
                <Input
                  id="billingAmount"
                  type="number"
                  value={formData.billingAmount}
                  onChange={(e) => setFormData({ ...formData, billingAmount: Number(e.target.value) })}
                  placeholder="请输入开票金额"
                  required
                />
              </div>
            </div>
          </div>

          {/* 开票信息 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">开票信息</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="customerName">客户名称：</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="请输入客户名称"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">地址：</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="请输入地址"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxpayerIdNumber">纳税人识别号：</Label>
                <Input
                  id="taxpayerIdNumber"
                  value={formData.taxpayerIdNumber}
                  onChange={(e) => setFormData({ ...formData, taxpayerIdNumber: e.target.value })}
                  placeholder="请输入纳税人识别号"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">电话：</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="请输入电话"
                    required
                  />
                </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceType">发票类型：</Label>
                <Select value={formData.invoiceType} onValueChange={(value) => setFormData({ ...formData, invoiceType: value as "vat_special" | "vat_normal" })}>
                  <SelectTrigger id="invoiceType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vat_special">增值税专用发票</SelectItem>
                    <SelectItem value="vat_normal">增值税普通发票</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">开户行：</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="请输入开户行"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">账号：</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="请输入账号"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="notes">备注（可选）：</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="请输入备注信息"
              rows={3}
            />
          </div>

          {/* 发票信息 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">发票信息</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                添加发票项
              </Button>
            </div>
            <div className="space-y-3">
              {invoiceItems.map((item, index) => (
                <div key={item.id} className="rounded-lg border p-4 bg-muted/20">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">发票项 {index + 1}</h4>
                    {invoiceItems.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="space-y-2">
                      <Label>税率 *</Label>
                      <Select 
                        value={String(item.taxRate)} 
                        onValueChange={(value) => handleItemChange(item.id, "taxRate", Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label>商品类别 *</Label>
                      <Input
                        value={item.category}
                        onChange={(e) => handleItemChange(item.id, "category", e.target.value)}
                        placeholder="请输入商品类别"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>商品名称 *</Label>
                      <Input
                        value={item.productName}
                        onChange={(e) => handleItemChange(item.id, "productName", e.target.value)}
                        placeholder="请输入商品名称"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>规格型号</Label>
                      <Input
                        value={item.model}
                        onChange={(e) => handleItemChange(item.id, "model", e.target.value)}
                        placeholder="请输入规格型号"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>单位</Label>
                      <Input
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                        placeholder="请输入单位"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>数量 *</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                        placeholder="请输入数量"
                        required
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>金额（元）*</Label>
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleItemChange(item.id, "amount", Number(e.target.value))}
                        placeholder="请输入金额"
                        required
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">总金额（元）</p>
                <p className="text-2xl font-bold text-primary">
                  ¥{calculateTotal().toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              提交申请
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
