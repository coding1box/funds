"use client"

import { useAuth } from "@/lib/auth-context"
import { mockUsers } from "@/lib/mock-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from "lucide-react"

export function RoleSwitcher() {
  const { user, login } = useAuth()

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "customer_manager":
        return "客户经理"
      case "department_leader":
        return "部门领导"
      case "project_manager":
        return "项目经理"
      case "finance":
        return "财务部"
      case "business_support":
        return "商务支持中心"
      case "admin":
        return "管理员"
      default:
        return role
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-2">
      <User className="h-4 w-4 text-muted-foreground" />
      <Select value={user.email} onValueChange={(email) => login(email)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {mockUsers.map((mockUser) => (
            <SelectItem key={mockUser.id} value={mockUser.email}>
              {mockUser.name} - {getRoleLabel(mockUser.role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
