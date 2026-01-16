export type UserRole = "customer_manager" | "finance" | "business_support" | "admin" | "department_leader"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Project {
  id: string
  name: string
  customerName: string
  managerId: string
  status: "active" | "completed"
  createdAt: string
}

export type InvoiceStatus =
  | "draft"
  | "pending_dept_leader_approval"
  | "pending_finance_approval"
  | "approved"
  | "rejected"
  | "pending_upload"
  | "submitted_to_customer"
  | "pending_customer_confirmation"
  | "completed"
  | "settled"
  | "group_billing_pending"
  | "group_billing_reviewed"

export interface InvoiceItem {
  id: string
  invoiceType: string
  serviceEquipmentType: string
  taxRate: number
  amount: number
  taxAmount: number
  amountWithoutTax: number
}

export interface Invoice {
  id: string
  projectId: string
  projectName?: string
  customerName?: string
  invoiceNumber?: string
  amount: number
  status: InvoiceStatus
  submittedBy: string
  submittedByName?: string
  invoiceFileUrl?: string
  contractFileUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
  // New detailed fields
  applicant?: string
  applicationType?: string
  contractCode?: string
  contractName?: string
  projectCode?: string
  contractRevenue?: number
  appliedInvoiceAmount?: number
  mainRevenue?: number
  industryType?: string
  taxpayerIdNumber?: string
  isRevenueListed?: boolean
  invoiceNotes?: string
  attachments?: string[]
  invoiceItems?: InvoiceItem[]
  // Uploaded invoice fields
  uploadedInvoiceNumber?: string
  uploadedInvoiceDate?: string
  uploadedInvoiceFileUrl?: string
  uploadedBy?: string
  uploadedByName?: string
  uploadedAt?: string
  uploadNotes?: string
  // Group billing fields
  groupBillingData?: {
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
    invoiceItems: any[]
  }
}

export interface InvoiceApproval {
  id: string
  invoiceId: string
  approverId: string
  approverName?: string
  action: "approved" | "rejected"
  notes?: string
  createdAt: string
}

export type PaymentStatus = "pending" | "confirmed" | "reconciled"

export interface Payment {
  id: string
  invoiceId: string
  invoiceNumber?: string
  amount: number
  paymentDate: string
  status: PaymentStatus
  bankReference?: string
  confirmedBy?: string
  notes?: string
  createdAt: string
}

export type TodoType = "invoice_approval" | "invoice_upload" | "payment_confirmation"

export type TodoStatus = "pending" | "in_progress" | "approved" | "rejected" | "delegated"

export interface TodoItem {
  id: string
  type: TodoType
  title: string
  description: string
  relatedId: string // invoiceId or paymentId
  relatedData?: Invoice | Payment
  priority: "high" | "medium" | "low"
  status: TodoStatus
  processName: string // 流程名称
  initiator: string // 发起人ID
  initiatorName?: string // 发起人姓名
  assignee: string // 当前处理人ID
  assigneeName?: string // 当前处理人姓名
  delegatedBy?: string // 委托人ID
  delegatedByName?: string // 委托人姓名
  createdAt: string
  dueDate?: string
}
