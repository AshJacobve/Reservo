'use client'

import { RoleProtectedRoute } from '@/components/role-protected-route'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RoleProtectedRoute allowedRoles={['admin']} redirectTo="/">
      {children}
    </RoleProtectedRoute>
  )
}
