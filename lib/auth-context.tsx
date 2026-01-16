"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, mockUsers } from "./mock-data"

interface AuthContextType {
  user: User | null
  login: (email: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 从localStorage加载用户信息，如果没有则默认使用第一个用户
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // 默认使用第一个用户（客户经理）
      const defaultUser = mockUsers[0]
      setUser(defaultUser)
      localStorage.setItem("currentUser", JSON.stringify(defaultUser))
    }
    setIsLoading(false)
  }, [])

  const login = (email: string) => {
    const foundUser = mockUsers.find((u) => u.email === email)
    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
