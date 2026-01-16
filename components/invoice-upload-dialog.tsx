"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CalendarIcon, Upload } from "lucide-react"

interface InvoiceUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    uploadedInvoiceNumber: string
    uploadedInvoiceDate: string
    uploadedInvoiceFileUrl?: string
    uploadNotes?: string
  }) => void
}

export function InvoiceUploadDialog({ open, onOpenChange, onSubmit }: InvoiceUploadDialogProps) {
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState<Date>()
  const [notes, setNotes] = useState("")
  const [fileName, setFileName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invoiceNumber || !invoiceDate) {
      return
    }

    onSubmit({
      uploadedInvoiceNumber: invoiceNumber,
      uploadedInvoiceDate: invoiceDate.toISOString(),
      uploadedInvoiceFileUrl: fileName ? `/uploads/${fileName}` : undefined,
      uploadNotes: notes || undefined,
    })

    // Reset form
    setInvoiceNumber("")
    setInvoiceDate(undefined)
    setNotes("")
    setFileName("")
    onOpenChange(false)
  }

  const handleFileSelect = () => {
    // Simulate file selection
    const mockFileName = `invoice_${Date.now()}.pdf`
    setFileName(mockFileName)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>上传已开发票</DialogTitle>
          <DialogDescription>
            请填写已开发票的信息并上传发票文件
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* 发票号 */}
            <div className="space-y-2">
              <Label htmlFor="invoice-number">
                发票号 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invoice-number"
                placeholder="请输入发票号"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
              />
            </div>

            {/* 开票日期 */}
            <div className="space-y-2">
              <Label>
                开票日期 <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceDate ? format(invoiceDate, "PPP", { locale: zhCN }) : "请选择日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={setInvoiceDate}
                    initialFocus
                    locale={zhCN}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 发票文件 */}
            <div className="space-y-2">
              <Label>发票文件</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleFileSelect}>
                  <Upload className="mr-2 h-4 w-4" />
                  选择文件
                </Button>
                {fileName && (
                  <span className="text-sm text-muted-foreground">{fileName}</span>
                )}
                {!fileName && (
                  <span className="text-sm text-muted-foreground">支持 PDF、图片格式，最大 10MB</span>
                )}
              </div>
            </div>

            {/* 备注 */}
            <div className="space-y-2">
              <Label htmlFor="upload-notes">备注</Label>
              <Textarea
                id="upload-notes"
                placeholder="请输入备注信息（可选）"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              提交
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

