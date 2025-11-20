'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { BillSummary, Bill, Transaction } from '@/types'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  ArrowRight,
  Plus,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Activity,
  AlertCircle,
  Calendar,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [summary, setSummary] = useState<BillSummary | null>(null)
  const [recentBills, setRecentBills] = useState<Bill[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, billsRes, transactionsRes, meRes] = await Promise.all([
        api.getBillSummary(),
        api.getBills(),
        api.getTransactions({ limit: 5 }),
        api.getCurrentUser(),
      ])

      setSummary(summaryRes.data)

      const bills = Array.isArray(billsRes?.data) ? billsRes.data : (billsRes?.data?.data?.bills ?? [])
      setRecentBills((bills || []).slice(0, 5))

      const tx =
          transactionsRes?.data?.data?.transactions ??
          transactionsRes?.data?.transactions ??
          transactionsRes?.data ??
          []
      setRecentTransactions((Array.isArray(tx) ? tx : []).slice(0, 5))

      setCurrentUserId(meRes?.data?.id || '')
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBillStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase()
    const statusConfig = {
      PAID: {
        variant: 'outline' as const,
        className: 'border-emerald-200 text-emerald-700 bg-emerald-50 font-medium',
        label: 'Paid'
      },
      PENDING: {
        variant: 'outline' as const,
        className: 'border-amber-200 text-amber-700 bg-amber-50 font-medium',
        label: 'Pending'
      },
      OVERDUE: {
        variant: 'destructive' as const,
        className: 'font-medium',
        label: 'Overdue'
      },
    }

    const config = statusConfig[s as keyof typeof statusConfig]
    if (!config) return <Badge variant="secondary">{status || 'Unknown'}</Badge>

    return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
    )
  }

  const getTxStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase()
    const statusConfig = {
      COMPLETED: {
        variant: 'outline' as const,
        className: 'border-emerald-200 text-emerald-700 bg-emerald-50',
        label: 'Completed'
      },
      PENDING: {
        variant: 'outline' as const,
        className: 'border-amber-200 text-amber-700 bg-amber-50',
        label: 'Pending'
      },
      FAILED: {
        variant: 'destructive' as const,
        className: '',
        label: 'Failed'
      },
      CANCELLED: {
        variant: 'outline' as const,
        className: 'border-gray-300 text-gray-700 bg-gray-50',
        label: 'Cancelled'
      },
    }

    const config = statusConfig[s as keyof typeof statusConfig]
    if (!config) return <Badge variant="secondary">{status || 'Unknown'}</Badge>

    return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
    )
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mx-auto"></div>
              <Activity className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Loading your dashboard...</p>
          </div>
        </div>
    )
  }

  const netBalance = summary?.netBalance || 0
  const isPositiveBalance = netBalance >= 0

  return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
          </div>
          <Link href="/dashboard/bills/create">
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-5 w-5 mr-2" />
              Create Bill
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Owed to You */}
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-900">Total Owed to You</CardTitle>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {formatCurrency(summary?.totalOwed || 0)}
              </div>
              <p className="text-xs text-emerald-700 mt-2 flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                Money you're owed
              </p>
            </CardContent>
          </Card>

          {/* Total You Owe */}
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-red-900">Total You Owe</CardTitle>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {formatCurrency(summary?.totalOwing || 0)}
              </div>
              <p className="text-xs text-red-700 mt-2 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Money you owe
              </p>
            </CardContent>
          </Card>

          {/* Net Balance */}
          <Card className={cn(
              "border-2 hover:shadow-lg transition-all duration-300",
              isPositiveBalance
                  ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white"
                  : "border-red-300 bg-gradient-to-br from-red-50 to-white"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn(
                  "text-sm font-semibold",
                  isPositiveBalance ? "text-emerald-900" : "text-red-900"
              )}>
                Net Balance
              </CardTitle>
              <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  isPositiveBalance ? "bg-emerald-100" : "bg-red-100"
              )}>
                <Wallet className={cn(
                    "h-5 w-5",
                    isPositiveBalance ? "text-emerald-600" : "text-red-600"
                )} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn(
                  "text-3xl font-bold",
                  isPositiveBalance ? "text-emerald-600" : "text-red-600"
              )}>
                {formatCurrency(netBalance)}
              </div>
              <p className={cn(
                  "text-xs mt-2 flex items-center",
                  isPositiveBalance ? "text-emerald-700" : "text-red-700"
              )}>
                <Activity className="h-3 w-3 mr-1" />
                {isPositiveBalance ? 'Positive balance' : 'Negative balance'}
              </p>
            </CardContent>
          </Card>

          {/* Pending Bills */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-amber-900">Pending Bills</CardTitle>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{summary?.pendingBills || 0}</div>
              <p className="text-xs text-amber-700 mt-2 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Bills */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Recent Bills</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Your latest bill activity</p>
                  </div>
                </div>
                <Link href="/dashboard/bills">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {recentBills.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Receipt className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">No bills yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create your first bill to get started!</p>
                    <Link href="/dashboard/bills/create">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Bill
                      </Button>
                    </Link>
                  </div>
              ) : (
                  <div className="space-y-3">
                    {recentBills.map((bill) => (
                        <Link key={bill.id} href={`/dashboard/bills/${bill.id}`}>
                          <div className="group p-4 border border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 bg-white">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                                    {bill.title}
                                  </h3>
                                  {getBillStatusBadge(bill.status)}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Avatar className="h-4 w-4 mr-1.5">
                                <AvatarImage src={bill.creator.avatar} />
                                <AvatarFallback className="text-[8px]">
                                  {getInitials(bill.creator.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              {bill.creator.fullName}
                            </span>
                                  {bill.dueDate && (
                                      <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                        {formatDate(bill.dueDate)}
                              </span>
                                  )}
                                  <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                                    {bill.participants.length}
                            </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-gray-900">
                                  {formatCurrency(bill.totalAmount, bill.currency)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                    ))}
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Recent Transactions</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Your latest payment activity</p>
                  </div>
                </div>
                <Link href="/dashboard/transactions">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {recentTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">No transactions yet</h3>
                    <p className="text-sm text-muted-foreground">Your payment history will appear here</p>
                  </div>
              ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((t) => {
                      const isSender = currentUserId ? t.senderId === currentUserId : null
                      const other = isSender === null
                          ? (t.receiver || t.sender)
                          : isSender
                              ? t.receiver
                              : t.sender

                      const amountSign = isSender === null ? '' : isSender ? '-' : '+'
                      const amountClass = isSender === null
                          ? 'text-foreground'
                          : isSender
                              ? 'text-red-600'
                              : 'text-emerald-600'

                      const directionBg = isSender === null
                          ? 'bg-gray-100'
                          : isSender
                              ? 'bg-red-100'
                              : 'bg-emerald-100'

                      const directionIcon = isSender === null
                          ? 'text-gray-600'
                          : isSender
                              ? 'text-red-600'
                              : 'text-emerald-600'

                      return (
                          <div
                              key={t.id}
                              className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all bg-white"
                          >
                            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0", directionBg)}>
                              {isSender === null ? (
                                  <ArrowRight className={cn("h-5 w-5", directionIcon)} />
                              ) : isSender ? (
                                  <ArrowUpRight className={cn("h-5 w-5", directionIcon)} />
                              ) : (
                                  <ArrowDownLeft className={cn("h-5 w-5", directionIcon)} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={other?.avatar} />
                                  <AvatarFallback className="text-[10px]">
                                    {getInitials(other?.fullName || 'Unknown')}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="font-semibold text-sm text-gray-900 truncate">
                                  {other?.fullName || 'Unknown'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">
                            {(t.type || '').replace(/_/g, ' ').toLowerCase()}
                          </span>
                                <span>•</span>
                                <span>{formatDate(t.createdAt)}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={cn("text-lg font-bold", amountClass)}>
                                {amountSign}{formatCurrency(t.amount, t.currency)}
                              </p>
                              <div className="mt-1">
                                {getTxStatusBadge(t.status)}
                              </div>
                            </div>
                          </div>
                      )
                    })}
                  </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-md border-2 border-dashed border-gray-300 hover:border-primary hover:shadow-lg transition-all">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Need help getting started?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first bill or explore our features to manage your finances better
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/dashboard/bills/create">
                  <Button variant="default">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bill
                  </Button>
                </Link>
                <Link href="/dashboard/friends">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Add Friends
                  </Button>
                </Link>
                <Link href="/dashboard/organizations">
                  <Button variant="outline">
                    <Receipt className="h-4 w-4 mr-2" />
                    Join Organization
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
