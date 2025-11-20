'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { api } from '@/lib/api'
import { socketClient } from '@/lib/socket'
import { getInitials } from '@/lib/utils'
import { User } from '@/types'
import {
  Home,
  Receipt,
  Users,
  MessageSquare,
  Building2,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
  ArrowLeftRight,
  ChevronDown,
  User as UserIcon,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.getCurrentUser()
        setUser(response.data)

        // Connect to WebSocket
        const token = localStorage.getItem('token')
        if (token) {
          socketClient.connect(token)

          // Listen for notifications
          socketClient.onNotification(() => {
            fetchNotificationCount()
          })
        }

        await fetchNotificationCount()
      } catch (error) {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()

    return () => {
      socketClient.disconnect()
    }
  }, [router])

  const fetchNotificationCount = async () => {
    try {
      const response = await api.getUnreadCount()
      setNotificationCount(response.data.count || 0)
    } catch (error) {
      console.error('Failed to fetch notification count')
    }
  }

  const handleLogout = () => {
    api.logout()
    socketClient.disconnect()
    router.push('/login')
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and insights'
    },
    {
      name: 'Bills',
      href: '/dashboard/bills',
      icon: Receipt,
      description: 'Manage your bills'
    },
    {
      name: 'Transactions',
      href: '/dashboard/transactions',
      icon: ArrowLeftRight,
      description: 'Payment history'
    },
    {
      name: 'Friends',
      href: '/dashboard/friends',
      icon: Users,
      description: 'Manage connections'
    },
    {
      name: 'Messages',
      href: '/dashboard/messages',
      icon: MessageSquare,
      description: 'Chat and notifications'
    },
    {
      name: 'Organizations',
      href: '/dashboard/organizations',
      icon: Building2,
      description: 'Business accounts'
    },
  ]

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mx-auto"></div>
              <Wallet className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Loading your dashboard...</p>
          </div>
        </div>
    )
  }

  if (!user) return null

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                onClick={() => setSidebarOpen(false)}
            />
        )}

        {/* Sidebar */}
        <aside
            className={cn(
                "fixed top-0 left-0 z-50 h-full w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200 shadow-xl",
                "transform transition-all duration-300 ease-out lg:translate-x-0",
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Bills Ledger
                </span>
                  <p className="text-xs text-gray-500">Financial Management</p>
                </div>
              </Link>
              <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden hover:bg-gray-100"
                  onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              <div className="mb-3">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Main Menu
                </p>
              </div>
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                            "hover:translate-x-1",
                            isActive
                                ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25'
                                : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                        )}
                        onClick={() => setSidebarOpen(false)}
                    >
                      <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          isActive
                              ? 'bg-white/20'
                              : 'bg-gray-100 group-hover:bg-gray-200'
                      )}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className={cn(
                            "text-xs truncate",
                            isActive ? 'text-white/80' : 'text-gray-500'
                        )}>
                          {item.description}
                        </p>
                      </div>
                    </Link>
                )
              })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-gray-200 bg-gray-50/50">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-gray-200">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link href="/dashboard/settings" className="block">
                    <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-gray-100 transition-colors"
                        size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                      size="sm"
                      onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-72">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden hover:bg-gray-100"
                    onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>

                {/* Breadcrumb or page title could go here */}
                <div className="hidden md:block">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {navigation.find(item => pathname.startsWith(item.href))?.name || 'Dashboard'}
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <Link href="/dashboard/notifications">
                  <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs font-bold shadow-lg animate-pulse"
                        >
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </Badge>
                    )}
                  </Button>
                </Link>

              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <p className="text-sm text-gray-500">
                  © {new Date().getFullYear()} Bills Ledger. All rights reserved.
                </p>
                <div className="flex items-center space-x-6">
                  <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    Privacy
                  </Link>
                  <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    Terms
                  </Link>
                  <Link href="/support" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    Support
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
  )
}
