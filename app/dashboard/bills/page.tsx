'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils'
import { Bill } from '@/types'
import {
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CircleDashed,
  LayoutGrid,
  List,
  SlidersHorizontal,
  FileText,
} from 'lucide-react'

type ViewMode = 'grid' | 'list'

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [filteredBills, setFilteredBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    fetchBills()
  }, [])

  useEffect(() => {
    filterBills()
  }, [bills, searchQuery, statusFilter, typeFilter])

  const fetchBills = async () => {
    try {
      const [billsResponse, userResponse] = await Promise.all([
        api.getBills(),
        api.getCurrentUser(),
      ])

      const billsData = Array.isArray(billsResponse?.data)
          ? billsResponse.data
          : (billsResponse?.data?.data?.bills ?? [])

      setBills(billsData)
      setCurrentUserId(userResponse?.data?.id || '')
    } catch (error) {
      console.error('Failed to fetch bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBills = () => {
    let filtered = [...bills]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
          (bill) =>
              bill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              bill.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              bill.creator.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((bill) => bill.status === statusFilter)
    }

    // Type filter (owed/owing)
    if (typeFilter !== 'all') {
      if (typeFilter === 'owed') {
        filtered = filtered.filter((bill) => bill.creatorId === currentUserId)
      } else if (typeFilter === 'owing') {
        filtered = filtered.filter((bill) => bill.creatorId !== currentUserId)
      }
    }

    setFilteredBills(filtered)
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      PAID: {
        variant: 'outline' as const,
        className: 'border-emerald-200 text-emerald-700 bg-emerald-50 font-medium',
        icon: CheckCircle2,
        label: 'Paid',
      },
      PENDING: {
        variant: 'outline' as const,
        className: 'border-amber-200 text-amber-700 bg-amber-50 font-medium',
        icon: Clock,
        label: 'Pending',
      },
      PARTIALLY_PAID: {
        variant: 'outline' as const,
        className: 'border-blue-200 text-blue-700 bg-blue-50 font-medium',
        icon: CircleDashed,
        label: 'Partially Paid',
      },
      OVERDUE: {
        variant: 'destructive' as const,
        className: 'font-medium',
        icon: AlertCircle,
        label: 'Overdue',
      },
      CANCELLED: {
        variant: 'outline' as const,
        className: 'border-gray-300 text-gray-600 bg-gray-50 font-medium',
        icon: XCircle,
        label: 'Cancelled',
      },
    }
    return configs[status as keyof typeof configs] || configs.PENDING
  }

  const stats = {
    total: bills.length,
    pending: bills.filter(b => b.status === 'PENDING').length,
    paid: bills.filter(b => b.status === 'PAID').length,
    overdue: bills.filter(b => b.status === 'OVERDUE').length,
    totalAmount: bills.reduce((sum, b) => sum + b.totalAmount, 0),
    owedToMe: bills.filter(b => b.creatorId === currentUserId).reduce((sum, b) => sum + b.totalAmount, 0),
    iOwe: bills.filter(b => b.creatorId !== currentUserId).reduce((sum, b) => sum + b.totalAmount, 0),
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mx-auto"></div>
              <Receipt className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Loading bills...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Bills
            </h1>
            <p className="text-muted-foreground mt-1">Manage all your bills and expenses</p>
          </div>
          <Link href="/dashboard/bills/create">
            <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-5 w-5 mr-2" />
              Create Bill
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Bills</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-900">Pending</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-900">Owed to Me</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">
                    {formatCurrency(stats.owedToMe)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-900">I Owe</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {formatCurrency(stats.iOwe)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-md">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg">Filters & Search</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search bills, descriptions, creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
              </div>
              <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Bills</option>
                <option value="owed">Owed to Me</option>
                <option value="owing">I Owe</option>
              </select>
            </div>
            {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredBills.length}</span> of <span className="font-semibold text-foreground">{bills.length}</span> bills
                  </p>
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('')
                        setStatusFilter('all')
                        setTypeFilter('all')
                      }}
                  >
                    Clear Filters
                  </Button>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Bills List */}
        {filteredBills.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? (
                        <Filter className="h-10 w-10 text-gray-400" />
                    ) : (
                        <Receipt className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'No bills found'
                        : 'No bills yet'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'Try adjusting your filters or search query to find what you\'re looking for'
                        : 'Create your first bill to start tracking your expenses and payments'}
                  </p>
                  {!(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                      <Link href="/dashboard/bills/create">
                        <Button size="lg">
                          <Plus className="h-5 w-5 mr-2" />
                          Create Your First Bill
                        </Button>
                      </Link>
                  )}
                </div>
              </CardContent>
            </Card>
        ) : viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBills.map((bill) => {
                const statusConfig = getStatusConfig(bill.status)
                const StatusIcon = statusConfig.icon
                const isOwedToMe = bill.creatorId === currentUserId

                return (
                    <Link key={bill.id} href={`/dashboard/bills/${bill.id}`}>
                      <Card className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full border-2 hover:border-primary/50">
                        <CardHeader className="border-b bg-gradient-to-br from-gray-50 to-white pb-4">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                                {bill.title}
                              </CardTitle>
                            </div>
                            <Badge variant={statusConfig.variant} className={statusConfig.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          {bill.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {bill.description}
                              </p>
                          )}
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {formatCurrency(bill.totalAmount, bill.currency)}
                                </p>
                              </div>
                              <div className={cn(
                                  "h-12 w-12 rounded-full flex items-center justify-center",
                                  isOwedToMe ? "bg-emerald-100" : "bg-red-100"
                              )}>
                                {isOwedToMe ? (
                                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                                ) : (
                                    <TrendingDown className="h-6 w-6 text-red-600" />
                                )}
                              </div>
                            </div>

                            <div className="space-y-2.5">
                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Users className="h-4 w-4" />
                                  <span>{bill.participants.length} participant{bill.participants.length !== 1 ? 's' : ''}</span>
                                </div>
                              </div>

                              {bill.dueDate && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Due {formatDate(bill.dueDate)}</span>
                                  </div>
                              )}
                            </div>

                            <div className="pt-4 border-t flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={bill.creator.avatar} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(bill.creator.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {bill.creator.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Created {formatDate(bill.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                )
              })}
            </div>
        ) : (
            <Card className="shadow-md">
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredBills.map((bill) => {
                    const statusConfig = getStatusConfig(bill.status)
                    const StatusIcon = statusConfig.icon
                    const isOwedToMe = bill.creatorId === currentUserId

                    return (
                        <Link key={bill.id} href={`/dashboard/bills/${bill.id}`}>
                          <div className="p-6 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                  "h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0",
                                  isOwedToMe ? "bg-emerald-100" : "bg-red-100"
                              )}>
                                <FileText className={cn(
                                    "h-7 w-7",
                                    isOwedToMe ? "text-emerald-600" : "text-red-600"
                                )} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors truncate">
                                    {bill.title}
                                  </h3>
                                  <Badge variant={statusConfig.variant} className={statusConfig.className}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                </div>
                                {bill.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                      {bill.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={bill.creator.avatar} />
                                <AvatarFallback className="text-[8px]">
                                  {getInitials(bill.creator.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              {bill.creator.fullName}
                            </span>
                                  <span className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                                    {bill.participants.length}
                            </span>
                                  {bill.dueDate && (
                                      <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                        {formatDate(bill.dueDate)}
                              </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <p className="text-2xl font-bold text-gray-900">
                                  {formatCurrency(bill.totalAmount, bill.currency)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {isOwedToMe ? 'Owed to you' : 'You owe'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
        )}
      </div>
  )
}
