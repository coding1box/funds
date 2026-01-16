import type { User, Project, Invoice, Payment, InvoiceApproval } from "./types"

export interface Contract {
  id: string
  code: string
  name: string
  projectCode: string
  projectName: string
  projectId: string
  customerName: string
  contractRevenue: number
  mainRevenue: number
  appliedInvoiceAmount: number
}

// 模拟用户数据
export const mockUsers: User[] = [
  { id: "1", email: "manager1@company.com", name: "张", role: "customer_manager" },
  { id: "2", email: "manager2@company.com", name: "李", role: "customer_manager" },
  { id: "3", email: "dept_leader@company.com", name: "刘", role: "department_leader" },
  { id: "5", email: "finance@company.com", name: "王", role: "finance" },
  { id: "6", email: "support@company.com", name: "赵", role: "business_support" },
]

// 模拟项目数据
export const mockProjects: Project[] = [
  { id: "p1", name: "项目A", customerName: "ABC公司", managerId: "1", status: "active", createdAt: "2024-01-01" },
  { id: "p2", name: "项目B", customerName: "XYZ集团", managerId: "1", status: "active", createdAt: "2024-01-15" },
  { id: "p3", name: "项目C", customerName: "测试企业", managerId: "2", status: "active", createdAt: "2024-02-01" },
]

// 模拟合同数据
export const mockContracts: Contract[] = [
  {
    id: "c1",
    code: "CT-2024-001",
    name: "ABC公司软件开发合同",
    projectCode: "PRJ-2024-001",
    projectName: "项目A",
    projectId: "p1",
    customerName: "ABC公司",
    contractRevenue: 1000000,
    mainRevenue: 800000,
    appliedInvoiceAmount: 500000,
  },
  {
    id: "c2",
    code: "CT-2024-002",
    name: "XYZ集团系统集成项目",
    projectCode: "PRJ-2024-002",
    projectName: "项目B",
    projectId: "p2",
    customerName: "XYZ集团",
    contractRevenue: 800000,
    mainRevenue: 600000,
    appliedInvoiceAmount: 300000,
  },
  {
    id: "c3",
    code: "CT-2024-003",
    name: "测试企业数字化转型项目",
    projectCode: "PRJ-2024-003",
    projectName: "项目C",
    projectId: "p3",
    customerName: "测试企业",
    contractRevenue: 1500000,
    mainRevenue: 1200000,
    appliedInvoiceAmount: 700000,
  },
]

// 从localStorage加载数据或使用默认数据
export function loadInvoices(): Invoice[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("invoices")
  if (stored) {
    return JSON.parse(stored)
  }
  const defaultInvoices: Invoice[] = [
    // 流程1：普通开票 - 待部门领导审批
    {
      id: "inv1",
      projectId: "p1",
      projectName: "项目A",
      customerName: "ABC公司",
      invoiceNumber: "INV-2024-001",
      amount: 500000,
      status: "pending_dept_leader_approval",
      submittedBy: "1",
      submittedByName: "张经理",
      notes: "第一期款项",
      createdAt: "2024-03-01T10:00:00Z",
      updatedAt: "2024-03-01T10:00:00Z",
      applicant: "张经理",
      applicationType: "normal",
      contractCode: "CT-2024-001",
      contractName: "ABC公司软件开发合同",
      projectCode: "PRJ-2024-001",
      contractRevenue: 1000000,
      appliedInvoiceAmount: 0,
      mainRevenue: 500000,
      industryType: "软件和信息技术服务业",
      taxpayerIdNumber: "91110000MA01234567",
      isRevenueListed: true,
      invoiceNotes: "请按合同约定开具增值税专用发票",
      invoiceItems: [
        {
          id: "item1",
          invoiceType: "增值税专用发票",
          serviceEquipmentType: "软件开发服务",
          taxRate: 0.06,
          amountWithoutTax: 471698.11,
          taxAmount: 28301.89,
          amount: 500000,
        },
      ],
    },
    // 流程2：普通开票 - 待财务审批（已通过部门领导审批）
    {
      id: "inv2",
      projectId: "p2",
      projectName: "项目B",
      customerName: "XYZ集团",
      invoiceNumber: "INV-2024-002",
      amount: 300000,
      status: "pending_finance_approval",
      submittedBy: "1",
      submittedByName: "张经理",
      notes: "项目启动费用",
      createdAt: "2024-02-15T14:30:00Z",
      updatedAt: "2024-02-20T09:15:00Z",
      applicant: "张经理",
      applicationType: "normal",
      contractCode: "CT-2024-002",
      contractName: "XYZ集团系统集成项目",
      projectCode: "PRJ-2024-002",
      contractRevenue: 800000,
      appliedInvoiceAmount: 0,
      mainRevenue: 300000,
      industryType: "信息系统集成服务",
      taxpayerIdNumber: "91110000MA98765432",
      isRevenueListed: false,
      invoiceItems: [
        {
          id: "item2",
          invoiceType: "增值税专用发票",
          serviceEquipmentType: "系统集成服务",
          taxRate: 0.06,
          amountWithoutTax: 283018.87,
          taxAmount: 16981.13,
          amount: 300000,
        },
      ],
    },
    // 流程3：普通开票 - 财务已审批，待上传发票
    {
      id: "inv3",
      projectId: "p3",
      projectName: "项目C",
      customerName: "测试企业",
      invoiceNumber: "INV-2024-003",
      amount: 800000,
      status: "approved",
      submittedBy: "2",
      submittedByName: "李经理",
      notes: "项目尾款",
      createdAt: "2024-03-05T14:00:00Z",
      updatedAt: "2024-03-06T10:00:00Z",
      applicant: "李经理",
      applicationType: "urgent",
      contractCode: "CT-2024-003",
      contractName: "测试企业数字化转型项目",
      projectCode: "PRJ-2024-003",
      contractRevenue: 1500000,
      appliedInvoiceAmount: 700000,
      mainRevenue: 800000,
      industryType: "信息技术咨询服务",
      taxpayerIdNumber: "91110000MA11223344",
      isRevenueListed: true,
      invoiceNotes: "紧急开票，请优先处理",
      invoiceItems: [
        {
          id: "item3-1",
          invoiceType: "增值税专用发票",
          serviceEquipmentType: "技术咨询服务",
          taxRate: 0.06,
          amountWithoutTax: 471698.11,
          taxAmount: 28301.89,
          amount: 500000,
        },
        {
          id: "item3-2",
          invoiceType: "增值税专用发票",
          serviceEquipmentType: "软件实施服务",
          taxRate: 0.06,
          amountWithoutTax: 283018.87,
          taxAmount: 16981.13,
          amount: 300000,
        },
      ],
    },
    // 流程4：普通开票 - 财务已上传发票，待客户确认
    {
      id: "inv4",
      projectId: "p1",
      projectName: "项目A",
      customerName: "ABC公司",
      invoiceNumber: "INV-2024-004",
      amount: 600000,
      status: "pending_customer_confirmation",
      submittedBy: "1",
      submittedByName: "张经理",
      notes: "第二期款项",
      createdAt: "2024-03-10T09:00:00Z",
      updatedAt: "2024-03-12T14:00:00Z",
      applicant: "张经理",
      applicationType: "normal",
      contractCode: "CT-2024-001",
      contractName: "ABC公司软件开发合同",
      projectCode: "PRJ-2024-001",
      contractRevenue: 1000000,
      appliedInvoiceAmount: 500000,
      mainRevenue: 600000,
      industryType: "软件和信息技术服务业",
      taxpayerIdNumber: "91110000MA01234567",
      isRevenueListed: true,
      invoiceNotes: "请按合同约定开具增值税专用发票",
      invoiceItems: [
        {
          id: "item4",
          invoiceType: "增值税专用发票",
          serviceEquipmentType: "软件开发服务",
          taxRate: 0.06,
          amountWithoutTax: 566037.74,
          taxAmount: 33962.26,
          amount: 600000,
        },
      ],
      // 财务已上传的发票信息
      uploadedInvoiceNumber: "00456789",
      uploadedInvoiceDate: "2024-03-12",
      uploadedInvoiceFileUrl: "/invoices/INV-2024-004.pdf",
      uploadedBy: "5",
      uploadedByName: "王财务",
      uploadedAt: "2024-03-12T14:00:00Z",
      uploadNotes: "已开具增值税专用发票，请查收",
    },
    // 流程5：普通开票 - 已办结（等待回款）
    {
      id: "inv5",
      projectId: "p2",
      projectName: "项目B",
      customerName: "XYZ集团",
      invoiceNumber: "INV-2024-005",
      amount: 400000,
      status: "settled",
      submittedBy: "1",
      submittedByName: "张经理",
      notes: "系统维护费用",
      createdAt: "2024-03-08T10:00:00Z",
      updatedAt: "2024-03-14T16:00:00Z",
      applicant: "张经理",
      applicationType: "normal",
      contractCode: "CT-2024-002",
      contractName: "XYZ集团系统集成项目",
      projectCode: "PRJ-2024-002",
      contractRevenue: 800000,
      appliedInvoiceAmount: 300000,
      mainRevenue: 400000,
      industryType: "信息系统集成服务",
      taxpayerIdNumber: "91110000MA98765432",
      isRevenueListed: false,
      invoiceItems: [
        {
          id: "item5",
          invoiceType: "增值税专用发票",
          serviceEquipmentType: "系统集成服务",
          taxRate: 0.06,
          amountWithoutTax: 377358.49,
          taxAmount: 22641.51,
          amount: 400000,
        },
      ],
      uploadedInvoiceNumber: "00456790",
      uploadedInvoiceDate: "2024-03-14",
      uploadedInvoiceFileUrl: "/invoices/INV-2024-005.pdf",
      uploadedBy: "5",
      uploadedByName: "王财务",
      uploadedAt: "2024-03-14T11:00:00Z",
    },
    // 流程6：集团开票 - 集团开票待审核
    {
      id: "inv6",
      projectId: "p3",
      projectName: "项目C",
      customerName: "测试企业",
      invoiceNumber: "INV-2024-006",
      amount: 1200000,
      status: "group_billing_pending",
      submittedBy: "2",
      submittedByName: "李经理",
      notes: "集团统一开票",
      createdAt: "2024-03-15T09:00:00Z",
      updatedAt: "2024-03-15T09:00:00Z",
      applicant: "李经理",
      applicationType: "normal",
      contractCode: "CT-2024-003",
      contractName: "测试企业数字化转型项目",
      projectCode: "PRJ-2024-003",
      contractRevenue: 1500000,
      appliedInvoiceAmount: 800000,
      mainRevenue: 1200000,
      industryType: "信息技术咨询服务",
      taxpayerIdNumber: "91110000MA11223344",
      isRevenueListed: true,
      invoiceNotes: "申请集团统一开票",
      invoiceItems: [
        {
          id: "item6-1",
          invoiceType: "增值税专用发票",
          serviceEquipmentType: "技术咨询服务",
          taxRate: 0.06,
          amountWithoutTax: 566037.74,
          taxAmount: 33962.26,
          amount: 600000,
        },
        {
          id: "item6-2",
          invoiceType: "增值税专用发票",
          serviceEquipmentType: "软件实施服务",
          taxRate: 0.06,
          amountWithoutTax: 566037.74,
          taxAmount: 33962.26,
          amount: 600000,
        },
      ],
    },
    // 流程7：集团开票 - 集团开票已审核，商务支撑上传后待客户确认
    {
      id: "inv7",
      projectId: "p1",
      projectName: "项目A",
      customerName: "ABC公司",
      invoiceNumber: "INV-2024-007",
      amount: 900000,
      status: "pending_customer_confirmation",
      submittedBy: "1",
      submittedByName: "张经理",
      notes: "集团开票申请",
      createdAt: "2024-03-12T10:00:00Z",
      updatedAt: "2024-03-16T14:00:00Z",
      applicant: "张经理",
      applicationType: "normal",
      contractCode: "CT-2024-001",
      contractName: "ABC公司软件开发合同",
      projectCode: "PRJ-2024-001",
      contractRevenue: 1000000,
      appliedInvoiceAmount: 1100000,
      mainRevenue: 900000,
      industryType: "软件和信息技术服务业",
      taxpayerIdNumber: "91110000MA01234567",
      isRevenueListed: true,
      invoiceNotes: "集团统一开票，已通过审核",
      invoiceItems: [
        {
          id: "item7",
          invoiceType: "增值税专用发票",
          serviceEquipmentType: "软件开发服务",
          taxRate: 0.06,
          amountWithoutTax: 849056.60,
          taxAmount: 50943.40,
          amount: 900000,
        },
      ],
      uploadedInvoiceNumber: "GROUP-00456791",
      uploadedInvoiceDate: "2024-03-16",
      uploadedInvoiceFileUrl: "/invoices/INV-2024-007.pdf",
      uploadedBy: "6",
      uploadedByName: "赵商务",
      uploadedAt: "2024-03-16T14:00:00Z",
      uploadNotes: "集团已开具发票",
    },
  ]
  localStorage.setItem("invoices", JSON.stringify(defaultInvoices))
  return defaultInvoices
}

export function saveInvoices(invoices: Invoice[]) {
  localStorage.setItem("invoices", JSON.stringify(invoices))
}

export function loadPayments(): Payment[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("payments")
  if (stored) {
    return JSON.parse(stored)
  }
  const defaultPayments: Payment[] = [
    // 回款1：商务支撑登记，待财务确认
    {
      id: "pay1",
      invoiceId: "inv2",
      invoiceNumber: "INV-2024-002",
      amount: 300000,
      paymentDate: "2024-03-10",
      status: "pending",
      bankReference: "TXN202403100001",
      notes: "集团资金系统查到流水，已启动内部付款流程",
      createdAt: "2024-03-10T16:00:00Z",
    },
    // 回款2：财务已确认，待对账
    {
      id: "pay2",
      invoiceId: "inv5",
      invoiceNumber: "INV-2024-005",
      amount: 400000,
      paymentDate: "2024-03-15",
      status: "confirmed",
      bankReference: "TXN202403150001",
      notes: "商务支撑登记，财务已确认到账",
      confirmedBy: "5",
      createdAt: "2024-03-15T10:00:00Z",
    },
    // 回款3：已完成对账
    {
      id: "pay3",
      invoiceId: "inv4",
      invoiceNumber: "INV-2024-004",
      amount: 600000,
      paymentDate: "2024-03-13",
      status: "reconciled",
      bankReference: "TXN202403130001",
      notes: "客户直接付款，已完成对账",
      confirmedBy: "5",
      createdAt: "2024-03-13T14:00:00Z",
    },
  ]
  localStorage.setItem("payments", JSON.stringify(defaultPayments))
  return defaultPayments
}

export function savePayments(payments: Payment[]) {
  localStorage.setItem("payments", JSON.stringify(payments))
}

export function loadApprovals(): InvoiceApproval[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("approvals")
  return stored ? JSON.parse(stored) : []
}

export function saveApprovals(approvals: InvoiceApproval[]) {
  localStorage.setItem("approvals", JSON.stringify(approvals))
}
