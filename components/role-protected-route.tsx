'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/user/context/AuthContext'

type UserRole = 'admin' | 'user'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

export function RoleProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/' 
}: RoleProtectedRouteProps) {
  const { user, loading, userRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // If no user is logged in, redirect to login
      if (!user) {
        router.push('/login')
        return
      }

      // If user doesn't have the required role, redirect
      if (userRole && !allowedRoles.includes(userRole)) {
        router.push(redirectTo)
        return
      }
    }
  }, [user, loading, userRole, router, allowedRoles, redirectTo])

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user or wrong role, don't render children (will redirect in useEffect)
  if (!user || (userRole && !allowedRoles.includes(userRole))) {
    return null
  }

  // User is authenticated and has correct role
  return <>{children}</>
}
