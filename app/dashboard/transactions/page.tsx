'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime, getInitials, cn } from '@/lib/utils'
import { Transaction, TransactionStats } from '@/types'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  TrendingUp,
  Wallet,
  Receipt,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Activity,
  DollarSign,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react'

type ViewMode = 'cards' | 'table'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    fetchTransactions()
    fetchStats()
  }, [typeFilter, statusFilter])

  const fetchCurrentUser = async () => {
    try {
      const response = await api.getCurrentUser()
      setCurrentUserId(response.data?.id || '')
    } catch {
      console.error('Failed to fetch current user')
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params: any = { limit: 100 }
      if (typeFilter !== 'all') params.type = typeFilter
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await api.getTransactions(params)
      const tx =
          response?.data?.data?.transactions ??
          response?.data?.transactions ??
          response?.data ??
          []

      setTransactions(Array.isArray(tx) ? tx : [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.getTransactionStats()
      setStats(response.data || null)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchTransactions(), fetchStats()])
    setRefreshing(false)
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
        transaction?.sender?.fullName?.toLowerCase?.().includes(q) ||
        transaction?.receiver?.fullName?.toLowerCase?.().includes(q) ||
        transaction?.description?.toLowerCase?.().includes(q) ||
        transaction?.reference?.toLowerCase?.().includes(q) ||
        transaction?.type?.toLowerCase?.().includes(q) ||
        transaction?.status?.toLowerCase?.().includes(q)
    )
  })

  const getStatusConfig = (status: string) => {
    const s = status?.toUpperCase?.() || ''
    const configs = {
      COMPLETED: {
        variant: 'outline' as const,
        className: 'border-emerald-200 text-emerald-700 bg-emerald-50 font-medium',
        icon: CheckCircle2,
        label: 'Completed',
      },
      PENDING: {
        variant: 'outline' as const,
        className: 'border-amber-200 text-amber-700 bg-amber-50 font-medium',
        icon: Clock,
        label: 'Pending',
      },
      FAILED: {
        variant: 'destructive' as const,
        className: 'font-medium',
        icon: XCircle,
        label: 'Failed',
      },
      CANCELLED: {
        variant: 'outline' as const,
        className: 'border-gray-300 text-gray-600 bg-gray-50 font-medium',
        icon: AlertCircle,
        label: 'Cancelled',
      },
    }
    return configs[s as keyof typeof configs] || {
      variant: 'secondary' as const,
      className: '',
      icon: AlertCircle,
      label: status || 'Unknown',
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mx-auto"></div>
              <Activity className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Loading transactions...</p>
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
              Transactions
            </h1>
            <p className="text-muted-foreground mt-1">Track all your payment activity</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
            <div className="grid gap-4 md:grid-cols-4">
              {/* Total Transactions */}
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Total Transactions</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        {stats.totalTransactions}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Sent */}
              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-900">Total Sent</p>
                      <p className="text-2xl font-bold text-red-600 mt-2">
                        {formatCurrency(stats.totalSent)}
                      </p>
                      <p className="text-xs text-red-600/70 mt-1">
                        {stats.sentCount} transaction{stats.sentCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                      <ArrowUpRight className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Received */}
              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-900">Total Received</p>
                      <p className="text-2xl font-bold text-emerald-600 mt-2">
                        {formatCurrency(stats.totalReceived)}
                      </p>
                      <p className="text-xs text-emerald-600/70 mt-1">
                        {stats.receivedCount} transaction{stats.receivedCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <ArrowDownLeft className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Net Balance */}
              <Card className={cn(
                  "border-2 hover:shadow-lg transition-all",
                  stats.netBalance >= 0
                      ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-white"
                      : "border-red-300 bg-gradient-to-br from-red-50 to-white"
              )}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Net Balance</p>
                      <p className={cn(
                          "text-2xl font-bold mt-2",
                          stats.netBalance >= 0 ? "text-emerald-600" : "text-red-600"
                      )}>
                        {formatCurrency(stats.netBalance)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Overall flow
                      </p>
                    </div>
                    <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center",
                        stats.netBalance >= 0 ? "bg-emerald-100" : "bg-red-100"
                    )}>
                      <Wallet className={cn(
                          "h-6 w-6",
                          stats.netBalance >= 0 ? "text-emerald-600" : "text-red-600"
                      )} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}

        {/* Filters */}
        <Card className="shadow-md">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Filter className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg">Filters & Search</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                    variant={viewMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                >
                  <Receipt className="h-4 w-4" />
                </Button>
                <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
              </div>
              <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Types</option>
                <option value="BILL_PAYMENT">Bill Payment</option>
                <option value="DIRECT_TRANSFER">Direct Transfer</option>
                <option value="REFUND">Refund</option>
              </select>
              <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredTransactions.length}</span> of{' '}
                    <span className="font-semibold text-foreground">{transactions.length}</span> transactions
                  </p>
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('')
                        setTypeFilter('all')
                        setStatusFilter('all')
                      }}
                  >
                    Clear Filters
                  </Button>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Transactions */}
        {filteredTransactions.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    <Activity className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                        ? 'Try adjusting your filters to see more results'
                        : 'Your transaction history will appear here once you start making payments'}
                  </p>
                </div>
              </CardContent>
            </Card>
        ) : viewMode === 'cards' ? (
            <div className="space-y-3">
              {filteredTransactions.map((t) => {
                const isSender = t.senderId === currentUserId
                const other = isSender ? t.receiver : t.sender
                const statusConfig = getStatusConfig(t.status)
                const StatusIcon = statusConfig.icon

                return (
                    <Card key={t.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          {/* Direction Icon */}
                          <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                              isSender ? "bg-red-100" : "bg-emerald-100"
                          )}>
                            {isSender ? (
                                <ArrowUpRight className="h-6 w-6 text-red-600" />
                            ) : (
                                <ArrowDownLeft className="h-6 w-6 text-emerald-600" />
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={other?.avatar} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(other?.fullName || 'Unknown')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {isSender ? 'Sent to' : 'Received from'} {other?.fullName || 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  @{other?.username || 'n/a'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDateTime(t.createdAt)}</span>
                              {t.reference && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono">{t.reference}</span>
                                  </>
                              )}
                            </div>
                            {t.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                                  {t.description}
                                </p>
                            )}
                          </div>

                          {/* Amount & Status */}
                          <div className="text-right flex-shrink-0">
                            <p className={cn(
                                "text-2xl font-bold mb-2",
                                isSender ? "text-red-600" : "text-emerald-600"
                            )}>
                              {isSender ? '-' : '+'}
                              {formatCurrency(t.amount, t.currency)}
                            </p>
                            <Badge variant={statusConfig.variant} className={statusConfig.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-2 capitalize">
                              {(t.type || '').replace(/_/g, ' ').toLowerCase()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                )
              })}
            </div>
        ) : (
            <Card className="shadow-md">
              <CardHeader className="border-b">
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Detailed view of all transactions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b-2">
                    <tr className="text-muted-foreground">
                      <th className="py-3 px-4 text-left font-semibold">Direction</th>
                      <th className="py-3 px-4 text-left font-semibold">Counterparty</th>
                      <th className="py-3 px-4 text-left font-semibold">Type</th>
                      <th className="py-3 px-4 text-left font-semibold">Description</th>
                      <th className="py-3 px-4 text-right font-semibold">Amount</th>
                      <th className="py-3 px-4 text-left font-semibold">Status</th>
                      <th className="py-3 px-4 text-right font-semibold">Date</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {filteredTransactions.map((t) => {
                      const isSender = t.senderId === currentUserId
                      const other = isSender ? t.receiver : t.sender
                      const statusConfig = getStatusConfig(t.status)
                      const StatusIcon = statusConfig.icon

                      return (
                          <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className={cn(
                                  "inline-flex h-9 w-9 items-center justify-center rounded-lg",
                                  isSender ? "bg-red-100" : "bg-emerald-100"
                              )}>
                                {isSender ? (
                                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                                ) : (
                                    <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={other?.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(other?.fullName || 'Unknown')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{other?.fullName || 'Unknown'}</p>
                                  <p className="text-xs text-muted-foreground">@{other?.username || 'n/a'}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 capitalize">
                              {(t.type || '').replace(/_/g, ' ').toLowerCase()}
                            </td>

                            <td className="py-4 px-4">
                          <span className="line-clamp-2 text-muted-foreground">
                            {t.description || '—'}
                          </span>
                            </td>

                            <td className="py-4 px-4 text-right">
                          <span className={cn(
                              "font-bold text-lg",
                              isSender ? "text-red-600" : "text-emerald-600"
                          )}>
                            {isSender ? '-' : '+'}
                            {formatCurrency(t.amount, t.currency)}
                          </span>
                            </td>

                            <td className="py-4 px-4">
                              <Badge variant={statusConfig.variant} className={statusConfig.className}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </td>

                            <td className="py-4 px-4 text-right whitespace-nowrap text-muted-foreground">
                              {formatDateTime(t.createdAt)}
                            </td>
                          </tr>
                      )
                    })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
        )}
      </div>
  )
}
