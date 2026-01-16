"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { mockUsers } from "@/lib/mock-data"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email)
  }

  const quickLogin = (userEmail: string) => {
    login(userEmail)
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold text-balance">发票与回款管理平台</CardTitle>
        <CardDescription className="text-balance">请选择角色登录系统</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            登录
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">快速登录演示</span>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {mockUsers.map((user) => (
              <Button key={user.id} variant="outline" onClick={() => quickLogin(user.email)} className="justify-start">
                <span className="font-medium">{user.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({user.role === "customer_manager" && "客户经理"}
                  {user.role === "finance" && "财务部"}
                  {user.role === "business_support" && "商务支持"})
                </span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
