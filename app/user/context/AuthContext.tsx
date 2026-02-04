'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { monitorAuthState } from '../../../public/snippets/front-end-auth-functions'
import { User } from 'firebase/auth'
import { db } from '@/public/firebaseWebConfig'
import { doc, getDoc } from 'firebase/firestore'

type UserRole = 'admin' | 'user'

interface AuthContextType {
  user: User | null
  loading: boolean
  userRole: UserRole | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
})

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    const unsubscribe = monitorAuthState(async (currentUser: User | null) => {
      setUser(currentUser)
      
      // Fetch user role from Firestore
      if (currentUser?.email) {
        try {
          const userDocRef = doc(db, 'users', currentUser.email)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUserRole(userData.role || 'user')
          } else {
            console.warn('User document not found in Firestore:', currentUser.email)
            setUserRole('user') // Default to user role
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
          setUserRole('user') // Default to user role on error
        }
      } else {
        setUserRole(null)
      }
      
      setLoading(false)
    })
    return () => unsubscribe?.()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, userRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)