-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'customer_manager', 'finance', 'business_support', 'admin'
  created_at TIMESTAMP DEFAULT NOW()
);

-- 项目表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  manager_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 发票表
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  invoice_number VARCHAR(100),
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'draft', 'pending_approval', 'approved', 'rejected', 'submitted_to_customer'
  submitted_by UUID REFERENCES users(id),
  invoice_file_url TEXT,
  contract_file_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 发票审批记录表
CREATE TABLE invoice_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  approver_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'approved', 'rejected'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 回款记录表
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'pending', 'confirmed', 'reconciled'
  bank_reference VARCHAR(255),
  confirmed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
